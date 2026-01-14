/**
 * Consistency Score Computation (V11)
 *
 * The Consistency League rewards users who maintain regular activity
 * regardless of performance. This creates an alternative ranking path
 * for users who can't compete on raw metrics.
 *
 * Scoring Components:
 * 1. Current streak bonus (daily activity)
 * 2. Weekly goal achievement
 * 3. Perfect weeks count
 * 4. Account age factor
 * 5. Activity regularity (variance)
 *
 * Score Range: 0-1000
 */

import { prisma } from "@/lib/db"
import { subDays, subWeeks, startOfWeek, endOfWeek, differenceInDays } from "date-fns"
import type { ConsistencyTier } from "@prisma/client"

// =============================================================================
// TYPES
// =============================================================================

export interface ConsistencyResult {
  score: number
  tier: ConsistencyTier
  breakdown: {
    streakScore: number
    weeklyGoalScore: number
    perfectWeeksScore: number
    regularityScore: number
    longevityScore: number
  }
  stats: {
    currentStreak: number
    longestStreak: number
    perfectWeeks: number
    weeklyGoalMet: boolean
    daysActiveThisMonth: number
  }
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Weight for each component (must sum to 1000 max)
  WEIGHTS: {
    streak: 250,         // Current streak value
    weeklyGoal: 200,     // Meeting weekly activity goal
    perfectWeeks: 200,   // Cumulative perfect weeks
    regularity: 200,     // How regular activity is
    longevity: 150,      // Account age factor
  },
  // Streak scoring
  STREAK_MAX_DAYS: 30,   // Cap for streak score calculation
  // Perfect weeks scoring
  PERFECT_WEEKS_MAX: 52, // One year of perfect weeks = max score
  // Regularity scoring
  REGULARITY_LOOKBACK_DAYS: 28, // 4 weeks for regularity calc
  IDEAL_DAYS_PER_WEEK: 4, // Target for regularity
  // Longevity
  LONGEVITY_MAX_DAYS: 365, // 1 year = max longevity bonus
}

// Tier thresholds
const TIER_THRESHOLDS: { tier: ConsistencyTier; minScore: number }[] = [
  { tier: "LEGENDARY", minScore: 900 },
  { tier: "ELITE", minScore: 750 },
  { tier: "COMMITTED", minScore: 500 },
  { tier: "DEDICATED", minScore: 300 },
  { tier: "REGULAR", minScore: 100 },
  { tier: "STARTER", minScore: 0 },
]

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Compute consistency score for a user
 */
export async function computeConsistencyScore(userId: string): Promise<ConsistencyResult> {
  const now = new Date()

  // Get user streak data
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      weeklyGoal: true,
      weeklyProgress: true,
      perfectWeeks: true,
    },
  })

  // Get user creation date for longevity
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  })

  // Get recent activities for regularity calculation
  const lookbackStart = subDays(now, CONFIG.REGULARITY_LOOKBACK_DAYS)
  const recentActivities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: { gte: lookbackStart },
    },
    select: {
      activityDate: true,
    },
    orderBy: { activityDate: "asc" },
  })

  // Calculate days active this month
  const monthStart = subDays(now, 30)
  const daysActiveThisMonth = new Set(
    recentActivities
      .filter((a) => a.activityDate >= monthStart)
      .map((a) => a.activityDate.toISOString().split("T")[0])
  ).size

  // Calculate component scores
  const breakdown = {
    streakScore: calculateStreakScore(streak?.currentStreak ?? 0),
    weeklyGoalScore: calculateWeeklyGoalScore(
      streak?.weeklyProgress ?? 0,
      streak?.weeklyGoal ?? 3
    ),
    perfectWeeksScore: calculatePerfectWeeksScore(streak?.perfectWeeks ?? 0),
    regularityScore: calculateRegularityScore(recentActivities.map((a) => a.activityDate)),
    longevityScore: calculateLongevityScore(user?.createdAt ?? now),
  }

  // Sum scores
  const score = Math.min(
    1000,
    breakdown.streakScore +
      breakdown.weeklyGoalScore +
      breakdown.perfectWeeksScore +
      breakdown.regularityScore +
      breakdown.longevityScore
  )

  // Determine tier
  const tier = getTierFromScore(score)

  return {
    score: Math.round(score),
    tier,
    breakdown,
    stats: {
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      perfectWeeks: streak?.perfectWeeks ?? 0,
      weeklyGoalMet: (streak?.weeklyProgress ?? 0) >= (streak?.weeklyGoal ?? 3),
      daysActiveThisMonth,
    },
  }
}

// =============================================================================
// COMPONENT CALCULATORS
// =============================================================================

function calculateStreakScore(currentStreak: number): number {
  // Score increases with streak, capped at STREAK_MAX_DAYS
  const normalizedStreak = Math.min(currentStreak, CONFIG.STREAK_MAX_DAYS)
  return Math.round((normalizedStreak / CONFIG.STREAK_MAX_DAYS) * CONFIG.WEIGHTS.streak)
}

