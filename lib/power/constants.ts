/**
 * Power System Constants
 *
 * Sport-aware duration saturation curves and intensity multipliers.
 * These constants define the Power economy and must be tuned carefully.
 *
 * Key Design Principles:
 * 1. Walking cannot outscore running purely by duration
 * 2. Diminishing returns after optimal duration (T1)
 * 3. Soft cap prevents multi-hour gaming
 * 4. Intensity has bounded impact for manual entries
 */

import { SportCategory } from "@prisma/client"

// =============================================================================
// SPORT CATEGORY DEFINITIONS
// =============================================================================

export type PowerSportCategory =
  | "ENDURANCE"      // Running, cycling, swimming - duration matters
  | "STRENGTH"       // Gym, weights - intensity matters more than duration
  | "SKILL_MIXED"    // Team sports, racket sports - session-based
  | "OUTDOOR"        // Hiking, climbing - effort + duration
  | "WATER_BOARD"    // Surfing, kitesurfing - session-based with intensity
  | "MINDBODY"       // Yoga, pilates - session-based, lower power ceiling
  | "GENERIC"        // Fallback

// Map Prisma SportCategory to Power category
export const SPORT_CATEGORY_MAP: Record<SportCategory, PowerSportCategory> = {
  ENDURANCE: "ENDURANCE",
  CYCLING: "ENDURANCE",
  SWIMMING: "ENDURANCE",
  STRENGTH: "STRENGTH",
  TEAM: "SKILL_MIXED",
  RACKET: "SKILL_MIXED",
  COMBAT: "STRENGTH",
  WATER_BOARD: "WATER_BOARD",
  OUTDOOR: "OUTDOOR",
  WINTER: "OUTDOOR",
  MINDBODY: "MINDBODY",
  GENERIC: "GENERIC",
}

// =============================================================================
// DURATION SATURATION CURVES
// =============================================================================

export interface SaturationConfig {
  /** Linear scaling up to T1 (minutes) */
  t1Minutes: number
  /** Diminishing returns between T1 and T2 */
  t2Minutes: number
  /** Near-flat after T2, soft cap at maxMinutes */
  maxMinutes: number
  /** Base power per minute in linear zone */
  basePowerPerMinute: number
  /** Diminishing rate between T1-T2 (0-1, lower = more diminishing) */
  diminishingRate: number
  /** Power multiplier after T2 (very low, essentially flat) */
  flatRate: number
}

export const SATURATION_CONFIGS: Record<PowerSportCategory, SaturationConfig> = {
  ENDURANCE: {
    t1Minutes: 45,        // Full credit up to 45 min
    t2Minutes: 180,       // Diminishing up to 3 hours
    maxMinutes: 360,      // Soft cap at 6 hours
    basePowerPerMinute: 1.0,
    diminishingRate: 0.4, // 40% credit per minute after T1
    flatRate: 0.1,        // 10% credit after T2
  },
  STRENGTH: {
    t1Minutes: 60,        // Full credit up to 60 min
    t2Minutes: 120,       // Diminishing up to 2 hours
    maxMinutes: 180,      // Soft cap at 3 hours
    basePowerPerMinute: 1.2, // Higher per-minute for intensity
    diminishingRate: 0.3,
    flatRate: 0.05,
  },
  SKILL_MIXED: {
    t1Minutes: 60,        // Match/game duration
    t2Minutes: 150,       // Extended play
    maxMinutes: 240,      // Tournament day
    basePowerPerMinute: 0.9,
    diminishingRate: 0.35,
    flatRate: 0.08,
  },
  OUTDOOR: {
    t1Minutes: 60,        // Standard hike/climb
    t2Minutes: 180,       // Long day out
    maxMinutes: 360,      // Full day adventure
    basePowerPerMinute: 0.5, // Lower base (walking pace) - prevents gaming via duration
    diminishingRate: 0.2,  // Aggressive diminishing
    flatRate: 0.03,
  },
  WATER_BOARD: {
    t1Minutes: 45,        // Good session
    t2Minutes: 120,       // Extended session
    maxMinutes: 240,      // Full day
    basePowerPerMinute: 1.1, // High intensity activity
    diminishingRate: 0.35,
    flatRate: 0.1,
  },
  MINDBODY: {
    t1Minutes: 60,        // Standard class
    t2Minutes: 90,        // Long session
    maxMinutes: 150,      // Extended practice
    basePowerPerMinute: 0.5, // Lower power ceiling
    diminishingRate: 0.2,
    flatRate: 0.02,
  },
  GENERIC: {
    t1Minutes: 45,
    t2Minutes: 120,
    maxMinutes: 240,
    basePowerPerMinute: 0.8,
    diminishingRate: 0.3,
    flatRate: 0.05,
  },
}

