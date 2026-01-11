import { prisma } from './db'
import { SeasonStatus } from '@prisma/client'
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns'
import { createNotification } from './notifications'

/**
 * Season Mode (V6)
 *
 * Monthly competitions with:
 * - Automatic season creation
 * - Auto-enrollment on first activity
 * - Season rankings separate from all-time
 * - End-of-season rewards and badges
 */

// ============================================
// Season Lifecycle
// ============================================

/**
 * Get or create the current season
 */
export async function getCurrentSeason() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Try to find existing active season
  let season = await prisma.season.findFirst({
    where: {
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gte: now },
    },
  })

  if (!season) {
    // Check if there's an upcoming season for this month
    season = await prisma.season.findFirst({
      where: {
        startDate: { gte: monthStart, lte: monthEnd },
      },
    })

    if (!season) {
      // Create new season for this month
      season = await prisma.season.create({
        data: {
          name: format(now, 'MMMM yyyy'),
          description: `Monthly competition for ${format(now, 'MMMM yyyy')}`,
          startDate: monthStart,
          endDate: monthEnd,
          status: 'ACTIVE',
          badgeIcon: getSeasonIcon(now),
          badgeColor: getSeasonColor(now),
        },
      })
    } else if (season.status === 'UPCOMING' && now >= season.startDate) {
      // Activate the season
      season = await prisma.season.update({
        where: { id: season.id },
        data: { status: 'ACTIVE' },
      })
    }
  }

  return season
}

/**
 * Get upcoming season (next month)
 */
export async function getUpcomingSeason() {
  const nextMonth = addMonths(new Date(), 1)
  const monthStart = startOfMonth(nextMonth)
  const monthEnd = endOfMonth(nextMonth)

  let season = await prisma.season.findFirst({
    where: {
      startDate: { gte: monthStart, lte: monthEnd },
    },
  })

  if (!season) {
    // Create upcoming season
    season = await prisma.season.create({
      data: {
        name: format(nextMonth, 'MMMM yyyy'),
        description: `Monthly competition for ${format(nextMonth, 'MMMM yyyy')}`,
        startDate: monthStart,
        endDate: monthEnd,
        status: 'UPCOMING',
        badgeIcon: getSeasonIcon(nextMonth),
        badgeColor: getSeasonColor(nextMonth),
      },
    })
  }

  return season
}

/**
 * Get a specific season by ID
 */
export async function getSeasonById(seasonId: string) {
  return prisma.season.findUnique({
    where: { id: seasonId },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  })
}

/**
 * Get all active and recent seasons
 */
export async function getSeasons(limit: number = 6) {
  return prisma.season.findMany({
    where: {
      status: { in: ['ACTIVE', 'COMPLETED'] },
    },
    orderBy: { startDate: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { participants: true },
      },
    },
  })
}

// ============================================
// Season Participation
// ============================================

/**
 * Join a season (or get existing participation)
 */
export async function joinSeason(userId: string, seasonId?: string) {
  // Get current season if not specified
  const season = seasonId
    ? await prisma.season.findUnique({ where: { id: seasonId } })
    : await getCurrentSeason()

  if (!season) {
    throw new Error('Season not found')
  }

  if (season.status !== 'ACTIVE') {
    throw new Error('Cannot join a season that is not active')
  }

  // Get user's location for regional rankings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { country: true, city: true },
  })

  // Upsert participation
  const participation = await prisma.seasonParticipant.upsert({
    where: {
      seasonId_userId: {
        seasonId: season.id,
        userId,
      },
    },
    update: {},
    create: {
      seasonId: season.id,
      userId,
      country: user?.country || null,
      city: user?.city || null,
    },
    include: {
      season: true,
    },
  })

  return participation
}

/**
 * Auto-enroll user in current season on activity creation
 * This is the canonical way to join seasons - no explicit "Join" button needed.
 * Silent on errors to not block activity creation.
 *
 * @param userId - User ID
 * @param activityDate - Date of the activity (to check if it falls within an active season)
 */
export async function enrollOnFirstActivity(
  userId: string,
  activityDate: Date = new Date()
): Promise<void> {
  try {
    // Find active season that contains this activity date
    const season = await prisma.season.findFirst({
      where: {
        status: 'ACTIVE',
        startDate: { lte: activityDate },
        endDate: { gte: activityDate },
      },
    })

    if (!season) {
      // No active season for this date, nothing to do
      return
    }

    // Check if already enrolled
    const existing = await prisma.seasonParticipant.findUnique({
      where: {
        seasonId_userId: {
          seasonId: season.id,
          userId,
        },
      },
    })

    if (existing) {
      // Already enrolled, nothing to do
      return
    }

    // Get user's location for regional rankings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { country: true, city: true },
    })

    // Enroll user
    await prisma.seasonParticipant.create({
      data: {
        seasonId: season.id,
        userId,
        country: user?.country || null,
        city: user?.city || null,
      },
    })

    console.log(`[Season] Auto-enrolled user ${userId} in season ${season.name}`)
  } catch (error) {
    // Silent failure - don't block activity creation
    console.error('[Season] Auto-enroll failed:', error)
  }
}

