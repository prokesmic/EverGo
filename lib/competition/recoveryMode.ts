/**
 * Recovery Mode System
 *
 * Allows users to pause ranking decay during rest/injury periods.
 * Prevents competition fatigue while maintaining fairness.
 *
 * Rules:
 * - Minimum duration: 3 days
 * - Maximum uses per season: 2
 * - Cooldown between uses: 7 days
 * - Does NOT freeze activity logging
 * - Pauses ELO/rank decay only
 */

import { prisma } from "@/lib/db"
import { addDays, differenceInDays, isAfter, isBefore } from "date-fns"

// =============================================================================
// CONSTANTS
// =============================================================================

export const RECOVERY_CONFIG = {
  /** Minimum recovery period (days) */
  minDurationDays: 3,
  /** Maximum recovery period (days) */
  maxDurationDays: 14,
  /** Maximum uses per season */
  maxUsesPerSeason: 2,
  /** Cooldown between uses (days) */
  cooldownDays: 7,
}

// =============================================================================
// TYPES
// =============================================================================

export interface RecoveryModeStatus {
  isActive: boolean
  startedAt: Date | null
  endsAt: Date | null
  usesRemaining: number
  canActivate: boolean
  cannotActivateReason?: string
  daysRemaining?: number
}

export interface ActivateRecoveryResult {
  success: boolean
  error?: string
  recoveryEndsAt?: Date
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Get the current recovery mode status for a user
 */
export async function getRecoveryModeStatus(
  userId: string
): Promise<RecoveryModeStatus> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
    select: {
      isRecoveryMode: true,
      recoveryModeStartedAt: true,
      recoveryModeEndsAt: true,
      recoveryModeUsesThisSeason: true,
      lastRecoveryModeEndedAt: true,
    },
  })

  if (!streak) {
    return {
      isActive: false,
      startedAt: null,
      endsAt: null,
      usesRemaining: RECOVERY_CONFIG.maxUsesPerSeason,
      canActivate: true,
    }
  }

  const now = new Date()
  const usesRemaining =
    RECOVERY_CONFIG.maxUsesPerSeason - streak.recoveryModeUsesThisSeason

  // Check if recovery mode is currently active
  const isActive = Boolean(
    streak.isRecoveryMode &&
    streak.recoveryModeEndsAt &&
    isAfter(streak.recoveryModeEndsAt, now)
  )

  // Calculate days remaining if active
  let daysRemaining: number | undefined
  if (isActive && streak.recoveryModeEndsAt) {
    daysRemaining = Math.ceil(
      differenceInDays(streak.recoveryModeEndsAt, now)
    )
  }

  // Check if user can activate recovery mode
  const { canActivate, reason } = checkCanActivate(streak, now)

  return {
    isActive,
    startedAt: streak.recoveryModeStartedAt,
    endsAt: streak.recoveryModeEndsAt,
    usesRemaining,
    canActivate,
    cannotActivateReason: reason,
    daysRemaining,
  }
}

/**
 * Activate recovery mode for a user
 */
export async function activateRecoveryMode(
  userId: string,
  durationDays: number = RECOVERY_CONFIG.minDurationDays
): Promise<ActivateRecoveryResult> {
  // Validate duration
  const clampedDuration = Math.max(
    RECOVERY_CONFIG.minDurationDays,
    Math.min(RECOVERY_CONFIG.maxDurationDays, durationDays)
  )

  const now = new Date()
  const endsAt = addDays(now, clampedDuration)

  // Get or create streak record
  let streak = await prisma.userStreak.findUnique({
    where: { userId },
  })

  if (!streak) {
    // Create streak record if doesn't exist
    streak = await prisma.userStreak.create({
      data: { userId },
    })
  }

  // Check if can activate
  const { canActivate, reason } = checkCanActivate(
    {
      isRecoveryMode: streak.isRecoveryMode,
      recoveryModeEndsAt: streak.recoveryModeEndsAt,
      recoveryModeUsesThisSeason: streak.recoveryModeUsesThisSeason,
      lastRecoveryModeEndedAt: streak.lastRecoveryModeEndedAt,
    },
    now
  )

  if (!canActivate) {
    return { success: false, error: reason }
  }

  // Activate recovery mode
  await prisma.userStreak.update({
    where: { userId },
    data: {
      isRecoveryMode: true,
      recoveryModeStartedAt: now,
      recoveryModeEndsAt: endsAt,
      recoveryModeUsesThisSeason: {
        increment: 1,
      },
    },
  })

  return { success: true, recoveryEndsAt: endsAt }
}

/**
 * Deactivate recovery mode early
 */
export async function deactivateRecoveryMode(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
    select: { isRecoveryMode: true },
  })

  if (!streak?.isRecoveryMode) {
    return { success: false, error: "Recovery mode is not active" }
  }

  await prisma.userStreak.update({
    where: { userId },
    data: {
      isRecoveryMode: false,
      lastRecoveryModeEndedAt: new Date(),
    },
  })

  return { success: true }
}

/**
 * Check if a user is in recovery mode (for decay calculations)
 */
export async function isInRecoveryMode(userId: string): Promise<boolean> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
    select: {
      isRecoveryMode: true,
      recoveryModeEndsAt: true,
    },
  })

  if (!streak) return false

  const now = new Date()
  return (
    streak.isRecoveryMode &&
    streak.recoveryModeEndsAt !== null &&
    isAfter(streak.recoveryModeEndsAt, now)
  )
}

/**
 * Reset recovery mode uses at season start (call from season cron)
 */
export async function resetRecoveryModeUses(userIds?: string[]): Promise<number> {
  const where = userIds ? { userId: { in: userIds } } : {}

  const result = await prisma.userStreak.updateMany({
    where,
    data: {
      recoveryModeUsesThisSeason: 0,
    },
  })

  return result.count
}

// =============================================================================
// HELPERS
// =============================================================================

interface CanActivateCheck {
  isRecoveryMode: boolean
  recoveryModeEndsAt: Date | null
  recoveryModeUsesThisSeason: number
  lastRecoveryModeEndedAt: Date | null
}

function checkCanActivate(
  streak: CanActivateCheck,
  now: Date
): { canActivate: boolean; reason?: string } {
  // Check if already in recovery mode
  if (
    streak.isRecoveryMode &&
    streak.recoveryModeEndsAt &&
    isAfter(streak.recoveryModeEndsAt, now)
  ) {
    return {
      canActivate: false,
      reason: "Recovery mode is already active",
    }
  }

  // Check uses limit
  if (streak.recoveryModeUsesThisSeason >= RECOVERY_CONFIG.maxUsesPerSeason) {
    return {
      canActivate: false,
      reason: `Maximum ${RECOVERY_CONFIG.maxUsesPerSeason} recovery periods per season`,
    }
  }

  // Check cooldown
  if (streak.lastRecoveryModeEndedAt) {
    const cooldownEnds = addDays(
      streak.lastRecoveryModeEndedAt,
      RECOVERY_CONFIG.cooldownDays
    )
    if (isBefore(now, cooldownEnds)) {
      const daysLeft = Math.ceil(differenceInDays(cooldownEnds, now))
      return {
        canActivate: false,
        reason: `Cooldown active: ${daysLeft} days until next recovery period`,
      }
    }
  }

  return { canActivate: true }
}
