"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { RivalryMode, RivalryMetric, RivalryVisibility, RivalryStatus } from "@prisma/client"

// =============================================================================
// TYPES
// =============================================================================

export type CreateRivalryInput = {
  opponentUserId: string
  sportSlug: string
  sportSubtype?: string
  mode: RivalryMode
  metric: RivalryMetric
  benchmarkId?: string
  windowDays?: number
  visibility?: RivalryVisibility
}

export type RivalryActionResult = {
  success: boolean
  rivalryId?: string
  error?: string
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createRivalrySchema = z.object({
  opponentUserId: z.string().min(1, "Opponent is required"),
  sportSlug: z.string().min(1, "Sport is required"),
  sportSubtype: z.string().optional(),
  mode: z.nativeEnum(RivalryMode),
  metric: z.nativeEnum(RivalryMetric),
  benchmarkId: z.string().optional(),
  windowDays: z.number().min(1).max(90).default(7),
  visibility: z.nativeEnum(RivalryVisibility).default(RivalryVisibility.FRIENDS),
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return prisma.user.findUnique({ where: { email: session.user.email } })
}

function getDefaultWindowDays(sportSlug: string): number {
  // Category-based defaults per spec
  const sprintSports = ["swimming", "athletics"]
  const enduranceSports = ["running", "cycling", "triathlon"]

  if (sprintSports.includes(sportSlug)) return 14
  if (enduranceSports.includes(sportSlug)) return 7
  return 7 // default
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * createRivalry
 * Creates a new rivalry challenge invitation
 * - Sets status to PENDING
 * - Sets invite expiry to 48 hours
 * - Creates RivalryParticipant entries for both users
 */
export async function createRivalry(input: CreateRivalryInput): Promise<RivalryActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate input
    const validatedData = createRivalrySchema.parse(input)

    // Check opponent exists
    const opponent = await prisma.user.findUnique({
      where: { id: validatedData.opponentUserId },
    })
    if (!opponent) {
      return { success: false, error: "Opponent not found" }
    }

    // Can't challenge yourself
    if (opponent.id === user.id) {
      return { success: false, error: "Cannot challenge yourself" }
    }

    // Check for existing pending/active rivalry between these users for same sport
    const existingRivalry = await prisma.rivalry.findFirst({
      where: {
        sportSlug: validatedData.sportSlug,
        status: { in: [RivalryStatus.PENDING, RivalryStatus.ACTIVE] },
        participants: {
          some: { userId: user.id },
        },
        AND: {
          participants: {
            some: { userId: validatedData.opponentUserId },
          },
        },
      },
    })

    if (existingRivalry) {
      return { success: false, error: "You already have an active rivalry with this user for this sport" }
    }

    // Calculate window dates
    const windowDays = validatedData.windowDays || getDefaultWindowDays(validatedData.sportSlug)
    const now = new Date()
    const windowStart = now
    const windowEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000)
    const inviteExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours

    // Create rivalry with participants in a transaction
    const rivalry = await prisma.$transaction(async (tx) => {
      const newRivalry = await tx.rivalry.create({
        data: {
          status: RivalryStatus.PENDING,
          sportSlug: validatedData.sportSlug,
          sportSubtype: validatedData.sportSubtype,
          mode: validatedData.mode,
          metric: validatedData.metric,
          benchmarkId: validatedData.benchmarkId,
          windowStart,
          windowEnd,
          inviteExpiresAt,
          visibility: validatedData.visibility,
          createdByUserId: user.id,
          participants: {
            create: [
              {
                userId: user.id,
                isCreator: true,
                isAccepted: true, // Creator auto-accepts
                acceptedAt: now,
                joinedAt: now,
              },
              {
                userId: validatedData.opponentUserId,
                isCreator: false,
                isAccepted: false,
              },
            ],
          },
        },
      })

      return newRivalry
    })

    // TODO: Send notification to opponent

    revalidatePath("/rivalries")
    revalidatePath("/home")

    return { success: true, rivalryId: rivalry.id }
  } catch (error) {
    console.error("Error creating rivalry:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Invalid input" }
    }
    return { success: false, error: "Failed to create rivalry" }
  }
}

/**
 * acceptRivalry
 * Opponent accepts the rivalry invitation
 * - Changes status from PENDING to ACTIVE
 * - Resets window dates to start from acceptance
 */
