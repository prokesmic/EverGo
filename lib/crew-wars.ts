import { prisma } from './db'
import { CrewWarStatus, CrewWarDuration } from '@prisma/client'
import { addDays, addWeeks } from 'date-fns'
import { createNotification } from './notifications'

/**
 * Crew Wars (V6)
 *
 * Team-based competitions where teams compete head-to-head
 * based on aggregate Power from all team members.
 */

// Duration in days for each crew war type
const DURATION_DAYS: Record<CrewWarDuration, number> = {
  ONE_WEEK: 7,
  TWO_WEEKS: 14,
  ONE_MONTH: 30,
}

// Days before a pending crew war expires
const PENDING_EXPIRY_DAYS = 7

export interface CreateCrewWarInput {
  challengerTeamId: string
  opponentTeamId: string
  duration: CrewWarDuration
  message?: string
}

// ============================================
// Crew War Lifecycle
// ============================================

/**
 * Create a new crew war challenge
 */
export async function createCrewWar(input: CreateCrewWarInput) {
  const { challengerTeamId, opponentTeamId, duration, message } = input

  // Verify challenger team exists and get captain
  const challengerTeam = await prisma.team.findUnique({
    where: { id: challengerTeamId },
    include: {
      members: {
        where: { role: 'CAPTAIN' },
        include: { user: true },
        take: 1,
      },
    },
  })

  if (!challengerTeam) {
    throw new Error('Challenger team not found')
  }

  // Verify opponent team exists
  const opponentTeam = await prisma.team.findUnique({
    where: { id: opponentTeamId },
    include: {
      members: {
        where: { role: 'CAPTAIN' },
        include: { user: true },
        take: 1,
      },
    },
  })

  if (!opponentTeam) {
    throw new Error('Opponent team not found')
  }

  // Check if there's already an active crew war between these teams
  const existingWar = await prisma.crewWar.findFirst({
    where: {
      OR: [
        { challengerTeamId, opponentTeamId, status: { in: ['PENDING', 'ACTIVE'] } },
        { challengerTeamId: opponentTeamId, opponentTeamId: challengerTeamId, status: { in: ['PENDING', 'ACTIVE'] } },
      ],
    },
  })

  if (existingWar) {
    throw new Error('There is already an active or pending Crew War between these teams')
  }

  const crewWar = await prisma.crewWar.create({
    data: {
      challengerTeamId,
      opponentTeamId,
      duration,
      message,
    },
  })

  // Notify opponent team captain
  const opponentCaptain = opponentTeam.members[0]
  if (opponentCaptain) {
    await createNotification({
      userId: opponentCaptain.userId,
      type: 'TEAM_INVITE', // Reusing team notification type
      title: 'Crew War Challenge!',
      message: `${challengerTeam.name} has challenged ${opponentTeam.name} to a Crew War!`,
      data: { crewWarId: crewWar.id },
    })
  }

  return crewWar
}

/**
 * Accept a crew war challenge
 */
export async function acceptCrewWar(crewWarId: string, teamId: string) {
  const crewWar = await prisma.crewWar.findUnique({
    where: { id: crewWarId },
    include: {
      challengerTeam: true,
      opponentTeam: true,
    },
  })

  if (!crewWar) {
    throw new Error('Crew War not found')
  }

  if (crewWar.opponentTeamId !== teamId) {
    throw new Error('Only the challenged team can accept')
  }

  if (crewWar.status !== 'PENDING') {
    throw new Error('This Crew War is no longer pending')
  }

  const now = new Date()
  const durationDays = DURATION_DAYS[crewWar.duration]
  const endsAt = addDays(now, durationDays)

  const updated = await prisma.crewWar.update({
    where: { id: crewWarId },
    data: {
      status: 'ACTIVE',
      respondedAt: now,
      startedAt: now,
      endsAt,
    },
    include: {
      challengerTeam: true,
      opponentTeam: true,
    },
  })

  // Notify challenger team (find captain)
  const challengerCaptain = await prisma.teamMember.findFirst({
    where: { teamId: crewWar.challengerTeamId, role: 'CAPTAIN' },
  })

  if (challengerCaptain) {
    await createNotification({
      userId: challengerCaptain.userId,
      type: 'TEAM_INVITE',
      title: 'Crew War Accepted!',
      message: `${crewWar.opponentTeam.name} has accepted your Crew War challenge! The battle begins now!`,
      data: { crewWarId },
    })
  }

  return updated
}

