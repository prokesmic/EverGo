/**
 * Community Goals System
 *
 * Co-operative challenges that the whole community works toward.
 * Non-competitive - everyone contributes, everyone wins together.
 *
 * Goals have:
 * - A target value (e.g., 1 million km)
 * - A time window (start/end dates)
 * - Optional scope (sport, city, country)
 * - Cosmetic badge rewards only
 */

import { prisma } from "@/lib/db"
import { CommunityGoalStatus } from "@prisma/client"
import { isAfter, isBefore } from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

export type GoalMetricType = "DISTANCE_KM" | "DURATION_MIN" | "ACTIVITIES"

export interface CommunityGoalSummary {
  id: string
  name: string
  description: string | null
  iconUrl: string | null
  targetValue: number
  currentValue: number
  progressPercent: number
  status: CommunityGoalStatus
  startDate: Date
  endDate: Date
  participantCount: number
  sportId: string | null
  cityId: string | null
  countryCode: string | null
  metricType: GoalMetricType
}

export interface ContributionResult {
  success: boolean
  error?: string
  newTotal?: number
  progressPercent?: number
  goalCompleted?: boolean
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Get all active community goals
 */
export async function getActiveCommunityGoals(
  filters?: {
    sportId?: string
    cityId?: string
    countryCode?: string
  }
): Promise<CommunityGoalSummary[]> {
  const now = new Date()

  const where: Record<string, unknown> = {
    status: "ACTIVE",
    startDate: { lte: now },
    endDate: { gte: now },
  }

  // Apply optional filters
  if (filters?.sportId) {
    where.OR = [{ sportId: null }, { sportId: filters.sportId }]
  }
  if (filters?.cityId) {
    where.cityId = { in: [null, filters.cityId] }
  }
  if (filters?.countryCode) {
    where.countryCode = { in: [null, filters.countryCode] }
  }

  const goals = await prisma.communityGoal.findMany({
    where,
    orderBy: { endDate: "asc" },
  })

  return goals.map(formatGoal)
}

/**
 * Get a specific community goal
 */
export async function getCommunityGoal(
  goalId: string
): Promise<CommunityGoalSummary | null> {
  const goal = await prisma.communityGoal.findUnique({
    where: { id: goalId },
  })

  if (!goal) return null
  return formatGoal(goal)
}

/**
 * Contribute to a community goal from an activity
 */
export async function contributeToGoal(
  goalId: string,
  userId: string,
  value: number,
  activityId?: string
): Promise<ContributionResult> {
  const goal = await prisma.communityGoal.findUnique({
    where: { id: goalId },
  })

  if (!goal) {
    return { success: false, error: "Goal not found" }
  }

  if (goal.status !== "ACTIVE") {
    return { success: false, error: "Goal is not active" }
  }

  const now = new Date()
  if (isBefore(now, goal.startDate) || isAfter(now, goal.endDate)) {
    return { success: false, error: "Goal is not within active period" }
  }

  // Create contribution and update goal in transaction
  const [contribution, updatedGoal] = await prisma.$transaction([
    prisma.communityGoalContribution.create({
      data: {
        goalId,
        userId,
        value,
        activityId,
      },
    }),
    prisma.communityGoal.update({
      where: { id: goalId },
      data: {
        currentValue: { increment: value },
        participantCount: {
          increment: 1, // This is a rough count, could be refined
        },
      },
    }),
  ])

  const newTotal = updatedGoal.currentValue
  const progressPercent = Math.min(100, (newTotal / goal.targetValue) * 100)
  const goalCompleted = newTotal >= goal.targetValue

  // If goal is completed, update status
  if (goalCompleted && goal.status === "ACTIVE") {
    await prisma.communityGoal.update({
      where: { id: goalId },
      data: { status: "COMPLETED" },
    })
  }

  return {
    success: true,
    newTotal,
    progressPercent,
    goalCompleted,
  }
}

/**
 * Auto-contribute from an activity based on matching goals
 */
export async function autoContributeFromActivity(
  userId: string,
  activityId: string,
  sportId: string | null,
  durationSeconds: number,
  distanceMeters: number
): Promise<number> {
  // Find all matching active goals
  const now = new Date()

  const matchingGoals = await prisma.communityGoal.findMany({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
      OR: [
        { sportId: null }, // Global goals
        { sportId: sportId }, // Sport-specific goals
      ],
    },
  })

  let contributionCount = 0

  for (const goal of matchingGoals) {
    let value = 0

    switch (goal.metricType) {
      case "DISTANCE_KM":
        value = distanceMeters / 1000
        break
      case "DURATION_MIN":
        value = durationSeconds / 60
        break
      case "ACTIVITIES":
        value = 1
        break
    }

    if (value > 0) {
      await contributeToGoal(goal.id, userId, value, activityId)
      contributionCount++
    }
  }

  return contributionCount
}

/**
 * Get user's contributions to a goal
 */
export async function getUserContributions(
  userId: string,
  goalId: string
): Promise<{
  totalContributed: number
  contributionCount: number
}> {
  const contributions = await prisma.communityGoalContribution.aggregate({
    where: { goalId, userId },
    _sum: { value: true },
    _count: true,
  })

  return {
    totalContributed: contributions._sum.value ?? 0,
    contributionCount: contributions._count,
  }
}

/**
 * Update goal statuses (call from cron)
 * Marks expired goals as FAILED if not completed
 */
export async function updateGoalStatuses(): Promise<{
  activated: number
  failed: number
}> {
  const now = new Date()

  // Activate upcoming goals that have started
  const activated = await prisma.communityGoal.updateMany({
    where: {
      status: "UPCOMING",
      startDate: { lte: now },
    },
    data: { status: "ACTIVE" },
  })

  // Fail active goals that have expired without completion
  const expiredGoals = await prisma.communityGoal.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
  })

  let failedCount = 0
  for (const goal of expiredGoals) {
    if (goal.currentValue < goal.targetValue) {
      await prisma.communityGoal.update({
        where: { id: goal.id },
        data: { status: "FAILED" },
      })
      failedCount++
    } else {
      // Goal was completed but status not updated
      await prisma.communityGoal.update({
        where: { id: goal.id },
        data: { status: "COMPLETED" },
      })
    }
  }

  return { activated: activated.count, failed: failedCount }
}

// =============================================================================
// HELPERS
// =============================================================================

function formatGoal(goal: {
  id: string
  name: string
  description: string | null
  iconUrl: string | null
  targetValue: number
  currentValue: number
  status: CommunityGoalStatus
  startDate: Date
  endDate: Date
  participantCount: number
  sportId: string | null
  cityId: string | null
  countryCode: string | null
  metricType: string
}): CommunityGoalSummary {
  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    iconUrl: goal.iconUrl,
    targetValue: goal.targetValue,
    currentValue: goal.currentValue,
    progressPercent: Math.min(100, (goal.currentValue / goal.targetValue) * 100),
    status: goal.status,
    startDate: goal.startDate,
    endDate: goal.endDate,
    participantCount: goal.participantCount,
    sportId: goal.sportId,
    cityId: goal.cityId,
    countryCode: goal.countryCode,
    metricType: goal.metricType as GoalMetricType,
  }
}