export async function acceptRivalry(rivalryId: string): Promise<RivalryActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const rivalry = await prisma.rivalry.findUnique({
      where: { id: rivalryId },
      include: { participants: true },
    })

    if (!rivalry) {
      return { success: false, error: "Rivalry not found" }
    }

    if (rivalry.status !== RivalryStatus.PENDING) {
      return { success: false, error: "Rivalry is no longer pending" }
    }

    // Check user is a participant (but not creator)
    const participant = rivalry.participants.find(
      (p) => p.userId === user.id && !p.isCreator
    )
    if (!participant) {
      return { success: false, error: "You are not invited to this rivalry" }
    }

    // Check invite hasn't expired
    if (new Date() > rivalry.inviteExpiresAt) {
      await prisma.rivalry.update({
        where: { id: rivalryId },
        data: { status: RivalryStatus.EXPIRED },
      })
      return { success: false, error: "Rivalry invitation has expired" }
    }

    // Calculate new window dates from now
    const now = new Date()
    const windowDuration = rivalry.windowEnd.getTime() - rivalry.windowStart.getTime()
    const newWindowEnd = new Date(now.getTime() + windowDuration)

    // Update rivalry and participant
    await prisma.$transaction([
      prisma.rivalry.update({
        where: { id: rivalryId },
        data: {
          status: RivalryStatus.ACTIVE,
          windowStart: now,
          windowEnd: newWindowEnd,
        },
      }),
      prisma.rivalryParticipant.update({
        where: { id: participant.id },
        data: {
          isAccepted: true,
          acceptedAt: now,
          joinedAt: now,
        },
      }),
    ])

    // TODO: Send notification to creator

    revalidatePath("/rivalries")
    revalidatePath("/home")

    return { success: true, rivalryId }
  } catch (error) {
    console.error("Error accepting rivalry:", error)
    return { success: false, error: "Failed to accept rivalry" }
  }
}

/**
 * declineRivalry
 * Opponent declines the rivalry invitation
 * - Changes status to CANCELLED
 */
export async function declineRivalry(rivalryId: string): Promise<RivalryActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const rivalry = await prisma.rivalry.findUnique({
      where: { id: rivalryId },
      include: { participants: true },
    })

    if (!rivalry) {
      return { success: false, error: "Rivalry not found" }
    }

    if (rivalry.status !== RivalryStatus.PENDING) {
      return { success: false, error: "Rivalry is no longer pending" }
    }

    // Check user is the invited participant
    const participant = rivalry.participants.find(
      (p) => p.userId === user.id && !p.isCreator
    )
    if (!participant) {
      return { success: false, error: "You are not invited to this rivalry" }
    }

    await prisma.rivalry.update({
      where: { id: rivalryId },
      data: { status: RivalryStatus.CANCELLED },
    })

    // TODO: Send notification to creator

    revalidatePath("/rivalries")
    revalidatePath("/home")

    return { success: true, rivalryId }
  } catch (error) {
    console.error("Error declining rivalry:", error)
    return { success: false, error: "Failed to decline rivalry" }
  }
}

/**
 * cancelRivalry
 * Creator cancels their own rivalry (only if PENDING)
 */
export async function cancelRivalry(rivalryId: string): Promise<RivalryActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const rivalry = await prisma.rivalry.findUnique({
      where: { id: rivalryId },
      include: { participants: true },
    })

    if (!rivalry) {
      return { success: false, error: "Rivalry not found" }
    }

    if (rivalry.status !== RivalryStatus.PENDING) {
      return { success: false, error: "Can only cancel pending rivalries" }
    }

    // Check user is the creator
    if (rivalry.createdByUserId !== user.id) {
      return { success: false, error: "Only the creator can cancel this rivalry" }
    }

    await prisma.rivalry.update({
      where: { id: rivalryId },
      data: { status: RivalryStatus.CANCELLED },
    })

    revalidatePath("/rivalries")
    revalidatePath("/home")

    return { success: true, rivalryId }
  } catch (error) {
    console.error("Error cancelling rivalry:", error)
    return { success: false, error: "Failed to cancel rivalry" }
  }
}

/**
 * getRivalry
 * Get rivalry details with participants
 */
export async function getRivalry(rivalryId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const rivalry = await prisma.rivalry.findUnique({
      where: { id: rivalryId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        createdByUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!rivalry) return null

    // Check user has access
    const isParticipant = rivalry.participants.some((p) => p.userId === user.id)
    if (!isParticipant && rivalry.visibility === RivalryVisibility.PRIVATE) {
      return null
    }

    return rivalry
  } catch (error) {
    console.error("Error getting rivalry:", error)
    return null
  }
}

/**
 * getUserRivalries
 * Get all rivalries for the current user
 */
export async function getUserRivalries(options?: {
  status?: RivalryStatus | RivalryStatus[]
  limit?: number
}) {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const statusFilter = options?.status
      ? Array.isArray(options.status)
        ? { in: options.status }
        : options.status
      : undefined

    const rivalries = await prisma.rivalry.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
        ...(statusFilter && { status: statusFilter }),
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: options?.limit,
    })

    return rivalries
  } catch (error) {
    console.error("Error getting user rivalries:", error)
    return []
  }
}

/**
 * getPendingRivalryInvites
 * Get pending rivalry invites for the current user (where they are the invitee)
 */
export async function getPendingRivalryInvites() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const rivalries = await prisma.rivalry.findMany({
      where: {
        status: RivalryStatus.PENDING,
        participants: {
          some: {
            userId: user.id,
            isCreator: false,
            isAccepted: false,
          },
        },
        inviteExpiresAt: { gt: new Date() },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        createdByUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return rivalries
  } catch (error) {
    console.error("Error getting pending rivalry invites:", error)
    return []
  }
}
