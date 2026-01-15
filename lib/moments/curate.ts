/**
 * Moment Weekly Curation (V12)
 *
 * Keeps only the top N moments per week to prevent feed spam.
 * Runs as a background job or on-demand when moments are fetched.
 *
 * Process:
 * 1. For each user, get all moments from current/previous week
 * 2. Score them using scoreMoment
 * 3. Keep top 3, mark others as suppressed
 * 4. Suppressed moments are still stored but hidden from main feed
 */

import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"
import { scoreMoment, MOMENTS_PER_WEEK, passesQualityThreshold } from "./scoreMoment"
import type { MomentType, ProofLevel, UserPersona } from "@prisma/client"
import { isFlagEnabled } from "@/lib/flags"

// =============================================================================
// TYPES
// =============================================================================

export interface CurationResult {
  userId: string
  weekStart: Date
  totalMoments: number
  keptMoments: number
  suppressedMoments: number
}

// =============================================================================
// MAIN CURATION FUNCTION
// =============================================================================

/**
 * Curate moments for a specific user's week
 */
export async function curateWeeklyMoments(
  userId: string,
  weekDate: Date = new Date()
): Promise<CurationResult> {
  if (!isFlagEnabled("MOMENTS_QUALITY_V1")) {
    return {
      userId,
      weekStart: startOfWeek(weekDate, { weekStartsOn: 1 }),
      totalMoments: 0,
      keptMoments: 0,
      suppressedMoments: 0,
    }
  }

  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })

  // Get user persona for priority weighting
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { persona: true },
  })

  // Get all non-dismissed moments for the week
  const moments = await prisma.moment.findMany({
    where: {
      userId,
      createdAt: { gte: weekStart, lte: weekEnd },
      dismissed: false,
    },
    include: {
      activity: {
        select: {
          proofLevel: true,
          verificationTier: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (moments.length === 0) {
    return {
      userId,
      weekStart,
      totalMoments: 0,
      keptMoments: 0,
      suppressedMoments: 0,
    }
  }

  // Score all moments
  const scoredMoments = moments.map((moment) => {
    const scoreResult = scoreMoment({
      type: moment.type,
      value: moment.value,
      previousValue: moment.previousValue,
      proofLevel: moment.activity?.proofLevel,
      persona: user?.persona,
    })
    return {
      id: moment.id,
      score: scoreResult.score,
      priorityForPersona: scoreResult.priorityForPersona,
    }
  })

  // Sort by priority and score
  scoredMoments.sort((a, b) => {
    if (a.priorityForPersona !== b.priorityForPersona) {
      return a.priorityForPersona ? -1 : 1
    }
    return b.score - a.score
  })

  // Keep top N
  const momentsToKeep = new Set(
    scoredMoments.slice(0, MOMENTS_PER_WEEK).map((m) => m.id)
  )

  // Update moments in database
  const now = new Date()
  const updatePromises: Promise<any>[] = []

  for (const scored of scoredMoments) {
    const shouldSuppress = !momentsToKeep.has(scored.id)

    updatePromises.push(
      prisma.moment.update({
        where: { id: scored.id },
        data: {
          impactScore: scored.score,
          suppressed: shouldSuppress,
          suppressedAt: shouldSuppress ? now : null,
        },
      })
    )
  }

  await Promise.all(updatePromises)

  return {
    userId,
    weekStart,
    totalMoments: moments.length,
    keptMoments: momentsToKeep.size,
    suppressedMoments: moments.length - momentsToKeep.size,
  }
}

/**
 * Curate moments for multiple users (batch job)
 */
export async function curateAllUsersWeeklyMoments(
  weekDate: Date = new Date()
): Promise<{ processed: number; total: CurationResult[] }> {
  if (!isFlagEnabled("MOMENTS_QUALITY_V1")) {
    return { processed: 0, total: [] }
  }

  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 })

  // Find all users with moments this week
  const usersWithMoments = await prisma.moment.groupBy({
    by: ["userId"],
    where: {
      createdAt: { gte: weekStart, lte: weekEnd },
      dismissed: false,
    },
    _count: true,
  })

  // Only process users with more than MOMENTS_PER_WEEK
  const usersToProcess = usersWithMoments.filter(
    (u) => u._count > MOMENTS_PER_WEEK
  )

  const results: CurationResult[] = []

  for (const { userId } of usersToProcess) {
    const result = await curateWeeklyMoments(userId, weekDate)
    results.push(result)
  }

  return {
    processed: results.length,
    total: results,
  }
}

// =============================================================================
// QUERY HELPERS
// =============================================================================

/**
 * Get curated moments for a user (excludes suppressed)
 */
export async function getCuratedMoments(
  userId: string,
  options: {
    limit?: number
    includeSuppressed?: boolean
  } = {}
): Promise<any[]> {
  const { limit = 10, includeSuppressed = false } = options

  const where: any = {
    userId,
    dismissed: false,
  }

  // Only filter suppressed if quality flag is enabled
  if (isFlagEnabled("MOMENTS_QUALITY_V1") && !includeSuppressed) {
    where.suppressed = false
  }

  return prisma.moment.findMany({
    where,
    orderBy: [
      { impactScore: "desc" },
      { createdAt: "desc" },
    ],
    take: limit,
    include: {
      activity: {
        select: {
          id: true,
          title: true,
          sportId: true,
        },
      },
    },
  })
}

/**
 * Get moment stats for a user
 */
export async function getMomentStats(userId: string): Promise<{
  total: number
  thisWeek: number
  suppressed: number
  shared: number
}> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const [total, thisWeek, suppressed, shared] = await Promise.all([
    prisma.moment.count({
      where: { userId, dismissed: false },
    }),
    prisma.moment.count({
      where: {
        userId,
        dismissed: false,
        createdAt: { gte: weekStart },
      },
    }),
    prisma.moment.count({
      where: { userId, dismissed: false, suppressed: true },
    }),
    prisma.moment.count({
      where: { userId, dismissed: false, sharedAt: { not: null } },
    }),
  ])

  return { total, thisWeek, suppressed, shared }
}

// =============================================================================
// CURATION TRIGGER
// =============================================================================

/**
 * Score and potentially suppress a moment immediately after creation
 *
 * Call this when a moment is created to assign initial score.
 * The weekly curation job will finalize suppression.
 */
export async function scoreNewMoment(
  momentId: string,
  persona?: UserPersona | null
): Promise<{ score: number; priorityForPersona: boolean }> {
  if (!isFlagEnabled("MOMENTS_QUALITY_V1")) {
    return { score: 50, priorityForPersona: false }
  }

  const moment = await prisma.moment.findUnique({
    where: { id: momentId },
    include: {
      activity: {
        select: { proofLevel: true },
      },
    },
  })

  if (!moment) {
    return { score: 0, priorityForPersona: false }
  }

  const result = scoreMoment({
    type: moment.type,
    value: moment.value,
    previousValue: moment.previousValue,
    proofLevel: moment.activity?.proofLevel,
    persona,
  })

  // Update moment with score
  await prisma.moment.update({
    where: { id: momentId },
    data: { impactScore: result.score },
  })

  return {
    score: result.score,
    priorityForPersona: result.priorityForPersona,
  }
}
