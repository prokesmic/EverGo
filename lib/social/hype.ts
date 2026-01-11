/**
 * Hype System - Limited Daily Kudos Boost
 *
 * Allows users to "hype" activities with an extra boost effect.
 * Prevents spamming through daily limits.
 *
 * Rules:
 * - Each user gets 3 hypes per day
 * - Hype is worth 5x a normal kudos for recognition
 * - Can't hype your own activities
 * - Can't hype the same activity twice
 * - Resets at midnight UTC
 */

import { prisma } from "@/lib/db"
import { startOfDay, endOfDay } from "date-fns"

// =============================================================================
// CONSTANTS
// =============================================================================

export const HYPE_CONFIG = {
  /** Daily hypes allowed per user */
  dailyLimit: 3,
  /** Hype multiplier vs normal kudos */
  multiplier: 5,
  /** Reset time (UTC hour) */
  resetHour: 0,
}

// =============================================================================
// TYPES
// =============================================================================

export interface HypeStatus {
  remaining: number
  usedToday: number
  resetAt: Date
  canHype: boolean
}

export interface HypeResult {
  success: boolean
  error?: string
  hypesRemaining?: number
}

export interface ActivityHypeInfo {
  hypeCount: number
  isHypedByUser: boolean
  topHypers: {
    userId: string
    displayName: string
    avatarUrl: string | null
  }[]
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Get user's hype status for today
 */
export async function getHypeStatus(userId: string): Promise<HypeStatus> {
  const today = startOfDay(new Date())
  const tomorrow = endOfDay(new Date())

  // Count today's hypes
  const usedToday = await prisma.activityHype.count({
    where: {
      userId,
      createdAt: {
        gte: today,
        lte: tomorrow,
      },
    },
  })

  const resetAt = new Date(tomorrow)
  resetAt.setUTCHours(HYPE_CONFIG.resetHour, 0, 0, 0)
  if (resetAt <= new Date()) {
    resetAt.setDate(resetAt.getDate() + 1)
  }

  return {
    remaining: Math.max(0, HYPE_CONFIG.dailyLimit - usedToday),
    usedToday,
    resetAt,
    canHype: usedToday < HYPE_CONFIG.dailyLimit,
  }
}

/**
 * Hype an activity
 */
export async function hypeActivity(
  userId: string,
  activityId: string
): Promise<HypeResult> {
  // Get the activity
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { userId: true },
  })

  if (!activity) {
    return { success: false, error: "Activity not found" }
  }

  // Can't hype own activity
  if (activity.userId === userId) {
    return { success: false, error: "Cannot hype your own activity" }
  }

  // Check if already hyped
  const existingHype = await prisma.activityHype.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
  })

  if (existingHype) {
    return { success: false, error: "Already hyped this activity" }
  }

  // Check daily limit
  const status = await getHypeStatus(userId)
  if (!status.canHype) {
    return { success: false, error: "Daily hype limit reached" }
  }

  // Create hype
  await prisma.activityHype.create({
    data: {
      userId,
      activityId,
    },
  })

  // Create notification for activity owner
  await prisma.notification.create({
    data: {
      userId: activity.userId,
      type: "HYPE_RECEIVED",
      title: "Activity Hyped!",
      message: "Someone hyped your activity!",
      data: JSON.stringify({
        activityId,
        hyperId: userId,
      }),
    },
  })

  return {
    success: true,
    hypesRemaining: status.remaining - 1,
  }
}

/**
 * Remove hype from an activity
 */
export async function unhypeActivity(
  userId: string,
  activityId: string
): Promise<HypeResult> {
  const hype = await prisma.activityHype.findUnique({
    where: {
      userId_activityId: {
        userId,
        activityId,
      },
    },
  })

  if (!hype) {
    return { success: false, error: "Hype not found" }
  }

  await prisma.activityHype.delete({
    where: { id: hype.id },
  })

  // Note: Doesn't restore daily limit (prevents gaming)

  return { success: true }
}

/**
 * Get hype info for an activity
 */
export async function getActivityHypeInfo(
  activityId: string,
  viewerId?: string
): Promise<ActivityHypeInfo> {
  const hypes = await prisma.activityHype.findMany({
    where: { activityId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const isHypedByUser = viewerId
    ? hypes.some((h) => h.userId === viewerId)
    : false

  const totalCount = await prisma.activityHype.count({
    where: { activityId },
  })

  return {
    hypeCount: totalCount,
    isHypedByUser,
    topHypers: hypes.map((h) => ({
      userId: h.user.id,
      displayName: h.user.displayName ?? "User",
      avatarUrl: h.user.avatarUrl,
    })),
  }
}

/**
 * Get user's most hyped activities
 */
export async function getUserMostHypedActivities(
  userId: string,
  limit: number = 5
): Promise<
  Array<{
    activityId: string
    title: string
    hypeCount: number
  }>
> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      _count: {
        select: { hypes: true },
      },
    },
    orderBy: {
      hypes: { _count: "desc" },
    },
    take: limit,
  })

  return activities
    .filter((a) => a._count.hypes > 0)
    .map((a) => ({
      activityId: a.id,
      title: a.title,
      hypeCount: a._count.hypes,
    }))
}

/**
 * Get total hypes received by user
 */
export async function getUserTotalHypesReceived(
  userId: string
): Promise<number> {
  const count = await prisma.activityHype.count({
    where: {
      activity: { userId },
    },
  })

  return count
}
