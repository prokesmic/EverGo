/**
 * Ribbon Stats by Range
 *
 * Single function that returns ribbon stats for any user + range.
 * Used by both Home and Profile pages via API endpoint.
 */

import { prisma } from "@/lib/db"
import { subDays } from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

export type RibbonRange = "week" | "month" | "year" | "all"

export interface RibbonStats {
  /** Range that was queried */
  range: RibbonRange
  /** Start date of the range */
  rangeStart: Date
  /** End date (now) */
  rangeEnd: Date
  /** Range-based metrics */
  rangeBased: {
    powerTotal: number
    activitiesCount: number
    activeTimeSeconds: number
    daysActiveCount: number
    distanceMeters: number
    elevationMeters: number
  }
  /** Always-current metrics (not range-based) */
  always: {
    currentStreakDays: number
    sportIndex: number
    sportIndexDelta: number
  }
  /** User metadata */
  user: {
    createdAt: Date
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Get ribbon stats for a user within a specific range.
 *
 * @param userId - User ID to fetch stats for
 * @param range - Time range: week (7d), month (30d), year (365d), all (since registration)
 * @param now - Reference date (defaults to current time)
 */
export async function getRibbonStats(
  userId: string,
  range: RibbonRange,
  now: Date = new Date()
): Promise<RibbonStats> {
  // Fetch user to get createdAt for "all" range
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // Determine date window based on range
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
      rangeStart = user.createdAt
      break
    default:
      rangeStart = subDays(now, 7) // Default to week
  }

  // Fetch aggregated stats and always-current stats in parallel
  const [aggregates, uniqueDays, userStats, userStreak] = await Promise.all([
    // Aggregated range-based stats
    prisma.activity.aggregate({
      where: {
        userId,
        activityDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
      _sum: {
        power: true,
        durationSeconds: true,
        distanceMeters: true,
        elevationGain: true,
      },
      _count: {
        id: true,
      },
    }),

    // Count unique active days using raw query for DISTINCT date
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT DATE("activityDate")) as count
      FROM "Activity"
      WHERE "userId" = ${userId}
        AND "activityDate" >= ${rangeStart}
        AND "activityDate" <= ${rangeEnd}
    `,

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
      select: {
        currentStreak: true,
      },
    }),
  ])

  // Extract unique days count from raw query
  const daysActiveCount = Number(uniqueDays[0]?.count ?? 0)

  return {
    range,
    rangeStart,
    rangeEnd,
    rangeBased: {
      powerTotal: Math.round(aggregates._sum.power ?? 0),
      activitiesCount: aggregates._count.id,
      activeTimeSeconds: aggregates._sum.durationSeconds ?? 0,
      daysActiveCount,
      distanceMeters: aggregates._sum.distanceMeters ?? 0,
      elevationMeters: aggregates._sum.elevationGain ?? 0,
    },
    always: {
      currentStreakDays: userStreak?.currentStreak ?? 0,
      sportIndex: userStats?.sportIndex ?? 0,
      sportIndexDelta: userStats?.sportIndexDelta7d ?? 0,
    },
    user: {
      createdAt: user.createdAt,
    },
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

export function isValidRange(range: string): range is RibbonRange {
  return ["week", "month", "year", "all"].includes(range)
}
