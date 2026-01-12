/**
 * MultiSport Index Computation (Podium Points Method)
 *
 * Calculates a world-class multi-sport athlete score based on
 * the user's percentile ranking across multiple sports.
 *
 * Algorithm:
 * 1. For each sport where user has >= 5 activities, compute percentile
 * 2. Take top 3 sports with weighting: 1st * 1.0, 2nd * 0.75, 3rd * 0.50
 * 3. Apply variety bonus for additional sports (up to 5 sports)
 * 4. Clamp final score to [0, 1000]
 *
 * This rewards athletes who excel in multiple sports while
 * maintaining quality in their primary sports.
 */

import { prisma } from "@/lib/db"
import { subDays } from "date-fns"
import { getSportConfig } from "@/lib/sports/config"
import { normalizeSportSlug } from "@/lib/sports/normalizeSportSlug"

// =============================================================================
// TYPES
// =============================================================================

export interface MultiSportScore {
  /** Final multi-sport index (0-1000) */
  index: number
  /** Breakdown by sport */
  sports: SportScore[]
  /** Number of eligible sports */
  eligibleSports: number
  /** Variety bonus applied */
  varietyBonus: number
}

export interface SportScore {
  sportSlug: string
  sportName: string
  /** User's percentile in this sport (0-1) */
  percentile: number
  /** Number of activities in this sport */
  activityCount: number
  /** Rank position (1 = best sport) */
  position: number
  /** Weight applied (1.0, 0.75, 0.50, or 0 for bonus) */
  weight: number
  /** Contribution to final score */
  contribution: number
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  /** Minimum activities to be eligible in a sport */
  MIN_ACTIVITIES: 5,
  /** Maximum sports to consider for base score */
  TOP_SPORTS_COUNT: 3,
  /** Weights for top 3 sports */
  WEIGHTS: [1.0, 0.75, 0.50],
  /** Variety bonus per additional sport (4th, 5th) */
  VARIETY_BONUS_PER_SPORT: 0.05,
  /** Maximum variety bonus sports */
  MAX_VARIETY_BONUS_SPORTS: 2,
  /** Minimum percentile to qualify for variety bonus */
  VARIETY_BONUS_THRESHOLD: 0.5,
  /** Maximum final score */
  MAX_SCORE: 1000,
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export async function computeMultiSportIndex(
  userId: string,
  range: "week" | "month" | "year" | "all" = "all"
): Promise<MultiSportScore> {
  // Get date range
  const end = new Date()
  let start: Date

  switch (range) {
    case "week":
      start = subDays(end, 7)
      break
    case "month":
      start = subDays(end, 30)
      break
    case "year":
      start = subDays(end, 365)
      break
    case "all":
    default:
      start = new Date(0)
  }

  // 1. Get user's activity counts per sport
  const sportActivities = await prisma.$queryRaw<
    Array<{
      sportId: string
      sportSlug: string
      sportName: string
      activityCount: bigint
    }>
  >`
    SELECT
      s.id as "sportId",
      s.slug as "sportSlug",
      s.name as "sportName",
      COUNT(a.id) as "activityCount"
    FROM "Activity" a
    JOIN "Discipline" d ON a."disciplineId" = d.id
    JOIN "Sport" s ON d."sportId" = s.id
    WHERE a."userId" = ${userId}
      AND a."activityDate" >= ${start}
      AND a."activityDate" <= ${end}
    GROUP BY s.id, s.slug, s.name
    HAVING COUNT(a.id) >= ${CONFIG.MIN_ACTIVITIES}
    ORDER BY COUNT(a.id) DESC
  `

  // 2. For each eligible sport, compute percentile
  const sportScores: SportScore[] = []

  for (const sport of sportActivities) {
    const normalizedSlug = normalizeSportSlug(sport.sportSlug) ?? sport.sportSlug
    const config = getSportConfig(normalizedSlug)
    const primaryMetric = config.primaryMetric

    // Get user's value for the primary metric
    const userValue = await getUserMetricValue(
      userId,
      sport.sportId,
      primaryMetric,
      start,
      end
    )

    if (userValue === null) {
      // No value for primary metric, use activity-based percentile
      const percentile = await computeActivityPercentile(
        userId,
        sport.sportId,
        start,
        end
      )

      sportScores.push({
        sportSlug: normalizedSlug,
        sportName: sport.sportName,
        percentile,
        activityCount: Number(sport.activityCount),
        position: 0, // Will be set later
        weight: 0,
        contribution: 0,
      })
    } else {
      // Compute percentile based on primary metric
      const metric = config.rankingMetrics.find((m) => m.key === primaryMetric)
      const higherIsBetter = metric?.higherIsBetter ?? true

      const percentile = await computeMetricPercentile(
        userValue,
        sport.sportId,
        primaryMetric,
        higherIsBetter,
        start,
        end
      )

      sportScores.push({
        sportSlug: normalizedSlug,
        sportName: sport.sportName,
        percentile,
        activityCount: Number(sport.activityCount),
        position: 0,
        weight: 0,
        contribution: 0,
      })
    }
  }

  // 3. Sort by percentile (best first) and assign positions
  sportScores.sort((a, b) => b.percentile - a.percentile)
  sportScores.forEach((score, idx) => {
    score.position = idx + 1
  })

  // 4. Calculate base score from top 3 sports
  let baseScore = 0
  const topSports = sportScores.slice(0, CONFIG.TOP_SPORTS_COUNT)

  topSports.forEach((sport, idx) => {
    const weight = CONFIG.WEIGHTS[idx] ?? 0
    sport.weight = weight
    sport.contribution = sport.percentile * weight * CONFIG.MAX_SCORE
    baseScore += sport.contribution
  })

  // 5. Apply variety bonus for additional sports
  let varietyBonus = 0
  const bonusSports = sportScores.slice(
    CONFIG.TOP_SPORTS_COUNT,
    CONFIG.TOP_SPORTS_COUNT + CONFIG.MAX_VARIETY_BONUS_SPORTS
  )

  for (const sport of bonusSports) {
    if (sport.percentile >= CONFIG.VARIETY_BONUS_THRESHOLD) {
      varietyBonus += CONFIG.VARIETY_BONUS_PER_SPORT
      sport.weight = CONFIG.VARIETY_BONUS_PER_SPORT
      sport.contribution = baseScore * CONFIG.VARIETY_BONUS_PER_SPORT
    }
  }

  // 6. Calculate final score
  const rawScore = baseScore * (1 + varietyBonus)
  const finalScore = Math.min(Math.round(rawScore), CONFIG.MAX_SCORE)

  return {
    index: finalScore,
    sports: sportScores,
    eligibleSports: sportScores.length,
    varietyBonus,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get user's value for a specific metric in a sport
 */
async function getUserMetricValue(
  userId: string,
  sportId: string,
  metricKey: string,
  start: Date,
  end: Date
): Promise<number | null> {
  switch (metricKey) {
    case "sport_index": {
      const stats = await prisma.userStats.findUnique({
        where: { userId },
        select: { sportIndex: true },
      })
      return stats?.sportIndex ?? null
    }

    case "distance": {
      const result = await prisma.activity.aggregate({
        where: {
          userId,
          activityDate: { gte: start, lte: end },
          discipline: { sportId },
        },
        _sum: { distanceMeters: true },
      })
      return result._sum.distanceMeters
        ? result._sum.distanceMeters / 1000
        : null
    }

    case "elevation_gain":
    case "vertical_descent": {
      const result = await prisma.activity.aggregate({
        where: {
          userId,
          activityDate: { gte: start, lte: end },
          discipline: { sportId },
        },
        _sum: { elevationGain: true },
      })
      return result._sum.elevationGain ?? null
    }

    case "active_time": {
      const result = await prisma.activity.aggregate({
        where: {
          userId,
          activityDate: { gte: start, lte: end },
          discipline: { sportId },
        },
        _sum: { durationSeconds: true },
      })
      return result._sum.durationSeconds ?? null
    }

    case "sessions":
    case "activities":
    case "matches_played": {
      const count = await prisma.activity.count({
        where: {
          userId,
          activityDate: { gte: start, lte: end },
          discipline: { sportId },
        },
      })
      return count
    }

    case "streak": {
      const streak = await prisma.userStreak.findUnique({
        where: { userId },
        select: { currentStreak: true },
      })
      return streak?.currentStreak ?? null
    }

    default:
      // For unimplemented metrics, fall back to activity count
      return null
  }
}

/**
 * Compute percentile based on activity count (fallback)
 */
async function computeActivityPercentile(
  userId: string,
  sportId: string,
  start: Date,
  end: Date
): Promise<number> {
  // Get user's activity count
  const userCount = await prisma.activity.count({
    where: {
      userId,
      activityDate: { gte: start, lte: end },
      discipline: { sportId },
    },
  })

  // Get total users with activities in this sport
  const [higherCount, total] = await Promise.all([
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Activity" a
      JOIN "Discipline" d ON a."disciplineId" = d.id
      WHERE d."sportId" = ${sportId}
        AND a."activityDate" >= ${start}
        AND a."activityDate" <= ${end}
      GROUP BY a."userId"
      HAVING COUNT(a.id) > ${userCount}
    `.then((r) => Number(r[0]?.count ?? 0)),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT "userId") as count
      FROM "Activity" a
      JOIN "Discipline" d ON a."disciplineId" = d.id
      WHERE d."sportId" = ${sportId}
        AND a."activityDate" >= ${start}
        AND a."activityDate" <= ${end}
    `.then((r) => Number(r[0]?.count ?? 0)),
  ])

  if (total <= 1) return 1.0 // Only user in this sport

  // Percentile = (total - rank + 1) / total
  const rank = higherCount + 1
  return (total - rank + 1) / total
}

/**
 * Compute percentile for a specific metric value
 */
async function computeMetricPercentile(
  userValue: number,
  sportId: string,
  _metricKey: string,
  higherIsBetter: boolean,
  start: Date,
  end: Date
): Promise<number> {
  // For now, use Sport Index as the comparison metric
  // since we don't have per-sport metric aggregation yet

  // Get users with activities in this sport and their sport indexes
  const users = await prisma.$queryRaw<Array<{ userId: string }>>`
    SELECT DISTINCT a."userId"
    FROM "Activity" a
    JOIN "Discipline" d ON a."disciplineId" = d.id
    WHERE d."sportId" = ${sportId}
      AND a."activityDate" >= ${start}
      AND a."activityDate" <= ${end}
  `

  const userIds = users.map((u) => u.userId)
  if (userIds.length <= 1) return 1.0

  // Get sport indexes for all users
  const stats = await prisma.userStats.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, sportIndex: true },
  })

  const values = stats.map((s) => s.sportIndex).filter((v) => v > 0)
  if (values.length <= 1) return 1.0

  // Count how many users have better values
  const betterCount = values.filter((v) =>
    higherIsBetter ? v > userValue : v < userValue
  ).length

  // Percentile = (total - rank + 1) / total
  const rank = betterCount + 1
  return (values.length - rank + 1) / values.length
}

// =============================================================================
// CACHING (optional - can be expanded)
// =============================================================================

/**
 * Get cached multi-sport index or compute fresh
 */
export async function getMultiSportIndex(
  userId: string,
  options: {
    range?: "week" | "month" | "year" | "all"
    forceRefresh?: boolean
  } = {}
): Promise<MultiSportScore> {
  // For now, always compute fresh
  // TODO: Add caching to RankingCache or UserStats
  return computeMultiSportIndex(userId, options.range)
}
