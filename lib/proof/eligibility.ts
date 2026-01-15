/**
 * Proof Level Eligibility Rules (V12)
 *
 * Defines which metrics/leaderboards require which proof level.
 * This ensures integrity by preventing manual entries from affecting
 * sensor-required performance metrics.
 *
 * Proof Levels (ordered by credibility):
 * 1. MANUAL - User typed it, no evidence
 * 2. PHOTO - Has photo attachment (social credibility)
 * 3. GPX - Has GPS track (route credibility, distance/elevation)
 * 4. SENSOR - Device/sensor data (performance credibility)
 * 5. VERIFIED - Admin or official source verified (highest credibility)
 */

import type { ProofLevel } from "@prisma/client"
import { isFlagEnabled } from "@/lib/flags"

// =============================================================================
// TYPES
// =============================================================================

export type MetricKey =
  // Performance metrics (require SENSOR)
  | "pace_5k"
  | "pace_10k"
  | "pace_half"
  | "pace_marathon"
  | "power_ftp"
  | "power_20min_wkg"
  | "max_jump_height"
  | "max_airtime"
  | "max_speed"
  | "avg_power"
  | "normalized_power"
  | "best_climb_grade"
  | "tonnage"
  // Route metrics (require GPX)
  | "distance"
  | "elevation_gain"
  | "vertical_descent"
  // Basic metrics (allow MANUAL)
  | "duration"
  | "sessions"
  | "session_rating"
  | "days_active"
  | "streak"
  | "consistency"
  | "sport_index" // Composite, uses weighted inputs
  | "power_points" // Already gated by power computation

export interface MetricEligibilityRule {
  /** Minimum proof level required to be eligible for this metric's leaderboards */
  minProof: ProofLevel
  /** Display label for UI */
  label: string
  /** Explanation for users */
  description: string
  /** Whether this metric can be included at all without the required proof */
  excludeIfBelowProof: boolean
}

// =============================================================================
// PROOF LEVEL ORDERING
// =============================================================================

const PROOF_LEVEL_ORDER: Record<ProofLevel, number> = {
  MANUAL: 1,
  PHOTO: 2,
  GPX: 3,
  SENSOR: 4,
  VERIFIED: 5,
}

/**
 * Check if a proof level meets or exceeds the minimum requirement
 */
export function meetsProofRequirement(
  actual: ProofLevel,
  minimum: ProofLevel
): boolean {
  return PROOF_LEVEL_ORDER[actual] >= PROOF_LEVEL_ORDER[minimum]
}

// =============================================================================
// ELIGIBILITY RULES
// =============================================================================

export const METRIC_ELIGIBILITY: Record<MetricKey, MetricEligibilityRule> = {
  // ==========================================================================
  // PERFORMANCE METRICS - Require SENSOR data
  // ==========================================================================

  pace_5k: {
    minProof: "SENSOR",
    label: "5K Pace",
    description: "Requires GPS watch or running device",
    excludeIfBelowProof: true,
  },
  pace_10k: {
    minProof: "SENSOR",
    label: "10K Pace",
    description: "Requires GPS watch or running device",
    excludeIfBelowProof: true,
  },
  pace_half: {
    minProof: "SENSOR",
    label: "Half Marathon Pace",
    description: "Requires GPS watch or running device",
    excludeIfBelowProof: true,
  },
  pace_marathon: {
    minProof: "SENSOR",
    label: "Marathon Pace",
    description: "Requires GPS watch or running device",
    excludeIfBelowProof: true,
  },
  power_ftp: {
    minProof: "SENSOR",
    label: "FTP",
    description: "Requires power meter",
    excludeIfBelowProof: true,
  },
  power_20min_wkg: {
    minProof: "SENSOR",
    label: "20min Power (W/kg)",
    description: "Requires power meter",
    excludeIfBelowProof: true,
  },
  max_jump_height: {
    minProof: "SENSOR",
    label: "Max Jump Height",
    description: "Requires WOO or similar sensor",
    excludeIfBelowProof: true,
  },
  max_airtime: {
    minProof: "SENSOR",
    label: "Max Airtime",
    description: "Requires WOO or similar sensor",
    excludeIfBelowProof: true,
  },
  max_speed: {
    minProof: "SENSOR",
    label: "Max Speed",
    description: "Requires GPS device",
    excludeIfBelowProof: true,
  },
  avg_power: {
    minProof: "SENSOR",
    label: "Average Power",
    description: "Requires power meter",
    excludeIfBelowProof: true,
  },
  normalized_power: {
    minProof: "SENSOR",
    label: "Normalized Power",
    description: "Requires power meter",
    excludeIfBelowProof: true,
  },
  best_climb_grade: {
    minProof: "SENSOR",
    label: "Best Climb Grade",
    description: "Requires verified gym or outdoor log",
    excludeIfBelowProof: true,
  },
  tonnage: {
    minProof: "SENSOR",
    label: "Tonnage",
    description: "Requires tracked strength workout",
    excludeIfBelowProof: true,
  },

  // ==========================================================================
  // ROUTE METRICS - Require GPX/GPS data
  // ==========================================================================

  distance: {
    minProof: "GPX",
    label: "Distance",
    description: "Requires GPS track for leaderboard eligibility",
    excludeIfBelowProof: false, // Allow for personal tracking, exclude from leaderboards
  },
  elevation_gain: {
    minProof: "GPX",
    label: "Elevation Gain",
    description: "Requires GPS track with elevation data",
    excludeIfBelowProof: false,
  },
  vertical_descent: {
    minProof: "GPX",
    label: "Vertical Descent",
    description: "Requires GPS track with elevation data",
    excludeIfBelowProof: false,
  },

  // ==========================================================================
  // BASIC METRICS - Allow MANUAL entries
  // ==========================================================================

  duration: {
    minProof: "MANUAL",
    label: "Duration",
    description: "Can be manually entered",
    excludeIfBelowProof: false,
  },
  sessions: {
    minProof: "MANUAL",
    label: "Sessions",
    description: "Can be manually entered",
    excludeIfBelowProof: false,
  },
  session_rating: {
    minProof: "MANUAL",
    label: "Session Rating",
    description: "Subjective rating",
    excludeIfBelowProof: false,
  },
  days_active: {
    minProof: "MANUAL",
    label: "Days Active",
    description: "Based on activity count",
    excludeIfBelowProof: false,
  },
  streak: {
    minProof: "MANUAL",
    label: "Streak",
    description: "Based on activity count",
    excludeIfBelowProof: false,
  },
  consistency: {
    minProof: "MANUAL",
    label: "Consistency",
    description: "Based on activity regularity",
    excludeIfBelowProof: false,
  },
  sport_index: {
    minProof: "MANUAL",
    label: "Sport Index",
    description: "Composite score with weighted inputs",
    excludeIfBelowProof: false,
  },
  power_points: {
    minProof: "MANUAL",
    label: "Power",
    description: "Already validated by power computation",
    excludeIfBelowProof: false,
  },
}