// =============================================================================
// INTENSITY MULTIPLIERS
// =============================================================================

export type IntensityMode = "easy" | "moderate" | "hard" | "race"

export interface IntensityConfig {
  /** Multiplier range for manual/Bronze entries */
  manualMultipliers: Record<IntensityMode, number>
  /** Multiplier range for verified/Silver+ entries */
  verifiedMultipliers: Record<IntensityMode, number>
}

export const INTENSITY_CONFIG: IntensityConfig = {
  // Manual entries have narrow range to prevent gaming
  manualMultipliers: {
    easy: 0.85,
    moderate: 1.0,
    hard: 1.08,
    race: 1.12, // Race requires verification or event link
  },
  // Verified entries can claim higher multipliers
  verifiedMultipliers: {
    easy: 0.8,
    moderate: 1.0,
    hard: 1.15,
    race: 1.25,
  },
}

// =============================================================================
// CONFIDENCE WEIGHT
// =============================================================================

export interface ConfidenceFactors {
  /** Base weight by source type */
  sourceWeights: {
    MANUAL: number
    STRAVA: number
    GARMIN: number
    FILE_IMPORT: number
    SENSOR: number
    OFFICIAL: number
  }
  /** Bonus for having specific data */
  dataBonuses: {
    hasGPS: number
    hasHeartRate: number
    hasCadence: number
    hasPower: number
  }
  /** Penalty for anomalies */
  anomalyPenalty: number
  /** Min/max confidence range */
  minConfidence: number
  maxConfidence: number
}

export const CONFIDENCE_CONFIG: ConfidenceFactors = {
  sourceWeights: {
    MANUAL: 0.7,      // Manual starts lower
    STRAVA: 0.9,      // Platform-verified
    GARMIN: 0.95,     // Device-synced
    FILE_IMPORT: 0.85, // File upload
    SENSOR: 1.0,      // Direct sensor
    OFFICIAL: 1.1,    // Official race result
  },
  dataBonuses: {
    hasGPS: 0.05,
    hasHeartRate: 0.08,
    hasCadence: 0.03,
    hasPower: 0.1,
  },
  anomalyPenalty: 0.15,
  minConfidence: 0.6,
  maxConfidence: 1.2,
}

// =============================================================================
// RACE MULTIPLIER GUARDRAILS
// =============================================================================

export const RACE_CONFIG = {
  /** Max races per week without event link or verification */
  maxUnverifiedRacesPerWeek: 2,
  /** Verification tier required for unlimited race claims */
  unlimitedRaceTier: "GOLD" as const,
  /** Downgrade race to hard if limits exceeded */
  downgradeToHard: true,
}

// =============================================================================
// POWER CEILINGS (Anti-inflation)
// =============================================================================

export interface PowerCeiling {
  /** Max power per hour for this category */
  maxPowerPerHour: number
  /** Hard cap on total power for a single activity */
  maxTotalPower: number
}

export const POWER_CEILINGS: Record<PowerSportCategory, PowerCeiling> = {
  ENDURANCE: { maxPowerPerHour: 80, maxTotalPower: 300 },
  STRENGTH: { maxPowerPerHour: 100, maxTotalPower: 200 },
  SKILL_MIXED: { maxPowerPerHour: 70, maxTotalPower: 250 },
  OUTDOOR: { maxPowerPerHour: 50, maxTotalPower: 200 },
  WATER_BOARD: { maxPowerPerHour: 90, maxTotalPower: 250 },
  MINDBODY: { maxPowerPerHour: 40, maxTotalPower: 80 },
  GENERIC: { maxPowerPerHour: 60, maxTotalPower: 200 },
}

// =============================================================================
// VERSION TRACKING
// =============================================================================

/** Current power computation version - increment on formula changes */
export const POWER_VERSION = "v2.0.0"
