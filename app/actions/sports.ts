"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { canAddActiveSport, getActiveSportCount } from "@/lib/mySports"

const FREE_TIER_LIMIT = 3

type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return null
  }
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })
}

/**
 * Add a new sport to the user's list as ACTIVE.
 * Respects free tier limits.
 */
export async function addSport(sportId: string): Promise<ActionResult<{ userSportId: string }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Check if user can add more active sports
  const canAdd = await canAddActiveSport(user.id)
  if (!canAdd.allowed) {
    return { success: false, error: canAdd.reason }
  }

  // Check if user already has this sport
  const existing = await prisma.userSport.findUnique({
    where: {
      userId_sportId: {
        userId: user.id,
        sportId,
      },
    },
  })

  if (existing) {
    return { success: false, error: "You already have this sport" }
  }

  // Get the next priority number
  const maxPriority = await prisma.userSport.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { priority: "desc" },
    select: { priority: true },
  })

  const nextPriority = maxPriority?.priority != null ? maxPriority.priority + 1 : 0

  const userSport = await prisma.userSport.create({
    data: {
      userId: user.id,
      sportId,
      status: "ACTIVE",
      priority: nextPriority,
    },
  })

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true, data: { userSportId: userSport.id } }
}

/**
 * Remove a sport entirely from the user's list.
 */
export async function removeSport(userSportId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const userSport = await prisma.userSport.findFirst({
    where: { id: userSportId, userId: user.id },
  })

  if (!userSport) {
    return { success: false, error: "Sport not found" }
  }

  await prisma.userSport.delete({
    where: { id: userSportId },
  })

  // Recompute priorities for remaining active sports
  await recomputePriorities(user.id)

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true }
}

/**
 * Pause a sport (move from ACTIVE to PAUSED).
 */
export async function pauseSport(userSportId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const userSport = await prisma.userSport.findFirst({
    where: { id: userSportId, userId: user.id, status: "ACTIVE" },
  })

  if (!userSport) {
    return { success: false, error: "Active sport not found" }
  }

  await prisma.userSport.update({
    where: { id: userSportId },
    data: { status: "PAUSED", priority: null },
  })

  // Recompute priorities for remaining active sports
  await recomputePriorities(user.id)

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true }
}

/**
 * Unpause a sport (move from PAUSED to ACTIVE).
 * Respects free tier limits.
 */
export async function unpauseSport(userSportId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Check if user can add more active sports
  const canAdd = await canAddActiveSport(user.id)
  if (!canAdd.allowed) {
    return { success: false, error: canAdd.reason }
  }

  const userSport = await prisma.userSport.findFirst({
    where: { id: userSportId, userId: user.id, status: "PAUSED" },
  })

  if (!userSport) {
    return { success: false, error: "Paused sport not found" }
  }

  // Get the next priority number
  const maxPriority = await prisma.userSport.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { priority: "desc" },
    select: { priority: true },
  })

  const nextPriority = maxPriority?.priority != null ? maxPriority.priority + 1 : 0

  await prisma.userSport.update({
    where: { id: userSportId },
    data: { status: "ACTIVE", priority: nextPriority },
  })

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true }
}

/**
 * Set a sport as primary (priority = 0).
 * Shifts other priorities accordingly.
 */
export async function setPrimarySport(userSportId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const userSport = await prisma.userSport.findFirst({
    where: { id: userSportId, userId: user.id, status: "ACTIVE" },
  })

  if (!userSport) {
    return { success: false, error: "Active sport not found" }
  }

  // Transaction to update priorities
  await prisma.$transaction(async (tx) => {
    // Increment priority of all sports that have priority < current sport's priority
    // (they will shift down by 1)
    await tx.userSport.updateMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
        priority: { lt: userSport.priority ?? 999, gte: 0 },
      },
      data: { priority: { increment: 1 } },
    })

    // Set this sport as primary
    await tx.userSport.update({
      where: { id: userSportId },
      data: { priority: 0 },
    })
  })

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true }
}

/**
 * Reorder active sports based on new priority order.
 * @param orderedIds - Array of userSportIds in new priority order (index = priority)
 */
export async function reorderSports(orderedIds: string[]): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  // Verify all IDs belong to this user and are active
  const userSports = await prisma.userSport.findMany({
    where: {
      id: { in: orderedIds },
      userId: user.id,
      status: "ACTIVE",
    },
  })

  if (userSports.length !== orderedIds.length) {
    return { success: false, error: "Invalid sport IDs" }
  }

  // Update priorities in transaction
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.userSport.update({
        where: { id },
        data: { priority: index },
      })
    )
  )

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true }
}

/**
 * Update skill level for a sport.
 */
export async function updateSkillLevel(
  userSportId: string,
  skillLevel: string | null
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const userSport = await prisma.userSport.findFirst({
    where: { id: userSportId, userId: user.id },
  })

  if (!userSport) {
    return { success: false, error: "Sport not found" }
  }

  await prisma.userSport.update({
    where: { id: userSportId },
    data: { skillLevel },
  })

  revalidatePath("/settings/sports")
  return { success: true }
}

/**
 * Swap an active sport with a new sport (for free tier users at limit).
 * Removes the old sport and adds the new one.
 */
export async function swapSport(
  oldUserSportId: string,
  newSportId: string
): Promise<ActionResult<{ userSportId: string }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const oldSport = await prisma.userSport.findFirst({
    where: { id: oldUserSportId, userId: user.id, status: "ACTIVE" },
  })

  if (!oldSport) {
    return { success: false, error: "Sport to swap not found" }
  }

  // Check if new sport already exists
  const existingNew = await prisma.userSport.findUnique({
    where: {
      userId_sportId: {
        userId: user.id,
        sportId: newSportId,
      },
    },
  })

  if (existingNew) {
    return { success: false, error: "You already have this sport" }
  }

  // Use transaction to swap
  const result = await prisma.$transaction(async (tx) => {
    // Delete old sport
    await tx.userSport.delete({
      where: { id: oldUserSportId },
    })

    // Create new sport with same priority
    const newSport = await tx.userSport.create({
      data: {
        userId: user.id,
        sportId: newSportId,
        status: "ACTIVE",
        priority: oldSport.priority,
      },
    })

    return newSport
  })

  revalidatePath("/settings/sports")
  revalidatePath("/activity/create")
  return { success: true, data: { userSportId: result.id } }
}

/**
 * Helper to recompute priorities for active sports after removal/pause.
 */
async function recomputePriorities(userId: string): Promise<void> {
  const activeSports = await prisma.userSport.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { priority: "asc" },
  })

  await prisma.$transaction(
    activeSports.map((sport, index) =>
      prisma.userSport.update({
        where: { id: sport.id },
        data: { priority: index },
      })
    )
  )
}

/**
 * Get whether user can add more active sports.
 */
export async function checkCanAddSport(): Promise<ActionResult<{ allowed: boolean; isPro: boolean; count: number; limit: number }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Unauthorized" }
  }

  const canAdd = await canAddActiveSport(user.id)
  const count = await getActiveSportCount(user.id)

  return {
    success: true,
    data: {
      allowed: canAdd.allowed,
      isPro: canAdd.isPro,
      count,
      limit: FREE_TIER_LIMIT,
    },
  }
}
