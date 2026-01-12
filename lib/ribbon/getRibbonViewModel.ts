/**
 * Ribbon View Model
 *
 * Computes all stats needed for the ribbon based on user's primary sport.
 * Returns a formatted view model ready for UI rendering.
 *
 * Includes:
 * - Global rank computation
 * - Range-based activity stats
 * - Always-current metrics (streak, sport index)
 * - Sport-aware metric configuration
 */

import { prisma } from "@/lib/db"
import { subDays } from "date-fns"
import type { SportCategory } from "@prisma/client"
import {
  type RibbonRange,
  type RibbonMetricKey,
  type RibbonMetricDescriptor,
  type MetricFormat,
  resolveRibbonConfig,
} from "./ribbonConfig"
import { normalizeSportSlug } from "@/lib/sports/normalizeSportSlug"

// =============================================================================
// TYPES
// =============================================================================

export type RibbonMetricValue = {
  key: RibbonMetricKey
  label: string
  value: number | string | null
  formatted: string
  unit?: string
  format: MetricFormat
}

export type RibbonViewModel = {
  range: RibbonRange
  sportSlug: string
  sportName: string
  sportCategory: SportCategory | null
  metrics: RibbonMetricValue[]
  /** User's account creation date (for "all" range display) */
  userCreatedAt: Date
}

type RawStats = {
  // Range-based
  powerTotal: number
  activitiesCount: number
  activeTimeSeconds: number
  daysActiveCount: number
  distanceMeters: number
  elevationMeters: number
  caloriesTotal: number
  varietyCount: number  // Distinct sports in range
  prCount: number       // PRs achieved in range

  // Always current
  currentStreakDays: number
  sportIndex: number
  sportIndexDelta: number

  // Global rank
  globalRank: number | null
  globalTotal: number
  globalPercentile: number | null
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Get ribbon view model for a user.
 *
 * @param userId - User ID
 * @param range - Time range for stats
 * @param now - Reference date (for testing)
 */
export async function getRibbonViewModel(
  userId: string,
  range: RibbonRange,
  now: Date = new Date()
): Promise<RibbonViewModel> {
  // 1. Get user creation date
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // 2. Get primary sport from UserSport (priority = 0 is primary)
  // This matches how home page and settings get primary sport
  const primaryUserSport = await prisma.userSport.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { priority: "asc" },
    include: {
      sport: { select: { slug: true, name: true, category: true } },
    },
  })

  // 3. Resolve sport details (or MultiSport default)
  let sportSlug = "multisport"
  let sportName = "MultiSport"
  let sportCategory: SportCategory | null = "GENERIC" as SportCategory

  if (primaryUserSport?.sport) {
    sportSlug = normalizeSportSlug(primaryUserSport.sport.slug) ?? primaryUserSport.sport.slug
    sportName = primaryUserSport.sport.name
    sportCategory = primaryUserSport.sport.category as SportCategory
  }

  // 4. Get ribbon config for this sport
  const config = resolveRibbonConfig(sportSlug, sportCategory)

  // 5. Compute all required stats
  const stats = await computeRibbonStats(userId, range, sportSlug, now, user.createdAt)

  // 6. Map config to formatted metrics
  const metrics = config.map((descriptor) =>
    formatMetric(descriptor, stats)
  )

  return {
    range,
    sportSlug,
    sportName,
    sportCategory,
    metrics,
    userCreatedAt: user.createdAt,
  }
}

// =============================================================================
// STATS COMPUTATION
// =============================================================================

async function computeRibbonStats(
  userId: string,
  range: RibbonRange,
  sportSlug: string,
  now: Date,
  userCreatedAt: Date
): Promise<RawStats> {
  // Determine date window
  const rangeEnd = now
  let rangeStart: Date

  switch (range) {
    case "week":
      rangeStart = subDays(now, 7)
      break
    case "month":
      rangeStart = subDays(now, 30)
      break
    case "year":
      rangeStart = subDays(now, 365)
      break
    case "all":
      rangeStart = userCreatedAt
      break
    default:
      rangeStart = subDays(now, 7)
  }

  // Parallel fetch all data
  const [
    aggregates,
    uniqueDays,
    varietyCount,
    prCount,
    userStats,
    userStreak,
    globalRankData,
  ] = await Promise.all([
    // Range-based aggregates
    prisma.activity.aggregate({
      where: {
        userId,
        activityDate: { gte: rangeStart, lte: rangeEnd },
      },
      _sum: {
        power: true,
        durationSeconds: true,
        distanceMeters: true,
        elevationGain: true,
        caloriesBurned: true,
      },
      _count: { id: true },
    }),

    // Unique active days
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT DATE("activityDate")) as count
      FROM "Activity"
      WHERE "userId" = ${userId}
        AND "activityDate" >= ${rangeStart}
        AND "activityDate" <= ${rangeEnd}
    `,

    // Variety: distinct sports in range (for MultiSport)
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT d."sportId") as count
      FROM "Activity" a
      JOIN "Discipline" d ON a."disciplineId" = d."id"
      WHERE a."userId" = ${userId}
        AND a."activityDate" >= ${rangeStart}
        AND a."activityDate" <= ${rangeEnd}
    `,

    // PR count in range
    prisma.personalRecord.count({
      where: {
        userId,
        achievedAt: { gte: rangeStart, lte: rangeEnd },
      },
    }),

    // User stats (always current)
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        sportIndex: true,
        sportIndexDelta7d: true,
      },
    }),

    // User streak (always current)
    prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }),

    // Global rank
    computeGlobalRank(userId, sportSlug),
  ])

  return {
    // Range-based
    powerTotal: Math.round(aggregates._sum.power ?? 0),
    activitiesCount: aggregates._count.id,
    activeTimeSeconds: aggregates._sum.durationSeconds ?? 0,
    daysActiveCount: Number(uniqueDays[0]?.count ?? 0),
    distanceMeters: aggregates._sum.distanceMeters ?? 0,
    elevationMeters: aggregates._sum.elevationGain ?? 0,
    caloriesTotal: aggregates._sum.caloriesBurned ?? 0,
    varietyCount: Number(varietyCount[0]?.count ?? 0),
    prCount,

    // Always current
    currentStreakDays: userStreak?.currentStreak ?? 0,
    sportIndex: userStats?.sportIndex ?? 0,
    sportIndexDelta: userStats?.sportIndexDelta7d ?? 0,

    // Global rank
    globalRank: globalRankData.rank,
    globalTotal: globalRankData.total,
    globalPercentile: globalRankData.percentile,
  }
}