/**
 * Decline a crew war challenge
 */
export async function declineCrewWar(crewWarId: string, teamId: string) {
  const crewWar = await prisma.crewWar.findUnique({
    where: { id: crewWarId },
  })

  if (!crewWar) {
    throw new Error('Crew War not found')
  }

  if (crewWar.opponentTeamId !== teamId) {
    throw new Error('Only the challenged team can decline')
  }

  if (crewWar.status !== 'PENDING') {
    throw new Error('This Crew War is no longer pending')
  }

  await prisma.crewWar.update({
    where: { id: crewWarId },
    data: {
      status: 'DECLINED',
      respondedAt: new Date(),
    },
  })
}

/**
 * Cancel a crew war (challenger only)
 */
export async function cancelCrewWar(crewWarId: string, teamId: string) {
  const crewWar = await prisma.crewWar.findUnique({
    where: { id: crewWarId },
  })

  if (!crewWar) {
    throw new Error('Crew War not found')
  }

  if (crewWar.challengerTeamId !== teamId) {
    throw new Error('Only the challenger team can cancel')
  }

  if (crewWar.status !== 'PENDING') {
    throw new Error('Cannot cancel a Crew War that has already started')
  }

  await prisma.crewWar.update({
    where: { id: crewWarId },
    data: { status: 'CANCELLED' },
  })
}

// ============================================
// Score Updates
// ============================================

/**
 * Update crew war scores when a team member logs an activity
 */
export async function updateCrewWarScores(
  userId: string,
  activityPower: number
): Promise<void> {
  // Find user's team(s)
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    select: { teamId: true },
  })

  if (memberships.length === 0) return

  const teamIds = memberships.map((m) => m.teamId)

  // Find all active crew wars involving these teams
  const activeWars = await prisma.crewWar.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { challengerTeamId: { in: teamIds } },
        { opponentTeamId: { in: teamIds } },
      ],
    },
  })

  // Update scores for each active war
  for (const war of activeWars) {
    const isChallenger = teamIds.includes(war.challengerTeamId)
    const isOpponent = teamIds.includes(war.opponentTeamId)

    if (isChallenger) {
      await prisma.crewWar.update({
        where: { id: war.id },
        data: {
          challengerPower: { increment: activityPower },
          challengerParticipants: { increment: 1 },
        },
      })
    }

    if (isOpponent) {
      await prisma.crewWar.update({
        where: { id: war.id },
        data: {
          opponentPower: { increment: activityPower },
          opponentParticipants: { increment: 1 },
        },
      })
    }
  }
}

// ============================================
// Crew War Queries
// ============================================

/**
 * Get active crew war for a team
 */
export async function getActiveCrewWar(teamId: string) {
  return prisma.crewWar.findFirst({
    where: {
      status: 'ACTIVE',
      OR: [
        { challengerTeamId: teamId },
        { opponentTeamId: teamId },
      ],
    },
    include: {
      challengerTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
      opponentTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
    },
  })
}

/**
 * Get pending crew war invitations for a team
 */
