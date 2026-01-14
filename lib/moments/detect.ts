/**
 * Moments Detection System (V11)
 *
 * Automatically detects notable events and creates shareable moments:
 * - Personal Records
 * - Streak Milestones (7, 14, 30, 100 days)
 * - Activity Milestones (100th, 500th, 1000th)
 * - Rank Ups
 * - Competition Wins
 * - Badge Earnings
 * - First Activity in Sport
 * - Big Activities (exceptional distance/duration)
 */

import { prisma } from "@/lib/db"
import type { MomentType, Activity, Moment } from "@prisma/client"

// =============================================================================
// TYPES
// =============================================================================

export interface DetectedMoment {
  type: MomentType
  title: string
  description: string
  activityId?: string
  rivalryId?: string
  gauntletId?: string
  badgeId?: string
  value?: number
  previousValue?: number
  unit?: string
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const STREAK_MILESTONES = [7, 14, 30, 50, 100, 200, 365]
const ACTIVITY_MILESTONES = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

// Thresholds for "big activity" detection (percentile above user's average)
const BIG_ACTIVITY_MULTIPLIER = 1.5 // 50% above average

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

/**
 * Detect moments after an activity is logged
 */
export async function detectMomentsAfterActivity(
  userId: string,
  activityId: string
): Promise<DetectedMoment[]> {
  const moments: DetectedMoment[] = []

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      discipline: { include: { sport: true } },
    },
  })

  if (!activity) return moments

  // Parallel detection
  const [
    prMoments,
    streakMoment,
    activityCountMoment,
    firstActivityMoment,
    bigActivityMoment,
  ] = await Promise.all([
    detectPersonalRecords(userId, activity),
    detectStreakMilestone(userId),
    detectActivityMilestone(userId),
    detectFirstActivity(userId, activity),
    detectBigActivity(userId, activity),
  ])

  moments.push(...prMoments)
  if (streakMoment) moments.push(streakMoment)
  if (activityCountMoment) moments.push(activityCountMoment)
  if (firstActivityMoment) moments.push(firstActivityMoment)
  if (bigActivityMoment) moments.push(bigActivityMoment)

  // Save detected moments to database
  if (moments.length > 0) {
    await saveMoments(userId, moments)
  }

  return moments
}

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Detect personal records
 */
async function detectPersonalRecords(
  userId: string,
  activity: Activity & { discipline: { sport: { slug: string; name: string } } | null }
): Promise<DetectedMoment[]> {
  const moments: DetectedMoment[] = []

  // Check for distance PR
  if (activity.distanceMeters && activity.distanceMeters > 0) {
    const previousBest = await prisma.activity.findFirst({
      where: {
        userId,
        id: { not: activity.id },
        disciplineId: activity.disciplineId,
        distanceMeters: { not: null },
      },
      orderBy: { distanceMeters: "desc" },
      select: { distanceMeters: true },
    })

    if (!previousBest || activity.distanceMeters > (previousBest.distanceMeters ?? 0)) {
      const sportName = activity.discipline?.sport?.name ?? "Activity"
      moments.push({
        type: "PERSONAL_RECORD",
        title: `New ${sportName} Distance PR!`,
        description: previousBest
          ? `Beat your previous best by ${formatDistance(activity.distanceMeters - (previousBest.distanceMeters ?? 0))}`
          : `Your first ${sportName.toLowerCase()} distance record!`,
        activityId: activity.id,
        value: activity.distanceMeters,
        previousValue: previousBest?.distanceMeters ?? undefined,
        unit: "meters",
      })
    }
  }

  // Check for duration PR (for session-based activities)
  if (activity.durationSeconds && activity.durationSeconds > 3600) {
    const previousBest = await prisma.activity.findFirst({
      where: {
        userId,
        id: { not: activity.id },
        disciplineId: activity.disciplineId,
        durationSeconds: { not: null },
      },
      orderBy: { durationSeconds: "desc" },
      select: { durationSeconds: true },
    })

    if (!previousBest || activity.durationSeconds > (previousBest.durationSeconds ?? 0)) {
      const sportName = activity.discipline?.sport?.name ?? "Activity"
      moments.push({
        type: "PERSONAL_RECORD",
        title: `Longest ${sportName} Session!`,
        description: `${formatDuration(activity.durationSeconds)} of activity`,
        activityId: activity.id,
        value: activity.durationSeconds,
        previousValue: previousBest?.durationSeconds ?? undefined,
        unit: "seconds",
      })
    }
  }

  return moments
}