/**
 * Get user's participation in current season
 */
export async function getUserSeasonParticipation(userId: string) {
  const season = await getCurrentSeason()
  if (!season) return null

  return prisma.seasonParticipant.findUnique({
    where: {
      seasonId_userId: {
        seasonId: season.id,
        userId,
      },
    },
    include: {
      season: true,
    },
  })
}

/**
 * Get user's season history
 */
export async function getUserSeasonHistory(userId: string, limit: number = 12) {
  return prisma.seasonParticipant.findMany({
    where: { userId },
    orderBy: { season: { startDate: 'desc' } },
    take: limit,
    include: {
      season: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          status: true,
          badgeIcon: true,
          badgeColor: true,
        },
      },
    },
  })
}

// ============================================
// Season Scores
// ============================================

/**
 * Update user's season score after an activity
 */
export async function updateSeasonScore(
  userId: string,
  activityPower: number
): Promise<void> {
  const season = await getCurrentSeason()
  if (!season) return

  // Ensure user is participating
  const participation = await joinSeason(userId, season.id)

  // Update scores
  await prisma.seasonParticipant.update({
    where: { id: participation.id },
    data: {
      totalPower: { increment: activityPower },
      activityCount: { increment: 1 },
    },
  })
}

// ============================================
// Season Leaderboard
// ============================================

export type SeasonScope = 'global' | 'country' | 'city'

/**
 * Get season leaderboard
 */