function calculateWeeklyGoalScore(progress: number, goal: number): number {
  // Binary: full score if goal met, partial if not
  if (progress >= goal) {
    return CONFIG.WEIGHTS.weeklyGoal
  }
  // Partial credit for progress toward goal
  return Math.round((progress / goal) * CONFIG.WEIGHTS.weeklyGoal * 0.5)
}

function calculatePerfectWeeksScore(perfectWeeks: number): number {
  const normalizedWeeks = Math.min(perfectWeeks, CONFIG.PERFECT_WEEKS_MAX)
  return Math.round(
    (normalizedWeeks / CONFIG.PERFECT_WEEKS_MAX) * CONFIG.WEIGHTS.perfectWeeks
  )
}

function calculateRegularityScore(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0

  // Calculate variance in days between activities
  // Lower variance = more regular = higher score
  const now = new Date()
  const lookbackStart = subDays(now, CONFIG.REGULARITY_LOOKBACK_DAYS)

  // Count activities per week
  const weekCounts: number[] = []
  for (let i = 0; i < 4; i++) {
    const weekStart = subWeeks(now, i + 1)
    const weekEnd = subWeeks(now, i)
    const count = activityDates.filter(
      (d) => d >= weekStart && d < weekEnd
    ).length
    weekCounts.push(count)
  }

  // Calculate average and variance
  const avg = weekCounts.reduce((a, b) => a + b, 0) / weekCounts.length
  const variance =
    weekCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) /
    weekCounts.length

  // Lower variance = higher score
  // Also factor in average activities per week
  const varianceScore = Math.max(0, 1 - variance / 10) // variance of 10+ = 0 score
  const frequencyScore = Math.min(1, avg / CONFIG.IDEAL_DAYS_PER_WEEK)

  return Math.round(
    ((varianceScore + frequencyScore) / 2) * CONFIG.WEIGHTS.regularity
  )
}

function calculateLongevityScore(createdAt: Date): number {
  const now = new Date()
  const daysSinceCreation = differenceInDays(now, createdAt)
  const normalizedDays = Math.min(daysSinceCreation, CONFIG.LONGEVITY_MAX_DAYS)
  return Math.round(
    (normalizedDays / CONFIG.LONGEVITY_MAX_DAYS) * CONFIG.WEIGHTS.longevity
  )
}

function getTierFromScore(score: number): ConsistencyTier {
  for (const { tier, minScore } of TIER_THRESHOLDS) {
    if (score >= minScore) return tier
  }
  return "STARTER"
}

// =============================================================================
// UPDATE FUNCTIONS
// =============================================================================

/**
 * Update user's consistency score in database
 */
export async function updateConsistencyScore(userId: string): Promise<ConsistencyResult> {
  const result = await computeConsistencyScore(userId)

  await prisma.userStreak.upsert({
    where: { userId },
    create: {
      userId,
      consistencyScore: result.score,
      consistencyTier: result.tier,
    },
    update: {
      consistencyScore: result.score,
      consistencyTier: result.tier,
    },
  })

  return result
}

/**
 * Get consistency leaderboard
 */
export async function getConsistencyLeaderboard(options: {
  limit?: number
  offset?: number
  country?: string
  city?: string
}): Promise<{
  entries: Array<{
    rank: number
    userId: string
    username: string
    displayName: string
    avatarUrl: string | null
    score: number
    tier: ConsistencyTier
    currentStreak: number
  }>
  total: number
}> {
  const { limit = 50, offset = 0, country, city } = options

  // Build where clause for location filtering
  const userWhere: any = {
    privacyLevel: { not: "PRIVATE" },
  }
  if (country) userWhere.country = country
  if (city) userWhere.city = city

  const [entries, total] = await Promise.all([
    prisma.userStreak.findMany({
      where: {
        consistencyScore: { gt: 0 },
        user: userWhere,
      },
      select: {
        userId: true,
        consistencyScore: true,
        consistencyTier: true,
        currentStreak: true,
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { consistencyScore: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.userStreak.count({
      where: {
        consistencyScore: { gt: 0 },
        user: userWhere,
      },
    }),
  ])

  return {
    entries: entries.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.userId,
      username: entry.user.username,
      displayName: entry.user.displayName,
      avatarUrl: entry.user.avatarUrl,
      score: entry.consistencyScore,
      tier: entry.consistencyTier,
      currentStreak: entry.currentStreak,
    })),
    total,
  }
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: ConsistencyTier) {
  const info: Record<ConsistencyTier, {
    name: string
    color: string
    bgColor: string
    minScore: number
  }> = {
    STARTER: { name: "Starter", color: "text-slate-500", bgColor: "bg-slate-500/10", minScore: 0 },
    REGULAR: { name: "Regular", color: "text-blue-500", bgColor: "bg-blue-500/10", minScore: 100 },
    DEDICATED: { name: "Dedicated", color: "text-green-500", bgColor: "bg-green-500/10", minScore: 300 },
    COMMITTED: { name: "Committed", color: "text-purple-500", bgColor: "bg-purple-500/10", minScore: 500 },
    ELITE: { name: "Elite", color: "text-amber-500", bgColor: "bg-amber-500/10", minScore: 750 },
    LEGENDARY: { name: "Legendary", color: "text-rose-500", bgColor: "bg-rose-500/10", minScore: 900 },
  }
  return info[tier]
}
