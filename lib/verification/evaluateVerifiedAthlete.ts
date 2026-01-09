/**
 * Verified Athlete Evaluation
 *
 * Evaluates whether a user qualifies for "Data Verified" status.
 *
 * Criteria:
 * - >= 5 verified activities in last 60 days (source != MANUAL)
 * - >= 1 verified PersonalBest in any discipline
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"

export interface VerifiedAthleteStatus {
  isVerified: boolean
  verifiedSince: Date | null
  verifiedActivityCount: number
  hasVerifiedPb: boolean
  requirements: {
    activitiesNeeded: number
    activitiesMet: boolean
    pbMet: boolean
  }
}

const REQUIRED_ACTIVITIES = 5
const ACTIVITY_WINDOW_DAYS = 60

/**
 * Evaluate if a user qualifies for Verified Athlete status
 */
export async function evaluateVerifiedAthlete(
  userId: string
): Promise<VerifiedAthleteStatus> {
  // Check feature flag
  if (!isFlagEnabled("enableVerifiedAthlete")) {
    return {
      isVerified: false,
      verifiedSince: null,
      verifiedActivityCount: 0,
      hasVerifiedPb: false,
      requirements: {
        activitiesNeeded: REQUIRED_ACTIVITIES,
        activitiesMet: false,
        pbMet: false,
      },
    }
  }

  // Calculate date threshold
  const windowStart = new Date()
  windowStart.setDate(windowStart.getDate() - ACTIVITY_WINDOW_DAYS)

  // Count verified activities in window
  const verifiedActivityCount = await prisma.activity.count({
    where: {
      userId,
      activityDate: { gte: windowStart },
      source: { not: "MANUAL" },
    },
  })

  // Benchmark PB check removed in V6 - verified status based on activity count only
  const activitiesMet = verifiedActivityCount >= REQUIRED_ACTIVITIES
  const isVerified = activitiesMet

  // Get existing user stats
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { verifiedSince: true, isVerifiedAthlete: true },
  })

  // Determine verifiedSince date
  let verifiedSince = userStats?.verifiedSince || null
  if (isVerified && !verifiedSince) {
    verifiedSince = new Date()
  } else if (!isVerified) {
    verifiedSince = null
  }

  return {
    isVerified,
    verifiedSince,
    verifiedActivityCount,
    hasVerifiedPb: true, // Deprecated in V6 - always true
    requirements: {
      activitiesNeeded: Math.max(0, REQUIRED_ACTIVITIES - verifiedActivityCount),
      activitiesMet,
      pbMet: true, // Deprecated in V6
    },
  }
}

/**
 * Update user's verified athlete status in the database
 */
export async function updateVerifiedAthleteStatus(
  userId: string
): Promise<VerifiedAthleteStatus> {
  const status = await evaluateVerifiedAthlete(userId)

  // Update user stats
  await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      isVerifiedAthlete: status.isVerified,
      verifiedSince: status.verifiedSince,
      verifiedActivityCount: status.verifiedActivityCount,
      lastVerificationCheck: new Date(),
    },
    update: {
      isVerifiedAthlete: status.isVerified,
      verifiedSince: status.verifiedSince,
      verifiedActivityCount: status.verifiedActivityCount,
      lastVerificationCheck: new Date(),
    },
  })

  return status
}

/**
 * Check if a user is verified (quick check from cached stats)
 */
export async function isUserVerified(userId: string): Promise<boolean> {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
    select: { isVerifiedAthlete: true },
  })

  return stats?.isVerifiedAthlete ?? false
}