export async function getSeasonLeaderboard(
  seasonId: string,
  scope: SeasonScope = 'global',
  scopeValue?: string,
  limit: number = 50
) {
  const whereClause: any = { seasonId }

  if (scope === 'country' && scopeValue) {
    whereClause.country = scopeValue
  } else if (scope === 'city' && scopeValue) {
    whereClause.city = scopeValue
  }

  const participants = await prisma.seasonParticipant.findMany({
    where: whereClause,
    orderBy: { totalPower: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Add ranks
  return participants.map((p, index) => ({
    ...p,
    rank: index + 1,
  }))
}

/**
 * Get user's season rank
 */
export async function getUserSeasonRank(
  userId: string,
  seasonId?: string,
  scope: SeasonScope = 'global',
  scopeValue?: string
) {
  const season = seasonId
    ? await prisma.season.findUnique({ where: { id: seasonId } })
    : await getCurrentSeason()

  if (!season) return null

  const participation = await prisma.seasonParticipant.findUnique({
    where: {
      seasonId_userId: {
        seasonId: season.id,
        userId,
      },
    },
  })

  if (!participation) return null

  // Count users with higher power
  const whereClause: any = {
    seasonId: season.id,
    totalPower: { gt: participation.totalPower },
  }

  if (scope === 'country' && scopeValue) {
    whereClause.country = scopeValue
  } else if (scope === 'city' && scopeValue) {
    whereClause.city = scopeValue
  }

  const higherRanked = await prisma.seasonParticipant.count({
    where: whereClause,
  })

  // Get total in scope
  const totalWhereClause: any = { seasonId: season.id }
  if (scope === 'country' && scopeValue) {
    totalWhereClause.country = scopeValue
  } else if (scope === 'city' && scopeValue) {
    totalWhereClause.city = scopeValue
  }

  const total = await prisma.seasonParticipant.count({
    where: totalWhereClause,
  })

  return {
    rank: higherRanked + 1,
    total,
    totalPower: participation.totalPower,
    activityCount: participation.activityCount,
    previousRank: participation.previousRank,
    delta: participation.previousRank
      ? participation.previousRank - (higherRanked + 1)
      : null,
  }
}

/**
 * Get season ladder (users around the current user)
 */
export async function getSeasonLadder(
  userId: string,
  seasonId?: string,
  scope: SeasonScope = 'global',
  scopeValue?: string,
  range: number = 2
) {
  const userRank = await getUserSeasonRank(userId, seasonId, scope, scopeValue)
  if (!userRank) return null

  const season = seasonId
    ? await prisma.season.findUnique({ where: { id: seasonId } })
    : await getCurrentSeason()

  if (!season) return null

  const whereClause: any = { seasonId: season.id }
  if (scope === 'country' && scopeValue) {
    whereClause.country = scopeValue
  } else if (scope === 'city' && scopeValue) {
    whereClause.city = scopeValue
  }

  // Get entries around user's rank
  const startRank = Math.max(1, userRank.rank - range)
  const endRank = userRank.rank + range

  const entries = await prisma.seasonParticipant.findMany({
    where: whereClause,
    orderBy: { totalPower: 'desc' },
    skip: startRank - 1,
    take: endRank - startRank + 1,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return {
    season: {
      id: season.id,
      name: season.name,
      status: season.status,
    },
    scope,
    scopeValue,
    userRank: userRank.rank,
    totalInScope: userRank.total,
    entries: entries.map((e, i) => ({
      ...e,
      rank: startRank + i,
      isCurrentUser: e.userId === userId,
    })),
  }
}

// ============================================
// Season Finalization
// ============================================

/**
 * Finalize a completed season
 */
export async function finalizeSeason(seasonId: string): Promise<void> {
  const season = await prisma.season.findUnique({
    where: { id: seasonId },
  })

  if (!season || season.status !== 'ACTIVE') return

  // Check if season has ended
  if (new Date() < season.endDate) return

  // Update season status
  await prisma.season.update({
    where: { id: seasonId },
    data: { status: 'COMPLETED' },
  })

  // Get top participants for rewards
  const topParticipants = await prisma.seasonParticipant.findMany({
    where: { seasonId },
    orderBy: { totalPower: 'desc' },
    take: 100,
  })

  // Award season badges and notify winners
  for (let i = 0; i < topParticipants.length; i++) {
    const participant = topParticipants[i]
    const rank = i + 1
    const badges: string[] = []

    if (rank === 1) {
      badges.push('SEASON_CHAMPION')
    } else if (rank <= 3) {
      badges.push('SEASON_PODIUM')
    } else if (rank <= 10) {
      badges.push('SEASON_TOP_10')
    } else if (rank <= 100) {
      badges.push('SEASON_TOP_100')
    }

    // Update participant with final rank and badges
    await prisma.seasonParticipant.update({
      where: { id: participant.id },
      data: {
        rank,
        badgesEarned: badges,
      },
    })

    // Notify top finishers
    if (rank <= 10) {
      await createNotification({
        userId: participant.userId,
        type: 'BADGE_EARNED',
        title: rank === 1 ? 'Season Champion!' : `Season Finished - #${rank}`,
        message: `You finished #${rank} in ${season.name}!`,
        data: { seasonId, rank },
      })
    }
  }

  console.log(`[Season] Finalized ${season.name} with ${topParticipants.length} participants`)
}

/**
 * Process all seasons (run via cron)
 */
export async function processSeasons(): Promise<{ activated: number; finalized: number }> {
  const now = new Date()

  // Activate upcoming seasons that have started
  const toActivate = await prisma.season.findMany({
    where: {
      status: 'UPCOMING',
      startDate: { lte: now },
    },
  })

  for (const season of toActivate) {
    await prisma.season.update({
      where: { id: season.id },
      data: { status: 'ACTIVE' },
    })
  }

  // Finalize active seasons that have ended
  const toFinalize = await prisma.season.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: now },
    },
  })

  for (const season of toFinalize) {
    await finalizeSeason(season.id)
  }

  // Ensure next month's season exists
  await getUpcomingSeason()

  return {
    activated: toActivate.length,
    finalized: toFinalize.length,
  }
}

// ============================================
// Season Stats
// ============================================

/**
 * Get user's season stats overview
 */
export async function getUserSeasonStats(userId: string) {
  const [currentParticipation, history] = await Promise.all([
    getUserSeasonParticipation(userId),
    getUserSeasonHistory(userId, 12),
  ])

  const currentRank = currentParticipation
    ? await getUserSeasonRank(userId, currentParticipation.seasonId)
    : null

  // Calculate totals
  const totalSeasons = history.length
  const totalPowerAllTime = history.reduce((sum, h) => sum + h.totalPower, 0)
  const bestRank = Math.min(...history.filter((h) => h.rank).map((h) => h.rank!))
  const championsCount = history.filter((h) => h.rank === 1).length
  const podiumCount = history.filter((h) => h.rank && h.rank <= 3).length

  return {
    current: currentParticipation
      ? {
          season: currentParticipation.season,
          totalPower: currentParticipation.totalPower,
          activityCount: currentParticipation.activityCount,
          rank: currentRank?.rank ?? null,
          total: currentRank?.total ?? null,
        }
      : null,
    history,
    stats: {
      totalSeasons,
      totalPowerAllTime,
      bestRank: bestRank === Infinity ? null : bestRank,
      championsCount,
      podiumCount,
    },
  }
}

// ============================================
// Helpers
// ============================================

function getSeasonIcon(date: Date): string {
  const month = date.getMonth()
  // Winter: Dec, Jan, Feb
  if (month === 11 || month === 0 || month === 1) return 'snowflake'
  // Spring: Mar, Apr, May
  if (month >= 2 && month <= 4) return 'flower'
  // Summer: Jun, Jul, Aug
  if (month >= 5 && month <= 7) return 'sun'
  // Fall: Sep, Oct, Nov
  return 'leaf'
}

function getSeasonColor(date: Date): string {
  const month = date.getMonth()
  // Winter: cool blues
  if (month === 11 || month === 0 || month === 1) return '#3B82F6'
  // Spring: fresh greens
  if (month >= 2 && month <= 4) return '#22C55E'
  // Summer: warm oranges
  if (month >= 5 && month <= 7) return '#F59E0B'
  // Fall: rich reds
  return '#EF4444'
}
