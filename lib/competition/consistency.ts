/**
 * Consistency League System
 *
 * Tracks "days active" as a separate ranking dimension.
 * Rewards showing up regardless of intensity.
 *
 * This provides an alternative to pure Power rankings,
 * helping users who prefer steady effort over peak performance.
 */

import { prisma } from "@/lib/db"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  isSameDay,
} from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

export type ConsistencyPeriodType = "WEEK" | "MONTH" | "SEASON"

export interface ConsistencyStats {
  userId: string
  periodType: ConsistencyPeriodType
  periodKey: string
  daysActive: number
  totalActivities: number
  totalDuration: number
  totalDistance: number
  activeDays: string[] // ISO date strings
  rank?: number
  totalInScope?: number
}

// =============================================================================
// PERIOD KEY HELPERS
// =============================================================================

export function getCurrentWeekKey(): string {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  return format(weekStart, "yyyy-'W'ww")
}

export function getCurrentMonthKey(): string {
  return format(new Date(), "yyyy-MM")
}

export function getSeasonKey(seasonId?: string): string {
  // If a specific season ID is provided, use it
  if (seasonId) return `season-${seasonId}`
  // Otherwise generate from current date
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  if (month < 3) return `season-winter-${year}`
  if (month < 6) return `season-spring-${year}`
  if (month < 9) return `season-summer-${year}`
  return `season-fall-${year}`
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Record an activity day for consistency tracking.
 * Called when an activity is created.
 * Idempotent per day - multiple activities on same day count as 1.
 */
export async function recordActivityDay(
  userId: string,
  activityDate: Date,
  durationSeconds: number,
  distanceMeters: number
): Promise<void> {
  const dateStr = format(activityDate, "yyyy-MM-dd")

  // Update WEEK consistency
  const weekKey = format(startOfWeek(activityDate, { weekStartsOn: 1 }), "yyyy-'W'ww")
  await upsertConsistency(
    userId,
    "WEEK",
    weekKey,
    dateStr,
    durationSeconds,
    distanceMeters
  )

  // Update MONTH consistency
  const monthKey = format(activityDate, "yyyy-MM")
  await upsertConsistency(
    userId,
    "MONTH",
    monthKey,
    dateStr,
    durationSeconds,
    distanceMeters
  )

  // Update SEASON consistency (using current season)
  const seasonKey = getSeasonKey()
  await upsertConsistency(
    userId,
    "SEASON",
    seasonKey,
    dateStr,
    durationSeconds,
    distanceMeters
  )
}

/**
 * Get consistency stats for a user
 */
export async function getUserConsistency(
  userId: string,
  periodType: ConsistencyPeriodType,
  periodKey?: string
): Promise<ConsistencyStats | null> {
  const key =
    periodKey ||
    (periodType === "WEEK"
      ? getCurrentWeekKey()
      : periodType === "MONTH"
      ? getCurrentMonthKey()
      : getSeasonKey())

  const record = await prisma.userConsistency.findUnique({
    where: {
      userId_periodType_periodKey: {
        userId,
        periodType,
        periodKey: key,
      },
    },
  })

  if (!record) return null

  return {
    userId: record.userId,
    periodType: record.periodType as ConsistencyPeriodType,
    periodKey: record.periodKey,
    daysActive: record.daysActive,
    totalActivities: record.totalActivities,
    totalDuration: record.totalDuration,
    totalDistance: record.totalDistance,
    activeDays: JSON.parse(record.activeDays),
    rank: record.rank ?? undefined,
    totalInScope: record.totalInScope ?? undefined,
  }
}

/**
 * Get consistency leaderboard for a period
 */
export async function getConsistencyLeaderboard(
  periodType: ConsistencyPeriodType,
  periodKey?: string,
  limit: number = 100,
  offset: number = 0
): Promise<ConsistencyStats[]> {
  const key =
    periodKey ||
    (periodType === "WEEK"
      ? getCurrentWeekKey()
      : periodType === "MONTH"
      ? getCurrentMonthKey()
      : getSeasonKey())

  const records = await prisma.userConsistency.findMany({
    where: {
      periodType,
      periodKey: key,
      daysActive: { gt: 0 },
    },
    orderBy: [
      { daysActive: "desc" },
      { totalActivities: "desc" },
    ],
    skip: offset,
    take: limit,
  })

  return records.map((r, i) => ({
    userId: r.userId,
    periodType: r.periodType as ConsistencyPeriodType,
    periodKey: r.periodKey,
    daysActive: r.daysActive,
    totalActivities: r.totalActivities,
    totalDuration: r.totalDuration,
    totalDistance: r.totalDistance,
    activeDays: JSON.parse(r.activeDays),
    rank: offset + i + 1,
  }))
}

/**
 * Recalculate ranks for a period (call from cron)
 */
export async function recalculateConsistencyRanks(
  periodType: ConsistencyPeriodType,
  periodKey: string
): Promise<number> {
  // Get all users for this period, sorted
  const records = await prisma.userConsistency.findMany({
    where: {
      periodType,
      periodKey,
      daysActive: { gt: 0 },
    },
    orderBy: [
      { daysActive: "desc" },
      { totalActivities: "desc" },
    ],
    select: { id: true },
  })

  const total = records.length

  // Update ranks in batches
  for (let i = 0; i < records.length; i++) {
    await prisma.userConsistency.update({
      where: { id: records[i].id },
      data: {
        rank: i + 1,
        totalInScope: total,
      },
    })
  }

  return total
}

// =============================================================================
// HELPERS
// =============================================================================

async function upsertConsistency(
  userId: string,
  periodType: ConsistencyPeriodType,
  periodKey: string,
  dateStr: string,
  durationSeconds: number,
  distanceMeters: number
): Promise<void> {
  // Get existing record
  const existing = await prisma.userConsistency.findUnique({
    where: {
      userId_periodType_periodKey: {
        userId,
        periodType,
        periodKey,
      },
    },
  })

  if (!existing) {
    // Create new record
    await prisma.userConsistency.create({
      data: {
        userId,
        periodType,
        periodKey,
        daysActive: 1,
        totalActivities: 1,
        totalDuration: durationSeconds,
        totalDistance: distanceMeters / 1000,
        activeDays: JSON.stringify([dateStr]),
      },
    })
    return
  }

  // Check if this day is already recorded
  const activeDays: string[] = JSON.parse(existing.activeDays)
  const isNewDay = !activeDays.includes(dateStr)

  // Update existing record
  await prisma.userConsistency.update({
    where: { id: existing.id },
    data: {
      daysActive: isNewDay ? { increment: 1 } : undefined,
      totalActivities: { increment: 1 },
      totalDuration: { increment: durationSeconds },
      totalDistance: { increment: distanceMeters / 1000 },
      activeDays: isNewDay
        ? JSON.stringify([...activeDays, dateStr])
        : undefined,
    },
  })
}
