import { prisma } from './db'

/**
 * Incremental Rankings System (V10)
 *
 * Instead of recalculating ALL rankings every cron run, this system:
 * 1. Finds activities that haven't been ranked yet (rankedAt IS NULL)
 * 2. Updates only affected users' sport indexes
 * 3. Re-ranks only the relevant scope(s)
 * 4. Marks activities as ranked
 *
 * This reduces database load from O(all_users) to O(affected_users).
 */

interface IncrementalResult {
  processedActivities: number
  affectedUsers: number
  rerankedScopes: string[]
}

/**
 * Process unranked activities and update only affected rankings
 */
export async function processIncrementalRankings(): Promise<IncrementalResult> {
  const result: IncrementalResult = {
    processedActivities: 0,
    affectedUsers: 0,
    rerankedScopes: [],
  }

  // 1. Find activities that haven't been ranked yet
  const unrankedActivities = await prisma.activity.findMany({
    where: { rankedAt: null },
    include: {
      user: {
        select: { city: true, country: true },
      },
    },
    take: 1000, // Process in batches to avoid memory issues
  })

  if (unrankedActivities.length === 0) {
    console.log('[Rankings] No unranked activities to process')
    return result
  }

  result.processedActivities = unrankedActivities.length

  // 2. Get unique affected users and their locations
  const affectedUserIds = [...new Set(unrankedActivities.map((a) => a.userId))]
  result.affectedUsers = affectedUserIds.length

  const affectedScopes = new Set<string>(['GLOBAL'])
  const citiesMap = new Map<string, string[]>() // city -> userIds
  const countriesMap = new Map<string, string[]>() // country -> userIds

  for (const activity of unrankedActivities) {
    if (activity.user.city) {
      affectedScopes.add(`CITY:${activity.user.city}`)
      const existing = citiesMap.get(activity.user.city) || []
      existing.push(activity.userId)
      citiesMap.set(activity.user.city, existing)
    }
    if (activity.user.country) {
      affectedScopes.add(`COUNTRY:${activity.user.country}`)
      const existing = countriesMap.get(activity.user.country) || []
      existing.push(activity.userId)
      countriesMap.set(activity.user.country, existing)
    }
  }

  console.log(`[Rankings] Processing ${result.processedActivities} activities for ${result.affectedUsers} users`)

  // 3. Update sport indexes for affected users only
  for (const userId of affectedUserIds) {
    await updateUserSportIndex(userId)
  }

  // 4. Re-rank only affected scopes
  // Global: always re-rank (fastest - just position update)
  await reRankScope('GLOBAL', null)
  result.rerankedScopes.push('GLOBAL')

  // Countries: only re-rank affected countries
  for (const country of countriesMap.keys()) {
    await reRankScope('COUNTRY', country)
    result.rerankedScopes.push(`COUNTRY:${country}`)
  }

  // Cities: only re-rank affected cities
  for (const city of citiesMap.keys()) {
    await reRankScope('CITY', city)
    result.rerankedScopes.push(`CITY:${city}`)
  }

  // 5. Mark activities as ranked
  const activityIds = unrankedActivities.map((a) => a.id)
  await prisma.activity.updateMany({
    where: { id: { in: activityIds } },
    data: { rankedAt: new Date() },
  })

  console.log(`[Rankings] Incremental update complete: ${result.processedActivities} activities, ${result.affectedUsers} users, ${result.rerankedScopes.length} scopes`)

  return result
}

/**
 * Update a single user's sport index (simplified calculation)
 */
async function updateUserSportIndex(userId: string): Promise<void> {
  // Get user's recent activity data for scoring
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)

  const [recentActivities, streakData, sportsCount, teamCount] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, activityDate: { gte: fourWeeksAgo } },
      select: { durationSeconds: true, distanceMeters: true, power: true },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),
    prisma.userSport.count({
      where: { userId, status: 'ACTIVE' },
    }),
    prisma.teamMember.count({
      where: { userId },
    }),
  ])

  // Calculate sport index components
  const activitiesPerWeek = recentActivities.length / 4
  const frequencyScore = Math.min(200, activitiesPerWeek * 25) // max 200

  const totalPower = recentActivities.reduce((sum, a) => sum + (a.power ?? 0), 0)
  const performanceScore = Math.min(400, totalPower / 10) // max 400

  const streak = streakData?.currentStreak ?? 0
  const streakScore = Math.min(150, streak * 5) // max 150

  const varietyScore = Math.min(100, sportsCount * 25) // max 100

  const socialScore = Math.min(50, teamCount * 10) // max 50

  const newIndex = Math.round(frequencyScore + performanceScore + streakScore + varietyScore + socialScore)

  // Upsert user stats
  await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      sportIndex: newIndex,
      sportIndexBest: newIndex,
    },
    update: {
      sportIndex: newIndex,
      sportIndexBest: { increment: 0 }, // Will be handled by max comparison
    },
  })

  // Update best if needed
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    select: { sportIndexBest: true },
  })
  if (stats && newIndex > stats.sportIndexBest) {
    await prisma.userStats.update({
      where: { userId },
      data: { sportIndexBest: newIndex },
    })
  }
}

/**
 * Re-rank a specific scope (much faster than full recalculation)
 */
async function reRankScope(scope: 'GLOBAL' | 'COUNTRY' | 'CITY', scopeValue: string | null): Promise<void> {
  const whereClause: Record<string, unknown> = {}

  if (scope === 'COUNTRY' && scopeValue) {
    whereClause.country = scopeValue
  } else if (scope === 'CITY' && scopeValue) {
    whereClause.city = scopeValue
  }

  const users = await prisma.userStats.findMany({
    where: whereClause,
    orderBy: { sportIndex: 'desc' },
    select: { userId: true },
  })

  // Update ranks in batches
  const rankField = scope === 'GLOBAL' ? 'globalRank' : scope === 'COUNTRY' ? 'countryRank' : 'cityRank'

  // Use a single transaction for efficiency
  const updates = users.map((user, index) =>
    prisma.userStats.update({
      where: { userId: user.userId },
      data: { [rankField]: index + 1 },
    })
  )

  // Execute in batches of 100
  for (let i = 0; i < updates.length; i += 100) {
    await prisma.$transaction(updates.slice(i, i + 100))
  }
}

/**
 * Check if there are any unranked activities
 */
export async function hasUnrankedActivities(): Promise<boolean> {
  const count = await prisma.activity.count({
    where: { rankedAt: null },
  })
  return count > 0
}

/**
 * Get count of unranked activities (for monitoring)
 */
export async function getUnrankedActivityCount(): Promise<number> {
  return prisma.activity.count({
    where: { rankedAt: null },
  })
}