/**
 * Detect streak milestones
 */
async function detectStreakMilestone(userId: string): Promise<DetectedMoment | null> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
    select: { currentStreak: true },
  })

  if (!streak) return null

  const currentStreak = streak.currentStreak

  // Check if we just hit a milestone
  if (STREAK_MILESTONES.includes(currentStreak)) {
    // Check if we already recorded this milestone
    const existingMoment = await prisma.moment.findFirst({
      where: {
        userId,
        type: "STREAK_MILESTONE",
        value: currentStreak,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
        },
      },
    })

    if (!existingMoment) {
      return {
        type: "STREAK_MILESTONE",
        title: `${currentStreak} Day Streak!`,
        description: getStreakMessage(currentStreak),
        value: currentStreak,
        unit: "days",
      }
    }
  }

  return null
}

/**
 * Detect activity count milestones
 */
async function detectActivityMilestone(userId: string): Promise<DetectedMoment | null> {
  const activityCount = await prisma.activity.count({
    where: { userId },
  })

  if (ACTIVITY_MILESTONES.includes(activityCount)) {
    // Check if we already recorded this milestone
    const existingMoment = await prisma.moment.findFirst({
      where: {
        userId,
        type: "ACTIVITY_MILESTONE",
        value: activityCount,
      },
    })

    if (!existingMoment) {
      return {
        type: "ACTIVITY_MILESTONE",
        title: `${activityCount}th Activity!`,
        description: getActivityMilestoneMessage(activityCount),
        value: activityCount,
        unit: "activities",
      }
    }
  }

  return null
}

/**
 * Detect first activity in a sport
 */
async function detectFirstActivity(
  userId: string,
  activity: Activity & { discipline: { sport: { slug: string; name: string } } | null }
): Promise<DetectedMoment | null> {
  if (!activity.discipline?.sport) return null

  const sportId = activity.discipline.sport.slug
  const sportName = activity.discipline.sport.name

  // Count activities in this sport
  const sportActivities = await prisma.activity.count({
    where: {
      userId,
      discipline: {
        sport: { slug: sportId },
      },
    },
  })

  if (sportActivities === 1) {
    return {
      type: "FIRST_ACTIVITY",
      title: `First ${sportName} Activity!`,
      description: `Welcome to your ${sportName.toLowerCase()} journey!`,
      activityId: activity.id,
    }
  }

  return null
}

/**
 * Detect exceptionally big activities
 */
async function detectBigActivity(
  userId: string,
  activity: Activity
): Promise<DetectedMoment | null> {
  // Get user's average stats for this discipline
  const stats = await prisma.activity.aggregate({
    where: {
      userId,
      disciplineId: activity.disciplineId,
      id: { not: activity.id },
    },
    _avg: {
      distanceMeters: true,
      durationSeconds: true,
      elevationGain: true,
    },
  })

  // Check if this activity is significantly above average
  if (
    activity.distanceMeters &&
    stats._avg.distanceMeters &&
    activity.distanceMeters > stats._avg.distanceMeters * BIG_ACTIVITY_MULTIPLIER
  ) {
    return {
      type: "BIG_ACTIVITY",
      title: "Epic Activity!",
      description: `This was ${Math.round(
        (activity.distanceMeters / stats._avg.distanceMeters) * 100
      )}% of your average distance!`,
      activityId: activity.id,
      value: activity.distanceMeters,
      previousValue: stats._avg.distanceMeters,
      unit: "meters",
    }
  }

  return null
}