// =============================================================================
// ELIGIBILITY CHECKING
// =============================================================================

/**
 * Check if an activity is eligible for a specific metric leaderboard
 */
export function isEligibleForMetric(
  proofLevel: ProofLevel,
  metricKey: MetricKey
): boolean {
  // If feature flag is disabled, allow everything (backwards compatibility)
  if (!isFlagEnabled("PROOF_ELIGIBILITY_V1")) {
    return true
  }

  const rule = METRIC_ELIGIBILITY[metricKey]
  if (!rule) {
    // Unknown metric - default to allowing
    return true
  }

  return meetsProofRequirement(proofLevel, rule.minProof)
}

/**
 * Get eligibility status for a metric
 */
export function getEligibilityStatus(
  proofLevel: ProofLevel,
  metricKey: MetricKey
): {
  eligible: boolean
  requiredProof: ProofLevel
  currentProof: ProofLevel
  upgradeNeeded: boolean
  message: string
} {
  const rule = METRIC_ELIGIBILITY[metricKey] ?? {
    minProof: "MANUAL",
    label: metricKey,
    description: "",
    excludeIfBelowProof: false,
  }

  const eligible = isEligibleForMetric(proofLevel, metricKey)
  const upgradeNeeded = !eligible

  let message = ""
  if (!eligible) {
    message = `${rule.label} leaderboard requires ${rule.minProof.toLowerCase()} proof or higher. ${rule.description}`
  }

  return {
    eligible,
    requiredProof: rule.minProof,
    currentProof: proofLevel,
    upgradeNeeded,
    message,
  }
}

/**
 * Get all metrics an activity is eligible for based on its proof level
 */
export function getEligibleMetrics(proofLevel: ProofLevel): MetricKey[] {
  return (Object.keys(METRIC_ELIGIBILITY) as MetricKey[]).filter((key) =>
    isEligibleForMetric(proofLevel, key)
  )
}

/**
 * Get metrics that require a higher proof level
 */
export function getLockedMetrics(proofLevel: ProofLevel): {
  key: MetricKey
  rule: MetricEligibilityRule
}[] {
  return (Object.keys(METRIC_ELIGIBILITY) as MetricKey[])
    .filter((key) => !isEligibleForMetric(proofLevel, key))
    .map((key) => ({ key, rule: METRIC_ELIGIBILITY[key] }))
}

// =============================================================================
// UI HELPERS
// =============================================================================

/**
 * Get proof level display info
 */
export function getProofLevelInfo(level: ProofLevel): {
  name: string
  icon: string
  color: string
  description: string
} {
  const info: Record<ProofLevel, { name: string; icon: string; color: string; description: string }> = {
    MANUAL: {
      name: "Manual",
      icon: "pencil",
      color: "text-slate-500",
      description: "Self-reported entry",
    },
    PHOTO: {
      name: "Photo",
      icon: "camera",
      color: "text-blue-500",
      description: "Photo evidence attached",
    },
    GPX: {
      name: "GPS",
      icon: "map-pin",
      color: "text-green-500",
      description: "GPS track recorded",
    },
    SENSOR: {
      name: "Sensor",
      icon: "activity",
      color: "text-purple-500",
      description: "Device/sensor verified",
    },
    VERIFIED: {
      name: "Verified",
      icon: "check-circle",
      color: "text-amber-500",
      description: "Officially verified",
    },
  }
  return info[level]
}

/**
 * Get proof level badge text
 */
export function getProofLevelBadge(level: ProofLevel): string {
  const badges: Record<ProofLevel, string> = {
    MANUAL: "Manual Entry",
    PHOTO: "Photo Proof",
    GPX: "GPS Tracked",
    SENSOR: "Device Verified",
    VERIFIED: "Official",
  }
  return badges[level]
}