export async function getPendingCrewWarInvitations(teamId: string) {
  return prisma.crewWar.findMany({
    where: {
      opponentTeamId: teamId,
      status: 'PENDING',
    },
    include: {
      challengerTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get crew war history for a team
 */
export async function getTeamCrewWarHistory(teamId: string, limit: number = 20) {
  return prisma.crewWar.findMany({
    where: {
      status: 'COMPLETED',
      OR: [
        { challengerTeamId: teamId },
        { opponentTeamId: teamId },
      ],
    },
    include: {
      challengerTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
      opponentTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
      winnerTeam: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

/**
 * Get crew war by ID
 */
export async function getCrewWarById(crewWarId: string) {
  return prisma.crewWar.findUnique({
    where: { id: crewWarId },
    include: {
      challengerTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true, memberCount: true },
      },
      opponentTeam: {
        select: { id: true, name: true, slug: true, logoUrl: true, memberCount: true },
      },
      winnerTeam: {
        select: { id: true, name: true },
      },
    },
  })
}

/**
 * Get team's crew war stats
 */
export async function getTeamCrewWarStats(teamId: string) {
  const wars = await prisma.crewWar.findMany({
    where: {
      status: 'COMPLETED',
      OR: [
        { challengerTeamId: teamId },
        { opponentTeamId: teamId },
      ],
    },
    select: {
      winnerTeamId: true,
      challengerTeamId: true,
      opponentTeamId: true,
    },
  })

  let wins = 0
  let losses = 0
  let ties = 0

  for (const war of wars) {
    if (war.winnerTeamId === teamId) {
      wins++
    } else if (war.winnerTeamId === null) {
      ties++
    } else {
      losses++
    }
  }

  return {
    totalWars: wars.length,
    wins,
    losses,
    ties,
    winRate: wars.length > 0 ? Math.round((wins / wars.length) * 100) : 0,
  }
}

// ============================================
// Cron Jobs
// ============================================

/**
 * Finalize completed crew wars
 */
export async function finalizeCrewWars(): Promise<number> {
  const now = new Date()

  const expiredWars = await prisma.crewWar.findMany({
    where: {
      status: 'ACTIVE',
      endsAt: { lte: now },
    },
    include: {
      challengerTeam: true,
      opponentTeam: true,
    },
  })

  let finalized = 0

  for (const war of expiredWars) {
    let winnerTeamId: string | null = null

    if (war.challengerPower > war.opponentPower) {
      winnerTeamId = war.challengerTeamId
    } else if (war.opponentPower > war.challengerPower) {
      winnerTeamId = war.opponentTeamId
    }

    await prisma.crewWar.update({
      where: { id: war.id },
      data: {
        status: 'COMPLETED',
        winnerTeamId,
      },
    })

    // Notify both team captains
    const [challengerCaptain, opponentCaptain] = await Promise.all([
      prisma.teamMember.findFirst({
        where: { teamId: war.challengerTeamId, role: 'CAPTAIN' },
      }),
      prisma.teamMember.findFirst({
        where: { teamId: war.opponentTeamId, role: 'CAPTAIN' },
      }),
    ])

    const winnerName = winnerTeamId === war.challengerTeamId
      ? war.challengerTeam.name
      : winnerTeamId === war.opponentTeamId
        ? war.opponentTeam.name
        : null

    if (challengerCaptain) {
      await createNotification({
        userId: challengerCaptain.userId,
        type: 'TEAM_POST',
        title: winnerTeamId === war.challengerTeamId
          ? 'Crew War Victory!'
          : winnerTeamId
            ? 'Crew War Complete'
            : 'Crew War Tie!',
        message: winnerName
          ? `${winnerName} has won the Crew War!`
          : 'The Crew War ended in a tie!',
        data: { crewWarId: war.id },
      })
    }

    if (opponentCaptain) {
      await createNotification({
        userId: opponentCaptain.userId,
        type: 'TEAM_POST',
        title: winnerTeamId === war.opponentTeamId
          ? 'Crew War Victory!'
          : winnerTeamId
            ? 'Crew War Complete'
            : 'Crew War Tie!',
        message: winnerName
          ? `${winnerName} has won the Crew War!`
          : 'The Crew War ended in a tie!',
        data: { crewWarId: war.id },
      })
    }

    finalized++
  }

  return finalized
}

/**
 * Expire pending crew wars
 */
export async function expirePendingCrewWars(): Promise<number> {
  const expiryDate = addDays(new Date(), -PENDING_EXPIRY_DAYS)

  const result = await prisma.crewWar.updateMany({
    where: {
      status: 'PENDING',
      createdAt: { lt: expiryDate },
    },
    data: {
      status: 'CANCELLED',
    },
  })

  return result.count
}
