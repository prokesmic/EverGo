/**
 * Intensity Validation
 *
 * Validates and potentially downgrades intensity claims to prevent gaming.
 * Race multipliers are powerful - they need guardrails.
 */

import { VerificationTier } from "@prisma/client"
import { IntensityMode, RACE_CONFIG } from "./constants"

// =============================================================================
// TYPES
// =============================================================================

export interface IntensityValidationInput {
  /** Claimed intensity mode */
  claimedIntensity: IntensityMode
  /** User's verification tier */
  verificationTier: VerificationTier
  /** Whether activity is linked to an event */
  hasEventLink: boolean
  /** Number of races this user has claimed this week */
  weeklyRaceCount: number
  /** User's subscription tier (for Pro benefits) */
  isPro?: boolean
}

export interface IntensityValidationResult {
  /** Final allowed intensity */
  allowedIntensity: IntensityMode
  /** Whether it was downgraded */
  wasDowngraded: boolean
  /** Reason for downgrade (if any) */
  downgradeReason?: string
  /** Message for user */
  userMessage?: string
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export function validateIntensity(
  input: IntensityValidationInput
): IntensityValidationResult {
  const {
    claimedIntensity,
    verificationTier,
    hasEventLink,
    weeklyRaceCount,
    isPro,
  } = input

  // Non-race intensities are always allowed
  if (claimedIntensity !== "race") {
    return {
      allowedIntensity: claimedIntensity,
      wasDowngraded: false,
    }
  }

  // Race validation logic

  // 1. Event-linked races are always allowed
  if (hasEventLink) {
    return {
      allowedIntensity: "race",
      wasDowngraded: false,
    }
  }

  // 2. Gold tier users get unlimited race claims
  if (verificationTier === RACE_CONFIG.unlimitedRaceTier) {
    return {
      allowedIntensity: "race",
      wasDowngraded: false,
    }
  }

  // 3. Pro subscribers get higher limits
  const raceLimit = isPro
    ? RACE_CONFIG.maxUnverifiedRacesPerWeek * 2
    : RACE_CONFIG.maxUnverifiedRacesPerWeek

  // 4. Check weekly limit
  if (weeklyRaceCount >= raceLimit) {
    if (RACE_CONFIG.downgradeToHard) {
      return {
        allowedIntensity: "hard",
        wasDowngraded: true,
        downgradeReason: "weekly_race_limit_exceeded",
        userMessage: `Race limit reached (${raceLimit}/week). Activity recorded as "hard" intensity. Link to an event or upgrade to Gold for unlimited race tagging.`,
      }
    } else {
      // If downgrade is disabled, still allow but flag
      return {
        allowedIntensity: "race",
        wasDowngraded: false,
        userMessage: `Note: You've used ${weeklyRaceCount + 1} race tags this week.`,
      }
    }
  }

  // 5. Silver tier gets standard limit
  if (verificationTier === "SILVER") {
    return {
      allowedIntensity: "race",
      wasDowngraded: false,
    }
  }

  // 6. Bronze tier - more restrictive
  if (verificationTier === "BRONZE") {
    // Bronze users need event link or have lower limit
    const bronzeLimit = Math.max(1, Math.floor(raceLimit / 2))
    if (weeklyRaceCount >= bronzeLimit) {
      return {
        allowedIntensity: "hard",
        wasDowngraded: true,
        downgradeReason: "bronze_race_limit",
        userMessage: `Bronze accounts can tag ${bronzeLimit} races/week without event link. Upgrade or link to event for race multiplier.`,
      }
    }
  }

  // Default: allow
  return {
    allowedIntensity: "race",
    wasDowngraded: false,
  }
}

// =============================================================================
// UTILITY: Get weekly race count for user
// =============================================================================

import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek } from "date-fns"

export async function getUserWeeklyRaceCount(userId: string): Promise<number> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const count = await prisma.activity.count({
    where: {
      userId,
      isRace: true,
      activityDate: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
  })

  return count
}

// =============================================================================
// UTILITY: Map RPE to intensity mode
// =============================================================================

export function rpeToIntensityMode(rpe: number | null | undefined): IntensityMode {
  if (rpe == null) return "moderate"

  if (rpe <= 3) return "easy"
  if (rpe <= 5) return "moderate"
  if (rpe <= 7) return "hard"
  return "race"
}

export function intensityModeToRPE(mode: IntensityMode): number {
  switch (mode) {
    case "easy":
      return 2
    case "moderate":
      return 5
    case "hard":
      return 7
    case "race":
      return 9
    default:
      return 5
  }
}
