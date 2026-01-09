import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { startOfWeek } from 'date-fns'

export type RankScope = 'global' | 'country' | 'city' | 'friends'

export interface RankLadderEntry {
  userId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  score: number
  rank: number
  delta: number // Change from last week
  isCurrentUser: boolean
}

export interface RankLadderData {
  scope: RankScope
  scopeValue: string | null // e.g., "Prague" for city scope
  userRank: number | null
  totalInScope: number
  entries: RankLadderEntry[] // ±2 around user (5 entries)
  pointsToNextRank: number | null
  pointsBehindPrevRank: number | null
}

async function _getRankLadder(
  userId: string,
  scope: RankScope,
  scopeValue?: string
): Promise<RankLadderData> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  // Build where clause based on scope
  type WhereClause = {
    weekStart: Date
    user?: { country?: string; city?: string }
    userId?: { in: string[] }
  }

  const whereClause: WhereClause = { weekStart }

  if (scope === 'country' && scopeValue) {
    whereClause.user = { country: scopeValue }
  } else if (scope === 'city' && scopeValue) {
    whereClause.user = { city: scopeValue }
  } else if (scope === 'friends') {
    // Get user's following list
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })
    const friendIds = [userId, ...following.map(f => f.followingId)]
    whereClause.userId = { in: friendIds }
  }
  // global = no additional filter

  // Get all power scores for this week in scope, ordered by power desc
  const allScores = await prisma.weeklyPower.findMany({
    where: whereClause,
    orderBy: { totalPower: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      }
    }
  })

  // Get last week scores for delta calculation
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const lastWeekScores = await prisma.weeklyPower.findMany({
    where: {
      ...whereClause,
      weekStart: lastWeekStart
    },
    select: { userId: true, totalPower: true }
  })

  const lastWeekMap = new Map(lastWeekScores.map(s => [s.userId, s.totalPower]))

  // Find user's position
  const userIndex = allScores.findIndex(s => s.userId === userId)
  const userRank = userIndex >= 0 ? userIndex + 1 : null

  // Get ±2 entries around user (5 total)
  let startIndex = 0
  let endIndex = Math.min(5, allScores.length)

  if (userIndex >= 0) {
    startIndex = Math.max(0, userIndex - 2)
    endIndex = Math.min(allScores.length, userIndex + 3)

    // Adjust if near edges
    if (endIndex - startIndex < 5) {
      if (startIndex === 0) {
        endIndex = Math.min(5, allScores.length)
      } else {
        startIndex = Math.max(0, endIndex - 5)
      }
    }
  }

  const entries: RankLadderEntry[] = allScores
    .slice(startIndex, endIndex)
    .map((score, idx) => {
      const lastWeekPower = lastWeekMap.get(score.userId) ?? 0
      const delta = Math.round(score.totalPower - lastWeekPower)

      return {
        userId: score.userId,
        username: score.user.username,
        displayName: score.user.displayName,
        avatarUrl: score.user.avatarUrl,
        score: Math.round(score.totalPower),
        rank: startIndex + idx + 1,
        delta,
        isCurrentUser: score.userId === userId
      }
    })

  // Calculate points to next/behind
  let pointsToNextRank: number | null = null
  let pointsBehindPrevRank: number | null = null

  if (userIndex > 0) {
    pointsBehindPrevRank = Math.round(
      allScores[userIndex - 1].totalPower - allScores[userIndex].totalPower
    )
  }
  if (userIndex >= 0 && userIndex < allScores.length - 1) {
    pointsToNextRank = Math.round(
      allScores[userIndex].totalPower - allScores[userIndex + 1].totalPower
    )
  }

  return {
    scope,
    scopeValue: scopeValue ?? null,
    userRank,
    totalInScope: allScores.length,
    entries,
    pointsToNextRank,
    pointsBehindPrevRank
  }
}

export const getRankLadder = unstable_cache(
  _getRankLadder,
  ['rank-ladder'],
  { revalidate: 60 } // 1 minute cache
)

/**
 * Get user's rank data for all scopes
 */
export async function getUserRankScopes(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { city: true, country: true }
  })

  const [global, country, city] = await Promise.all([
    getRankLadder(userId, 'global'),
    user?.country ? getRankLadder(userId, 'country', user.country) : null,
    user?.city ? getRankLadder(userId, 'city', user.city) : null
  ])

  return {
    global: {
      rank: global.userRank,
      total: global.totalInScope,
      scopeValue: null
    },
    country: {
      rank: country?.userRank ?? null,
      total: country?.totalInScope ?? 0,
      scopeValue: user?.country ?? null
    },
    city: {
      rank: city?.userRank ?? null,
      total: city?.totalInScope ?? 0,
      scopeValue: user?.city ?? null
    }
  }
}