// =============================================================================
// GLOBAL RANK COMPUTATION
// =============================================================================

type GlobalRankResult = {
  rank: number | null
  total: number
  percentile: number | null
}

/**
 * Compute user's global rank based on Sport Index.
 *
 * For now, ranks all users by sportIndex globally.
 * TODO: Add sport-specific ranking when UserSportStats is populated.
 * TODO: Add Redis/Upstash caching for scale.
 */
async function computeGlobalRank(
  userId: string,
  _sportSlug: string  // Reserved for future sport-specific ranking
): Promise<GlobalRankResult> {
  // Get user's sport index
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { sportIndex: true },
  })

  const userScore = userStats?.sportIndex ?? 0

  if (userScore <= 0) {
    return { rank: null, total: 0, percentile: null }
  }

  // Count users with higher score (rank = higherCount + 1)
  const [higherCount, total] = await Promise.all([
    prisma.userStats.count({
      where: {
        sportIndex: { gt: userScore },
        user: { privacyLevel: { not: "PRIVATE" } },
      },
    }),
    prisma.userStats.count({
      where: {
        sportIndex: { gt: 0 },
        user: { privacyLevel: { not: "PRIVATE" } },
      },
    }),
  ])

  const rank = higherCount + 1
  const percentile = total > 0 ? Math.round(((total - rank + 1) / total) * 100) : null

  return { rank, total, percentile }
}

// =============================================================================
// METRIC FORMATTING
// =============================================================================

function formatMetric(
  descriptor: RibbonMetricDescriptor,
  stats: RawStats
): RibbonMetricValue {
  const rawValue = getMetricValue(descriptor.key, stats)
  const formatted = formatValue(rawValue, descriptor.format, descriptor.unit)

  return {
    key: descriptor.key,
    label: descriptor.label,
    value: rawValue,
    formatted,
    unit: descriptor.unit,
    format: descriptor.format,
  }
}

function getMetricValue(key: RibbonMetricKey, stats: RawStats): number | string | null {
  switch (key) {
    case "GLOBAL_RANK":
      return stats.globalRank
    case "SPORT_INDEX":
      return stats.sportIndex
    case "POWER":
      return stats.powerTotal
    case "SESSIONS":
    case "ACTIVITIES":
      return stats.activitiesCount
    case "ACTIVE_TIME":
      return stats.activeTimeSeconds
    case "DISTANCE":
      return stats.distanceMeters / 1000  // Convert to km
    case "ELEVATION":
      return stats.elevationMeters
    case "DAYS_ACTIVE":
      return stats.daysActiveCount
    case "VARIETY":
      return stats.varietyCount
    case "STREAK":
      return stats.currentStreakDays
    case "PR_COUNT":
      return stats.prCount
    case "CALORIES":
      return stats.caloriesTotal
    case "VOLUME":
      return null  // Not yet implemented
    case "ELO":
      return null  // Not yet implemented
    case "WIN_RATE":
      return null  // Not yet implemented
    case "AVG_PACE":
      return null  // Not yet implemented
    case "AVG_HEART_RATE":
      return null  // Not yet implemented
    default:
      return null
  }
}

function formatValue(
  value: number | string | null,
  format: MetricFormat,
  unit?: string
): string {
  if (value === null || value === undefined) {
    return "—"
  }

  const num = typeof value === "number" ? value : parseFloat(value)

  switch (format) {
    case "int":
      return Math.round(num).toLocaleString()

    case "float1":
      return num.toFixed(1)

    case "duration": {
      // Value is in seconds
      const totalMinutes = Math.round(num / 60)
      const hours = Math.floor(totalMinutes / 60)
      const mins = totalMinutes % 60
      if (hours > 0) {
        return `${hours}h ${mins}m`
      }
      return `${mins}m`
    }

    case "pace": {
      // Value is seconds per km
      if (num <= 0) return "—"
      const mins = Math.floor(num / 60)
      const secs = Math.round(num % 60)
      return `${mins}:${secs.toString().padStart(2, "0")}/km`
    }

    case "percent":
      return `${Math.round(num)}%`

    case "rank":
      if (num <= 0) return "—"
      return `#${Math.round(num).toLocaleString()}`

    case "score":
      return `${Math.round(num)}`

    case "distance": {
      // Value is already in km
      if (num >= 100) {
        return Math.round(num).toLocaleString()
      }
      return num.toFixed(1)
    }

    default:
      return String(num)
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

export function isValidRange(range: string): range is RibbonRange {
  return ["week", "month", "year", "all"].includes(range)
}
