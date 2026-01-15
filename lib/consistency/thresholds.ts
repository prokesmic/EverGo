/**
 * Consistency League V2 - Meaningful Day Thresholds (V12)
 *
 * Prevents gaming by requiring meaningful activity to count as an "active day".
 * Also introduces rest day credit to allow one free day per week.
 *
 * Rules:
 * 1. Meaningful day = 20+ minutes OR 15+ Power points
 * 2. Rest day credit: 1 per week if 3+ meaningful days that week
 * 3. No streak break for using rest day credit
 */

import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek, addDays, differenceInDays, format } from "date-fns"
import { isFlagEnabled } from "@/lib/flags"

// =============================================================================
// CONFIGURATION
// =============================================================================

export const CONSISTENCY_THRESHOLDS = {
  /** Minimum duration (seconds) for a day to count as "meaningful" */
  meaningfulDayMinSeconds: 20 * 60, // 20 minutes

  /** Alternative: minimum Power points for meaningful day */
  meaningfulDayMinPower: 15,

  /** Rest days allowed per week */
  restDaysPerWeek: 1,

  /** Minimum meaningful days to earn rest day credit */
  minDaysForRestCredit: 3,

  /** Sport category multipliers for meaningful threshold */
  categoryMultipliers: {
    STRENGTH: 0.75,      // Gym sessions are shorter
    MINDBODY: 0.60,      // Yoga/meditation sessions
    SKILL_MIXED: 1.0,    // Team sports
    ENDURANCE: 1.0,      // Running, cycling
    OUTDOOR: 1.0,        // Hiking, climbing
    WATER_BOARD: 0.80,   // Kitesurfing sessions can be intense but short
    GENERIC: 1.0,
  } as Record<string, number>,
}

// =============================================================================
// TYPES
// =============================================================================

export interface DayActivitySummary {
  date: string // ISO date
  totalDurationSeconds: number
  totalPowerPoints: number
  activityCount: number
  isMeaningful: boolean
  sports: string[]
}

export interface WeekSummary {
  weekStart: string
  weekEnd: string
  meaningfulDays: number
  restDayCreditsAvailable: number
  restDayCreditsUsed: number
  totalActiveDays: number
  days: DayActivitySummary[]
}

export interface ConsistencyV2Result {
  score: number
  tier: string
  meaningfulDaysThisWeek: number
  meaningfulDaysThisMonth: number
  restCreditsUsed: number
  currentStreak: number
  streakProtected: boolean // True if rest credit saved streak
}

// =============================================================================
// MEANINGFUL DAY CALCULATION
// =============================================================================

/**
 * Check if a day's activities meet the meaningful threshold
 */
export function isDayMeaningful(
  totalDurationSeconds: number,
  totalPowerPoints: number,
  categoryMultiplier: number = 1.0
): boolean {
  if (!isFlagEnabled("CONSISTENCY_V2")) {
    // Backwards compatibility: any activity counts
    return true
  }

  const adjustedMinDuration = CONSISTENCY_THRESHOLDS.meaningfulDayMinSeconds * categoryMultiplier
  const adjustedMinPower = CONSISTENCY_THRESHOLDS.meaningfulDayMinPower * categoryMultiplier

  return (
    totalDurationSeconds >= adjustedMinDuration ||
    totalPowerPoints >= adjustedMinPower
  )
}

/**
 * Get activity summary by day for a user
 */
export async function getDayActivities(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Map<string, DayActivitySummary>> {
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: { gte: startDate, lte: endDate },
    },
    select: {
      activityDate: true,
      durationSeconds: true,
      power: true,
      discipline: {
        select: {
          sport: {
            select: { category: true, slug: true },
          },
        },
      },
    },
  })

  const byDay = new Map<string, DayActivitySummary>()

  for (const activity of activities) {
    const dateKey = format(activity.activityDate, "yyyy-MM-dd")
    const existing = byDay.get(dateKey) ?? {
      date: dateKey,
      totalDurationSeconds: 0,
      totalPowerPoints: 0,
      activityCount: 0,
      isMeaningful: false,
      sports: [],
    }

    existing.totalDurationSeconds += activity.durationSeconds ?? 0
    existing.totalPowerPoints += activity.power ?? 0
    existing.activityCount += 1

    const sportSlug = activity.discipline?.sport?.slug
    if (sportSlug && !existing.sports.includes(sportSlug)) {
      existing.sports.push(sportSlug)
    }

    // Determine category multiplier (use lowest if multiple sports)
    const category = activity.discipline?.sport?.category ?? "GENERIC"
    const multiplier = CONSISTENCY_THRESHOLDS.categoryMultipliers[category] ?? 1.0

    existing.isMeaningful = isDayMeaningful(
      existing.totalDurationSeconds,
      existing.totalPowerPoints,
      multiplier
    )

    byDay.set(dateKey, existing)
  }

  return byDay
}

// =============================================================================
// WEEK SUMMARY WITH REST DAY CREDIT
// =============================================================================

/**
 * Get week summary with rest day credit calculation
 */