// =============================================================================
// COMPETITION MOMENTS
// =============================================================================

/**
 * Create moment for rivalry win
 */
export async function createRivalryWinMoment(
  userId: string,
  rivalryId: string,
  opponentName: string
): Promise<Moment> {
  return prisma.moment.create({
    data: {
      userId,
      type: "RIVALRY_WIN",
      title: "Rivalry Victory!",
      description: `You defeated ${opponentName}!`,
      rivalryId,
    },
  })
}

/**
 * Create moment for gauntlet win
 */
export async function createGauntletWinMoment(
  userId: string,
  gauntletId: string,
  opponentName: string
): Promise<Moment> {
  return prisma.moment.create({
    data: {
      userId,
      type: "GAUNTLET_WIN",
      title: "Gauntlet Champion!",
      description: `You won the gauntlet against ${opponentName}!`,
      gauntletId,
    },
  })
}

/**
 * Create moment for rank up
 */
export async function createRankUpMoment(
  userId: string,
  newRank: number,
  previousRank: number,
  scope: string
): Promise<Moment> {
  return prisma.moment.create({
    data: {
      userId,
      type: "RANK_UP",
      title: "Rank Up!",
      description: `You moved from #${previousRank} to #${newRank} ${scope}!`,
      value: newRank,
      previousValue: previousRank,
    },
  })
}

// =============================================================================
// HELPERS
// =============================================================================

async function saveMoments(userId: string, moments: DetectedMoment[]): Promise<void> {
  await prisma.moment.createMany({
    data: moments.map((m) => ({
      userId,
      type: m.type,
      title: m.title,
      description: m.description,
      activityId: m.activityId,
      rivalryId: m.rivalryId,
      gauntletId: m.gauntletId,
      badgeId: m.badgeId,
      value: m.value,
      previousValue: m.previousValue,
      unit: m.unit,
    })),
  })
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} minutes`
}

function getStreakMessage(days: number): string {
  const messages: Record<number, string> = {
    7: "One week of consistency! You're building great habits.",
    14: "Two weeks strong! Keep the momentum going.",
    30: "A full month! You're officially dedicated.",
    50: "50 days! That's seriously impressive.",
    100: "100 days! You're in the elite consistency club.",
    200: "200 days! Absolutely legendary commitment.",
    365: "A full year! You're a consistency champion!",
  }
  return messages[days] ?? `${days} days of consistent activity!`
}

function getActivityMilestoneMessage(count: number): string {
  const messages: Record<number, string> = {
    10: "Double digits! You're getting started.",
    25: "25 activities! Building momentum.",
    50: "Half a hundred! Solid foundation.",
    100: "Century club! That's commitment.",
    250: "250 activities! You're a regular.",
    500: "500 activities! Seriously impressive.",
    1000: "1,000 activities! You're a machine!",
    2500: "2,500! Elite status unlocked.",
    5000: "5,000 activities! Absolutely legendary.",
  }
  return messages[count] ?? `${count} total activities logged!`
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Get user's recent moments
 */
export async function getUserMoments(
  userId: string,
  options: { limit?: number; includeDissmissed?: boolean } = {}
): Promise<Moment[]> {
  const { limit = 10, includeDissmissed = false } = options

  return prisma.moment.findMany({
    where: {
      userId,
      ...(includeDissmissed ? {} : { dismissed: false }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

/**
 * Dismiss a moment
 */
export async function dismissMoment(momentId: string, userId: string): Promise<void> {
  await prisma.moment.updateMany({
    where: { id: momentId, userId },
    data: { dismissed: true },
  })
}

/**
 * Celebrate a moment (mark as acknowledged)
 */
export async function celebrateMoment(momentId: string, userId: string): Promise<void> {
  await prisma.moment.updateMany({
    where: { id: momentId, userId },
    data: { celebratedAt: new Date() },
  })
}
