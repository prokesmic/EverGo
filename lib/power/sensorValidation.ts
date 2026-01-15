/**
 * Sensor Validation Gates (V12)
 *
 * Validates claimed intensity against available sensor data.
 * Prevents gaming by requiring evidence for high intensity claims.
 *
 * Rules:
 * 1. MANUAL/PHOTO proof cannot claim "hard" or "race" intensity at full value
 * 2. SENSOR/VERIFIED proof with HR data must match claimed intensity
 * 3. Time in Z4/Z5 is required for high intensity claims with HR data
 */

import type { ProofLevel } from "@prisma/client"
import type { IntensityMode } from "./constants"

// =============================================================================
// TYPES
// =============================================================================

export interface SensorSignals {
  /** Average heart rate during activity */
  avgHeartRate?: number | null
  /** Max heart rate during activity */
  maxHeartRate?: number | null
  /** User's estimated max HR (220 - age or measured) */
  userMaxHR?: number | null
  /** Time in HR zones (if available from device) */
  timeInZ4Z5Seconds?: number | null
  /** Total duration for percentage calculation */
  durationSeconds?: number
  /** Average power in watts (cycling) */
  avgPowerWatts?: number | null
  /** Normalized power (cycling) */
  normalizedPowerWatts?: number | null
}

export interface IntensityValidationResult {
  /** Original claimed intensity */
  claimedIntensity: IntensityMode
  /** Validated/adjusted intensity */
  validatedIntensity: IntensityMode
  /** Whether intensity was downgraded */
  wasDowngraded: boolean
  /** Reason for downgrade (if any) */
  downgradeReason?: string
  /** Confidence in the validation (0-1) */
  confidence: number
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const VALIDATION_CONFIG = {
  // Proof levels that can claim full intensity
  fullIntensityProofs: ["SENSOR", "VERIFIED"] as ProofLevel[],

  // Proof levels that can claim limited intensity (capped at moderate)
  limitedIntensityProofs: ["MANUAL", "PHOTO"] as ProofLevel[],

  // HR zones (percentage of max HR)
  hrZones: {
    z1: { min: 0.50, max: 0.60 },    // Recovery
    z2: { min: 0.60, max: 0.70 },    // Easy
    z3: { min: 0.70, max: 0.80 },    // Moderate
    z4: { min: 0.80, max: 0.90 },    // Hard
    z5: { min: 0.90, max: 1.00 },    // Maximum
  },

  // Minimum time in Z4/Z5 to justify "hard" intensity (as % of duration)
  minZ4Z5PercentForHard: 0.15, // 15% of activity

  // Minimum avg HR % of max for intensity claims
  minAvgHRForIntensity: {
    easy: 0.55,
    moderate: 0.65,
    hard: 0.75,
    race: 0.80,
  },

  // Default max HR if user hasn't set one
  defaultMaxHR: 185,
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Validate claimed intensity against proof level and sensor data
 */
export function validateIntensityBySensor(
  claimedIntensity: IntensityMode,
  proofLevel: ProofLevel,
  signals: SensorSignals
): IntensityValidationResult {
  // Start with claimed intensity
  let validatedIntensity = claimedIntensity
  let wasDowngraded = false
  let downgradeReason: string | undefined
  let confidence = 1.0

  // Rule 1: Check proof level constraints
  const proofResult = validateByProofLevel(claimedIntensity, proofLevel)
  if (proofResult.wasDowngraded) {
    validatedIntensity = proofResult.validatedIntensity
    wasDowngraded = true
    downgradeReason = proofResult.reason
    confidence *= 0.8
  }

  // Rule 2: If we have HR data, validate against it
  if (signals.avgHeartRate && signals.userMaxHR) {
    const hrResult = validateByHeartRate(
      validatedIntensity,
      signals.avgHeartRate,
      signals.userMaxHR,
      signals.timeInZ4Z5Seconds,
      signals.durationSeconds
    )
    if (hrResult.wasDowngraded) {
      validatedIntensity = hrResult.validatedIntensity
      wasDowngraded = true
      downgradeReason = hrResult.reason
      confidence *= hrResult.confidence
    }
  }

  // Rule 3: If we have power data for cycling, validate
  if (signals.avgPowerWatts && signals.normalizedPowerWatts) {
    const powerResult = validateByPower(
      validatedIntensity,
      signals.avgPowerWatts,
      signals.normalizedPowerWatts
    )
    if (powerResult.wasDowngraded) {
      validatedIntensity = powerResult.validatedIntensity
      wasDowngraded = true
      downgradeReason = powerResult.reason
      confidence *= powerResult.confidence
    }
  }

  return {
    claimedIntensity,
    validatedIntensity,
    wasDowngraded,
    downgradeReason,
    confidence: Math.max(0.5, confidence),
  }
}

// =============================================================================
// VALIDATION BY PROOF LEVEL
// =============================================================================

function validateByProofLevel(
  intensity: IntensityMode,
  proofLevel: ProofLevel
): { validatedIntensity: IntensityMode; wasDowngraded: boolean; reason?: string } {
  // SENSOR and VERIFIED can claim any intensity
  if (VALIDATION_CONFIG.fullIntensityProofs.includes(proofLevel)) {
    return { validatedIntensity: intensity, wasDowngraded: false }
  }

  // GPX can claim up to "hard" but not full race credit
  if (proofLevel === "GPX") {
    if (intensity === "race") {
      return {
        validatedIntensity: "hard",
        wasDowngraded: true,
        reason: "Race intensity requires sensor verification",
      }
    }
    return { validatedIntensity: intensity, wasDowngraded: false }
  }

  // MANUAL and PHOTO are capped at moderate for high intensity claims
  if (VALIDATION_CONFIG.limitedIntensityProofs.includes(proofLevel)) {
    if (intensity === "race") {
      return {
        validatedIntensity: "moderate",
        wasDowngraded: true,
        reason: "Race intensity requires device or sensor data",
      }
    }
    if (intensity === "hard") {
      // Partial credit for hard - treat as between moderate and hard
      // This is handled by applying a reduced multiplier
      return {
        validatedIntensity: "moderate",
        wasDowngraded: true,
        reason: "High intensity claims require device verification",
      }
    }
  }

  return { validatedIntensity: intensity, wasDowngraded: false }
}

// =============================================================================
// VALIDATION BY HEART RATE
// =============================================================================

function validateByHeartRate(
  intensity: IntensityMode,
  avgHR: number,
  maxHR: number,
  timeInZ4Z5Seconds?: number | null,
  durationSeconds?: number
): { validatedIntensity: IntensityMode; wasDowngraded: boolean; reason?: string; confidence: number } {
  const hrPercentage = avgHR / maxHR
  const minRequired = VALIDATION_CONFIG.minAvgHRForIntensity[intensity]

  // Check if average HR supports claimed intensity
  if (hrPercentage < minRequired) {
    // Find appropriate intensity for actual HR
    let appropriateIntensity: IntensityMode = "easy"
    if (hrPercentage >= VALIDATION_CONFIG.minAvgHRForIntensity.race) {
      appropriateIntensity = "race"
    } else if (hrPercentage >= VALIDATION_CONFIG.minAvgHRForIntensity.hard) {
      appropriateIntensity = "hard"
    } else if (hrPercentage >= VALIDATION_CONFIG.minAvgHRForIntensity.moderate) {
      appropriateIntensity = "moderate"
    }

    if (appropriateIntensity !== intensity) {
      return {
        validatedIntensity: appropriateIntensity,
        wasDowngraded: true,
        reason: `HR data (${Math.round(hrPercentage * 100)}% max) suggests ${appropriateIntensity} intensity`,
        confidence: 0.9,
      }
    }
  }

  // For hard/race, also check time in Z4/Z5
  if ((intensity === "hard" || intensity === "race") && timeInZ4Z5Seconds != null && durationSeconds) {
    const z4z5Percentage = timeInZ4Z5Seconds / durationSeconds
    if (z4z5Percentage < VALIDATION_CONFIG.minZ4Z5PercentForHard) {
      return {
        validatedIntensity: "moderate",
        wasDowngraded: true,
        reason: `Only ${Math.round(z4z5Percentage * 100)}% time in high HR zones`,
        confidence: 0.85,
      }
    }
  }

  return { validatedIntensity: intensity, wasDowngraded: false, confidence: 1.0 }
}

// =============================================================================
// VALIDATION BY POWER (CYCLING)
// =============================================================================

function validateByPower(
  intensity: IntensityMode,
  avgPower: number,
  normalizedPower: number
): { validatedIntensity: IntensityMode; wasDowngraded: boolean; reason?: string; confidence: number } {
  // Variability Index (VI) = NP / AP
  // Higher VI indicates more variable effort (intervals)
  // Lower VI indicates steady effort
  const variabilityIndex = normalizedPower / avgPower

  // For race intensity, expect high variability or high sustained power
  if (intensity === "race" && variabilityIndex < 1.02) {
    // Very steady effort but claimed race - likely a time trial or steady ride
    // This is acceptable for races, so no downgrade needed
  }

  // For hard intensity with low VI and low power ratio, might be easier than claimed
  // This is a soft check - power data is generally trusted

  return { validatedIntensity: intensity, wasDowngraded: false, confidence: 1.0 }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate estimated max HR using the common 220-age formula
 */
export function estimateMaxHR(age: number): number {
  return Math.round(220 - age)
}

/**
 * Get HR zone from current heart rate
 */
export function getHRZone(currentHR: number, maxHR: number): number {
  const percentage = currentHR / maxHR
  const { hrZones } = VALIDATION_CONFIG

  if (percentage >= hrZones.z5.min) return 5
  if (percentage >= hrZones.z4.min) return 4
  if (percentage >= hrZones.z3.min) return 3
  if (percentage >= hrZones.z2.min) return 2
  return 1
}

/**
 * Check if proof level allows full intensity claims
 */
export function canClaimFullIntensity(proofLevel: ProofLevel): boolean {
  return VALIDATION_CONFIG.fullIntensityProofs.includes(proofLevel)
}