export async function getWeekSummary(
  userId: string,
  weekDate: Date = new Date()
): Promise<WeekSummary> {
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })

  const dayActivities = await getDayActivities(userId, weekStart, weekEnd)

  // Build day array
  const days: DayActivitySummary[] = []
  let currentDate = weekStart

  while (currentDate <= weekEnd) {
    const dateKey = format(currentDate, "yyyy-MM-dd")
    const dayData = dayActivities.get(dateKey) ?? {
      date: dateKey,
      totalDurationSeconds: 0,
      totalPowerPoints: 0,
      activityCount: 0,
      isMeaningful: false,
      sports: [],
    }
    days.push(dayData)
    currentDate = addDays(currentDate, 1)
  }

  const meaningfulDays = days.filter((d) => d.isMeaningful).length

  // Calculate rest day credits
  const restDayCreditsAvailable =
    meaningfulDays >= CONSISTENCY_THRESHOLDS.minDaysForRestCredit
      ? CONSISTENCY_THRESHOLDS.restDaysPerWeek
      : 0

  // Count non-meaningful days that could use credit
  const nonMeaningfulDays = days.filter(
    (d) => !d.isMeaningful && d.activityCount === 0
  ).length
  const restDayCreditsUsed = Math.min(restDayCreditsAvailable, nonMeaningfulDays)

  return {
    weekStart: format(weekStart, "yyyy-MM-dd"),
    weekEnd: format(weekEnd, "yyyy-MM-dd"),
    meaningfulDays,
    restDayCreditsAvailable,
    restDayCreditsUsed,
    totalActiveDays: meaningfulDays + restDayCreditsUsed,
    days,
  }
}

// =============================================================================
// STREAK CALCULATION WITH REST CREDIT
// =============================================================================

/**
 * Calculate streak considering rest day credits
 */
export async function calculateStreakWithRestCredit(
  userId: string
): Promise<{
  currentStreak: number
  restCreditsUsedForStreak: number
  streakProtected: boolean
}> {
  const today = new Date()
  const lookbackDays = 90 // Max lookback

  // Get all activities in lookback period
  const startDate = addDays(today, -lookbackDays)
  const dayActivities = await getDayActivities(userId, startDate, today)

  let streak = 0
  let restCreditsUsedTotal = 0
  let restCreditsThisWeek = 0
  let streakProtected = false
  let currentDate = today

  // Track week for rest credit reset
  let currentWeekStart = startOfWeek(today, { weekStartsOn: 1 })
  let meaningfulDaysThisWeek = 0

  while (differenceInDays(today, currentDate) < lookbackDays) {
    const dateKey = format(currentDate, "yyyy-MM-dd")
    const dayData = dayActivities.get(dateKey)

    // Check if we've moved to a new week
    const dayWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    if (dayWeekStart.getTime() !== currentWeekStart.getTime()) {
      // New week - reset counters
      meaningfulDaysThisWeek = 0
      restCreditsThisWeek = 0
      currentWeekStart = dayWeekStart
    }

    if (dayData?.isMeaningful) {
      streak++
      meaningfulDaysThisWeek++
    } else {
      // Check if we can use rest credit
      const hasRestCredit =
        isFlagEnabled("CONSISTENCY_V2") &&
        meaningfulDaysThisWeek >= CONSISTENCY_THRESHOLDS.minDaysForRestCredit &&
        restCreditsThisWeek < CONSISTENCY_THRESHOLDS.restDaysPerWeek

      if (hasRestCredit) {
        streak++ // Rest credit saves the streak
        restCreditsThisWeek++
        restCreditsUsedTotal++
        streakProtected = true
      } else {
        // Streak broken
        break
      }
    }

    currentDate = addDays(currentDate, -1)
  }

  return {
    currentStreak: streak,
    restCreditsUsedForStreak: restCreditsUsedTotal,
    streakProtected,
  }
}

// =============================================================================
// UPDATED CONSISTENCY SCORE
// =============================================================================

/**
 * Compute consistency score with V2 rules
 */
export async function computeConsistencyScoreV2(
  userId: string
): Promise<ConsistencyV2Result> {
  const today = new Date()

  // Get current week summary
  const weekSummary = await getWeekSummary(userId, today)

  // Get last 30 days for monthly count
  const monthStart = addDays(today, -30)
  const monthActivities = await getDayActivities(userId, monthStart, today)
  const meaningfulDaysThisMonth = Array.from(monthActivities.values()).filter(
    (d) => d.isMeaningful
  ).length

  // Calculate streak with rest credit
  const streakResult = await calculateStreakWithRestCredit(userId)

  // Compute score (similar to V1 but using meaningful days)
  const WEIGHTS = {
    streak: 250,
    weeklyGoal: 200,
    monthlyActivity: 200,
    restCreditUsage: 100, // Bonus for strategic rest credit use
    longevity: 150,
  }

  // Streak score (cap at 30 meaningful days)
  const streakScore = Math.min(1, streakResult.currentStreak / 30) * WEIGHTS.streak

  // Weekly meaningful days (cap at 7)
  const weeklyScore = Math.min(1, weekSummary.meaningfulDays / 5) * WEIGHTS.weeklyGoal

  // Monthly meaningful days (cap at 20)
  const monthlyScore = Math.min(1, meaningfulDaysThisMonth / 20) * WEIGHTS.monthlyActivity

  // Rest credit usage bonus (using strategically is good)
  const restCreditBonus = streakResult.streakProtected ? 50 : 0

  const totalScore = Math.min(1000, Math.round(
    streakScore + weeklyScore + monthlyScore + restCreditBonus
  ))

  // Determine tier
  let tier = "STARTER"
  if (totalScore >= 900) tier = "LEGENDARY"
  else if (totalScore >= 750) tier = "ELITE"
  else if (totalScore >= 500) tier = "COMMITTED"
  else if (totalScore >= 300) tier = "DEDICATED"
  else if (totalScore >= 100) tier = "REGULAR"

  return {
    score: totalScore,
    tier,
    meaningfulDaysThisWeek: weekSummary.meaningfulDays,
    meaningfulDaysThisMonth,
    restCreditsUsed: streakResult.restCreditsUsedForStreak,
    currentStreak: streakResult.currentStreak,
    streakProtected: streakResult.streakProtected,
  }
}
