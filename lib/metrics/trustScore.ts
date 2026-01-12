/**
 * Trust Score Computation
 *
 * The trust score determines how much weight a user's manual entries
 * receive in rankings. Users who primarily log via sensors get higher
 * trust scores, which gives their manual entries more credibility.
 *
 * Algorithm:
 * 1. Calculate ratio of sensor-verified activities to total activities
 * 2. Apply a minimum floor (0.3) so manual-only users aren't completely penalized
 * 3. Apply bonuses for:
 *    - Long account history (veteran users are more trusted)
 *    - High activity volume (active users have track record)
 *    - Consistent logging patterns
 *
 * Trust Score Range: 0.3 - 1.0
 * - 1.0 = All activities are sensor-verified
 * - 0.3 = All activities are manual (minimum floor)
 */

import { prisma } from "@/lib/db"
import { isSensorSource } from "@/lib/sports/config"
import { subDays } from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

export interface TrustScoreResult {
  /** Final trust score (0.3 - 1.0) */
  score: number
  /** Total activities counted */
  totalActivities: number
  /** Sensor-verified activities */
  sensorActivities: number
  /** Sensor ratio before adjustments */
  rawSensorRatio: number
  /** Account age in days */
  accountAgeDays: number
  /** Whether user has verified badge */
  isVerified: boolean
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  /** Minimum trust score (floor for manual-only users) */
  MIN_SCORE: 0.3,
  /** Maximum trust score */
  MAX_SCORE: 1.0,
  /** Minimum activities to calculate trust score */
  MIN_ACTIVITIES: 5,
  /** Weight of sensor ratio in final score */
  SENSOR_WEIGHT: 0.7,
  /** Weight of account age bonus */
  AGE_WEIGHT: 0.15,
  /** Weight of activity volume bonus */
  VOLUME_WEIGHT: 0.15,
  /** Account age in days for maximum bonus */
  MAX_AGE_DAYS: 365,
  /** Activity count for maximum volume bonus */
  MAX_VOLUME_COUNT: 200,
  /** Threshold for "verified" badge (sensor ratio) */
  VERIFIED_THRESHOLD: 0.8,
  /** Days to look back for recent activity ratio */
  LOOKBACK_DAYS: 90,
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export async function computeTrustScore(userId: string): Promise<TrustScoreResult> {
  const lookbackDate = subDays(new Date(), CONFIG.LOOKBACK_DAYS)

  // Get user account age
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  })

  if (!user) {
    return {
      score: CONFIG.MIN_SCORE,
      totalActivities: 0,
      sensorActivities: 0,
      rawSensorRatio: 0,
      accountAgeDays: 0,
      isVerified: false,
    }
  }

  const accountAgeDays = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get activity counts by source (recent activities)
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: { gte: lookbackDate },
    },
    select: { source: true },
  })

  const totalActivities = activities.length
  const sensorActivities = activities.filter((a) => isSensorSource(a.source)).length

  // If not enough activities, return minimum score
  if (totalActivities < CONFIG.MIN_ACTIVITIES) {
    return {
      score: CONFIG.MIN_SCORE,
      totalActivities,
      sensorActivities,
      rawSensorRatio: totalActivities > 0 ? sensorActivities / totalActivities : 0,
      accountAgeDays,
      isVerified: false,
    }
  }

  // Calculate raw sensor ratio
  const rawSensorRatio = sensorActivities / totalActivities

  // Calculate component scores
  const sensorComponent = rawSensorRatio * CONFIG.SENSOR_WEIGHT

  // Account age bonus (0-1, maxes out at 1 year)
  const ageBonus = Math.min(accountAgeDays / CONFIG.MAX_AGE_DAYS, 1)
  const ageComponent = ageBonus * CONFIG.AGE_WEIGHT

  // Volume bonus (0-1, maxes out at 200 activities)
  const volumeBonus = Math.min(totalActivities / CONFIG.MAX_VOLUME_COUNT, 1)
  const volumeComponent = volumeBonus * CONFIG.VOLUME_WEIGHT

  // Combine components
  const rawScore = sensorComponent + ageComponent + volumeComponent

  // Apply floor and ceiling
  const score = Math.max(
    CONFIG.MIN_SCORE,
    Math.min(CONFIG.MAX_SCORE, rawScore)
  )

  // Determine if user has verified badge
  const isVerified = rawSensorRatio >= CONFIG.VERIFIED_THRESHOLD

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    totalActivities,
    sensorActivities,
    rawSensorRatio: Math.round(rawSensorRatio * 100) / 100,
    accountAgeDays,
    isVerified,
  }
}

// =============================================================================
// UPDATE FUNCTION
// =============================================================================

/**
 * Update user's trust score in database
 */
export async function updateUserTrustScore(userId: string): Promise<number> {
  const result = await computeTrustScore(userId)

  await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      trustScore: result.score,
    },
    update: {
      trustScore: result.score,
    },
  })

  return result.score
}

// =============================================================================
// BATCH UPDATE
// =============================================================================

/**
 * Update trust scores for all users (for cron job)
 */
export async function updateAllTrustScores(): Promise<number> {
  const users = await prisma.user.findMany({
    select: { id: true },
  })

  let updated = 0
  for (const user of users) {
    try {
      await updateUserTrustScore(user.id)
      updated++
    } catch (error) {
      console.error(`[trustScore] Failed to update user ${user.id}:`, error)
    }
  }

  return updated
}

// =============================================================================
// WEIGHT CALCULATION
// =============================================================================

/**
 * Get the weight multiplier for an activity based on source and user trust
 *
 * Sensor activities always get weight 1.0
 * Manual activities get weight based on user's trust score
 */
export async function getActivityWeight(
  userId: string,
  source: string | null
): Promise<number> {
  // Sensor sources always have full weight
  if (isSensorSource(source)) {
    return 1.0
  }

  // Get user's trust score for manual entries
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    select: { trustScore: true },
  })

  return stats?.trustScore ?? CONFIG.MIN_SCORE
}

/**
 * Get trust score without database lookup (for when you already have it)
 */
export function calculateActivityWeight(
  source: string | null,
  trustScore: number
): number {
  if (isSensorSource(source)) {
    return 1.0
  }
  return Math.max(CONFIG.MIN_SCORE, Math.min(CONFIG.MAX_SCORE, trustScore))
}
