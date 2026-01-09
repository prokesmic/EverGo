/**
 * Dynamic Targets System
 *
 * User-configurable goals with progress tracking.
 *
 * Schema: Target model with targetValue, currentValue, targetDate, achievedAt
 * Status enum: ACTIVE, ACHIEVED, ABANDONED, EXPIRED
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"
import { TargetStatus } from "@prisma/client"

export interface Target {
  id: string
  userId: string
  disciplineId: string | null
  benchmarkId: string | null
  targetValue: number
  currentValue: number | null
  startValue: number | null
  targetDate: Date | null
  status: TargetStatus
  progressPct: number | null
  isOnTrack: boolean | null
  achievedAt: Date | null
  createdAt: Date
}

export interface CreateTargetParams {
  userId: string
  disciplineId?: string
  benchmarkId?: string
  targetValue: number
  targetDate?: Date
}

/**
 * Create a new target
 */
export async function createTarget(params: CreateTargetParams): Promise<Target | null> {
  if (!isFlagEnabled("enableDynamicTargets")) {
    return null
  }

  const { userId, disciplineId, benchmarkId, targetValue, targetDate } = params

  // Benchmark-based targets deprecated in V6
  // Current value tracking for benchmarks removed
  const currentValue: number | null = null
  const startValue: number | null = null

  if (benchmarkId) {
    console.warn("[Deprecated] Benchmark-based targets removed in V6")
  }

  const progressPct = currentValue != null && targetValue > 0
    ? Math.min(100, (currentValue / targetValue) * 100)
    : null

  const target = await prisma.target.create({
    data: {
      userId,
      disciplineId,
      benchmarkId,
      targetValue,
      targetDate,
      currentValue,
      startValue,
      progressPct,
      status: "ACTIVE",
    },
  })

  return {
    id: target.id,
    userId: target.userId,
    disciplineId: target.disciplineId,
    benchmarkId: target.benchmarkId,
    targetValue: target.targetValue,
    currentValue: target.currentValue,
    startValue: target.startValue,
    targetDate: target.targetDate,
    status: target.status,
    progressPct: target.progressPct,
    isOnTrack: target.isOnTrack,
    achievedAt: target.achievedAt,
    createdAt: target.createdAt,
  }
}

/**
 * Get user's targets
 */
export async function getUserTargets(userId: string, statusFilter?: TargetStatus): Promise<Target[]> {
  if (!isFlagEnabled("enableDynamicTargets")) {
    return []
  }

  const targets = await prisma.target.findMany({
    where: {
      userId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: [{ status: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
  })

  return targets.map((t) => ({
    id: t.id,
    userId: t.userId,
    disciplineId: t.disciplineId,
    benchmarkId: t.benchmarkId,
    targetValue: t.targetValue,
    currentValue: t.currentValue,
    startValue: t.startValue,
    targetDate: t.targetDate,
    status: t.status,
    progressPct: t.progressPct,
    isOnTrack: t.isOnTrack,
    achievedAt: t.achievedAt,
    createdAt: t.createdAt,
  }))
}

/**
 * Update target progress
 */
export async function updateTargetProgress(
  targetId: string,
  newValue: number
): Promise<Target | null> {
  const target = await prisma.target.findUnique({
    where: { id: targetId },
  })

  if (!target || target.status !== "ACTIVE") {
    return null
  }

  const progressPct = Math.min(100, (newValue / target.targetValue) * 100)
  const isAchieved = progressPct >= 100

  const updated = await prisma.target.update({
    where: { id: targetId },
    data: {
      currentValue: newValue,
      progressPct,
      status: isAchieved ? "ACHIEVED" : "ACTIVE",
      achievedAt: isAchieved ? new Date() : null,
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    disciplineId: updated.disciplineId,
    benchmarkId: updated.benchmarkId,
    targetValue: updated.targetValue,
    currentValue: updated.currentValue,
    startValue: updated.startValue,
    targetDate: updated.targetDate,
    status: updated.status,
    progressPct: updated.progressPct,
    isOnTrack: updated.isOnTrack,
    achievedAt: updated.achievedAt,
    createdAt: updated.createdAt,
  }
}

/**
 * Check all user targets and update progress
 */
export async function refreshUserTargets(userId: string): Promise<void> {
  if (!isFlagEnabled("enableDynamicTargets")) {
    return
  }

  const targets = await prisma.target.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
  })

  for (const target of targets) {
    const newValue = target.currentValue

    // Benchmark-based targets deprecated in V6 - skip benchmark updates
    if (target.benchmarkId) {
      continue
    }

    // Update progress if value changed
    if (newValue != null && newValue !== target.currentValue) {
      await updateTargetProgress(target.id, newValue)
    }

    // Check for deadline expiry
    if (target.targetDate && new Date() > target.targetDate && target.status === "ACTIVE") {
      const progress = target.currentValue != null
        ? (target.currentValue / target.targetValue) * 100
        : 0

      if (progress < 100) {
        await prisma.target.update({
          where: { id: target.id },
          data: { status: "EXPIRED" },
        })
      }
    }
  }
}

/**
 * Abandon a target
 */
export async function abandonTarget(targetId: string, userId: string): Promise<boolean> {
  const target = await prisma.target.findUnique({
    where: { id: targetId },
  })

  if (!target || target.userId !== userId || target.status !== "ACTIVE") {
    return false
  }

  await prisma.target.update({
    where: { id: targetId },
    data: { status: "ABANDONED" },
  })

  return true
}

/**
 * Get suggested targets (benchmark-based suggestions removed in V6)
 */
export async function getSuggestedTargets(
  _userId: string
): Promise<Array<Omit<CreateTargetParams, "userId">>> {
  console.warn("[Deprecated] Benchmark-based target suggestions removed in V6")
  return []
}
