import { prisma } from './db'
import { GauntletStatus, GauntletDuration } from '@prisma/client'
import { createNotification } from './notifications'
import { addDays, addHours } from 'date-fns'
import { recordMatchResult } from './head-to-head'

/**
 * Gauntlet System (V6)
 *
 * User-initiated 1v1 challenges where athletes compete head-to-head
 * based on Power accumulated during the challenge period.
 */

// Duration in hours for each gauntlet type
const DURATION_HOURS: Record<GauntletDuration, number> = {
  ONE_DAY: 24,
  THREE_DAYS: 72,
  ONE_WEEK: 168,
}

// Hours before a pending gauntlet expires
const PENDING_EXPIRY_HOURS = 48

export interface CreateGauntletInput {
  challengerId: string
  opponentId: string
  duration: GauntletDuration
  message?: string
}

export interface GauntletWithUsers {
  id: string
  challengerId: string
  opponentId: string
  challenger: {
    id: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
  }
  opponent: {
    id: string
    username: string | null
    displayName: string | null
    avatarUrl: string | null
  }
  duration: GauntletDuration
  message: string | null
  status: GauntletStatus
  challengerPower: number
  opponentPower: number
  startedAt: Date | null
  endsAt: Date | null
  winnerId: string | null
  createdAt: Date
}

/**
 * Create a new gauntlet challenge
 */
export async function createGauntlet(input: CreateGauntletInput): Promise<GauntletWithUsers> {
  const { challengerId, opponentId, duration, message } = input

  // Validate: Can't challenge yourself
  if (challengerId === opponentId) {
    throw new Error("You cannot challenge yourself")
  }

  // Check if there's already an active or pending gauntlet between these users
  const existingGauntlet = await prisma.gauntlet.findFirst({
    where: {
      OR: [
        { challengerId, opponentId, status: { in: ['PENDING', 'ACTIVE'] } },
        { challengerId: opponentId, opponentId: challengerId, status: { in: ['PENDING', 'ACTIVE'] } },
      ],
    },
  })

  if (existingGauntlet) {
    throw new Error("There's already an active challenge between you and this user")
  }

  // Create the gauntlet
  const gauntlet = await prisma.gauntlet.create({
    data: {
      challengerId,
      opponentId,
      duration,
      message: message?.trim() || null,
      status: 'PENDING',
    },
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  // Notify the opponent
  await createNotification({
    userId: opponentId,
    type: 'GAUNTLET_RECEIVED',
    title: 'Challenge Received!',
    message: `${gauntlet.challenger.displayName || gauntlet.challenger.username} has challenged you to a ${formatDuration(duration)} Gauntlet!`,
    actionUrl: `/gauntlet/${gauntlet.id}`,
    data: { gauntletId: gauntlet.id },
  })

  return gauntlet as GauntletWithUsers
}

/**
 * Accept a gauntlet challenge
 */
export async function acceptGauntlet(gauntletId: string, userId: string): Promise<GauntletWithUsers> {
  const gauntlet = await prisma.gauntlet.findUnique({
    where: { id: gauntletId },
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  if (!gauntlet) {
    throw new Error("Gauntlet not found")
  }

  if (gauntlet.opponentId !== userId) {
    throw new Error("You are not the opponent of this gauntlet")
  }

  if (gauntlet.status !== 'PENDING') {
    throw new Error("This gauntlet is no longer pending")
  }

  const now = new Date()
  const endsAt = addHours(now, DURATION_HOURS[gauntlet.duration])

  const updated = await prisma.gauntlet.update({
    where: { id: gauntletId },
    data: {
      status: 'ACTIVE',
      respondedAt: now,
      startedAt: now,
      endsAt,
    },
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  // Notify the challenger
  await createNotification({
    userId: gauntlet.challengerId,
    type: 'GAUNTLET_ACCEPTED',
    title: 'Challenge Accepted!',
    message: `${updated.opponent.displayName || updated.opponent.username} has accepted your Gauntlet! The challenge is ON!`,
    actionUrl: `/gauntlet/${gauntlet.id}`,
    data: { gauntletId: gauntlet.id },
  })

  return updated as GauntletWithUsers
}

/**
 * Decline a gauntlet challenge
 */
export async function declineGauntlet(gauntletId: string, userId: string): Promise<void> {
  const gauntlet = await prisma.gauntlet.findUnique({
    where: { id: gauntletId },
    include: {
      opponent: {
        select: { displayName: true, username: true },
      },
    },
  })

  if (!gauntlet) {
    throw new Error("Gauntlet not found")
  }

  if (gauntlet.opponentId !== userId) {
    throw new Error("You are not the opponent of this gauntlet")
  }

  if (gauntlet.status !== 'PENDING') {
    throw new Error("This gauntlet is no longer pending")
  }

  await prisma.gauntlet.update({
    where: { id: gauntletId },
    data: {
      status: 'DECLINED',
      respondedAt: new Date(),
    },
  })

  // Notify the challenger
  await createNotification({
    userId: gauntlet.challengerId,
    type: 'GAUNTLET_DECLINED',
    title: 'Challenge Declined',
    message: `${gauntlet.opponent.displayName || gauntlet.opponent.username} has declined your Gauntlet challenge.`,
    data: { gauntletId: gauntlet.id },
  })
}

/**
 * Cancel a pending gauntlet (only challenger can do this)
 */
export async function cancelGauntlet(gauntletId: string, userId: string): Promise<void> {
  const gauntlet = await prisma.gauntlet.findUnique({
    where: { id: gauntletId },
  })

  if (!gauntlet) {
    throw new Error("Gauntlet not found")
  }

  if (gauntlet.challengerId !== userId) {
    throw new Error("Only the challenger can cancel this gauntlet")
  }

  if (gauntlet.status !== 'PENDING') {
    throw new Error("This gauntlet is no longer pending")
  }

  await prisma.gauntlet.update({
    where: { id: gauntletId },
    data: { status: 'CANCELLED' },
  })
}

/**
 * Update gauntlet scores when a user logs an activity
 */
export async function updateGauntletScores(userId: string, activityPower: number): Promise<void> {
  // Find all active gauntlets where this user is a participant
  const activeGauntlets = await prisma.gauntlet.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { challengerId: userId },
        { opponentId: userId },
      ],
    },
  })

  for (const gauntlet of activeGauntlets) {
    const isChallenger = gauntlet.challengerId === userId

    await prisma.gauntlet.update({
      where: { id: gauntlet.id },
      data: {
        challengerPower: isChallenger
          ? { increment: activityPower }
          : undefined,
        opponentPower: !isChallenger
          ? { increment: activityPower }
          : undefined,
      },
    })
  }
}

/**
 * Finalize completed gauntlets (run via cron job)
 */
export async function finalizeGauntlets(): Promise<number> {
  const now = new Date()

  // Find all active gauntlets that have ended
  const expiredGauntlets = await prisma.gauntlet.findMany({
    where: {
      status: 'ACTIVE',
      endsAt: { lte: now },
    },
    include: {
      challenger: {
        select: { id: true, displayName: true, username: true },
      },
      opponent: {
        select: { id: true, displayName: true, username: true },
      },
    },
  })

  let finalized = 0

  for (const gauntlet of expiredGauntlets) {
    let winnerId: string | null = null
    let winnerName: string | null = null
    let loserId: string | null = null

    if (gauntlet.challengerPower > gauntlet.opponentPower) {
      winnerId = gauntlet.challengerId
      winnerName = gauntlet.challenger.displayName || gauntlet.challenger.username
      loserId = gauntlet.opponentId
    } else if (gauntlet.opponentPower > gauntlet.challengerPower) {
      winnerId = gauntlet.opponentId
      winnerName = gauntlet.opponent.displayName || gauntlet.opponent.username
      loserId = gauntlet.challengerId
    }
    // If tied, winnerId stays null

    await prisma.gauntlet.update({
      where: { id: gauntlet.id },
      data: {
        status: 'COMPLETED',
        winnerId,
      },
    })

    // Record head-to-head result
    try {
      await recordMatchResult(
        winnerId,
        loserId,
        'GAUNTLET',
        winnerId === gauntlet.challengerId ? gauntlet.challengerPower : gauntlet.opponentPower,
        loserId === gauntlet.challengerId ? gauntlet.challengerPower : gauntlet.opponentPower
      )
    } catch (e) {
      console.error('[Gauntlet] Failed to record head-to-head result:', e)
    }

    // Notify both participants
    if (winnerId) {
      await createNotification({
        userId: winnerId,
        type: 'GAUNTLET_WON',
        title: 'You Won the Gauntlet!',
        message: `Congratulations! You defeated your opponent with ${Math.round(winnerId === gauntlet.challengerId ? gauntlet.challengerPower : gauntlet.opponentPower)} Power!`,
        actionUrl: `/gauntlet/${gauntlet.id}`,
        data: { gauntletId: gauntlet.id },
      })

      await createNotification({
        userId: loserId!,
        type: 'GAUNTLET_LOST',
        title: 'Gauntlet Complete',
        message: `${winnerName} has won the Gauntlet. Better luck next time!`,
        actionUrl: `/gauntlet/${gauntlet.id}`,
        data: { gauntletId: gauntlet.id },
      })
    } else {
      // Tie - notify both
      await Promise.all([
        createNotification({
          userId: gauntlet.challengerId,
          type: 'GAUNTLET_TIE',
          title: "It's a Tie!",
          message: `Your Gauntlet ended in a tie! Both athletes gave it their all.`,
          actionUrl: `/gauntlet/${gauntlet.id}`,
          data: { gauntletId: gauntlet.id },
        }),
        createNotification({
          userId: gauntlet.opponentId,
          type: 'GAUNTLET_TIE',
          title: "It's a Tie!",
          message: `Your Gauntlet ended in a tie! Both athletes gave it their all.`,
          actionUrl: `/gauntlet/${gauntlet.id}`,
          data: { gauntletId: gauntlet.id },
        }),
      ])
    }

    finalized++
  }

  return finalized
}

/**
 * Expire pending gauntlets that weren't responded to
 */
export async function expirePendingGauntlets(): Promise<number> {
  const expiryTime = addHours(new Date(), -PENDING_EXPIRY_HOURS)

  const result = await prisma.gauntlet.updateMany({
    where: {
      status: 'PENDING',
      createdAt: { lte: expiryTime },
    },
    data: {
      status: 'EXPIRED',
    },
  })

  return result.count
}

/**
 * Get user's gauntlets (active, pending, and recent)
 */
export async function getUserGauntlets(userId: string, limit: number = 20): Promise<GauntletWithUsers[]> {
  const gauntlets = await prisma.gauntlet.findMany({
    where: {
      OR: [
        { challengerId: userId },
        { opponentId: userId },
      ],
    },
    orderBy: [
      { status: 'asc' }, // ACTIVE first, then PENDING
      { createdAt: 'desc' },
    ],
    take: limit,
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  return gauntlets as GauntletWithUsers[]
}

/**
 * Get user's active gauntlet (if any)
 */
export async function getActiveGauntlet(userId: string): Promise<GauntletWithUsers | null> {
  const gauntlet = await prisma.gauntlet.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [
        { challengerId: userId },
        { opponentId: userId },
      ],
    },
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  return gauntlet as GauntletWithUsers | null
}

/**
 * Get pending gauntlets where user is the opponent (invitations)
 */
export async function getPendingInvitations(userId: string): Promise<GauntletWithUsers[]> {
  const gauntlets = await prisma.gauntlet.findMany({
    where: {
      opponentId: userId,
      status: 'PENDING',
    },
    orderBy: { createdAt: 'desc' },
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  return gauntlets as GauntletWithUsers[]
}

/**
 * Get a specific gauntlet by ID
 */
export async function getGauntletById(gauntletId: string): Promise<GauntletWithUsers | null> {
  const gauntlet = await prisma.gauntlet.findUnique({
    where: { id: gauntletId },
    include: {
      challenger: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
      opponent: {
        select: { id: true, username: true, displayName: true, avatarUrl: true },
      },
    },
  })

  return gauntlet as GauntletWithUsers | null
}

/**
 * Get user's gauntlet stats
 */
export async function getGauntletStats(userId: string) {
  const [totalChallenges, wins, losses, ties] = await Promise.all([
    prisma.gauntlet.count({
      where: {
        status: 'COMPLETED',
        OR: [
          { challengerId: userId },
          { opponentId: userId },
        ],
      },
    }),
    prisma.gauntlet.count({
      where: {
        status: 'COMPLETED',
        winnerId: userId,
      },
    }),
    prisma.gauntlet.count({
      where: {
        status: 'COMPLETED',
        winnerId: { not: userId },
        OR: [
          { challengerId: userId },
          { opponentId: userId },
        ],
      },
    }),
    prisma.gauntlet.count({
      where: {
        status: 'COMPLETED',
        winnerId: null,
        OR: [
          { challengerId: userId },
          { opponentId: userId },
        ],
      },
    }),
  ])

  return {
    totalChallenges,
    wins,
    losses,
    ties,
    winRate: totalChallenges > 0 ? Math.round((wins / totalChallenges) * 100) : 0,
  }
}

// Helper function to format duration for display
function formatDuration(duration: GauntletDuration): string {
  switch (duration) {
    case 'ONE_DAY': return '24-hour'
    case 'THREE_DAYS': return '3-day'
    case 'ONE_WEEK': return '1-week'
    default: return duration
  }
}
