/**
 * Confidence Weight Computation
 *
 * Calculates how much we trust an activity's data for Power scoring.
 * Higher confidence = more weight in rankings.
 *
 * Factors:
 * - Source type (manual, Strava, sensor, official)
 * - Data richness (GPS, HR, cadence, power meter)
 * - Anomaly flags
 * - RPE/HR consistency (if both available)
 */

import { VerificationTier } from "@prisma/client"
import { CONFIDENCE_CONFIG, IntensityMode } from "./constants"

// =============================================================================
// TYPES
// =============================================================================

export interface ConfidenceInput {
  /** Activity source (MANUAL, STRAVA, etc.) */
  source: string
  /** Verification tier of the activity */
  verificationTier: VerificationTier
  /** Whether GPS data is present */
  hasGPS: boolean
  /** Whether heart rate data is present */
  hasHeartRate: boolean
  /** Whether cadence data is present */
  hasCadence: boolean
  /** Whether power meter data is present */
  hasPower: boolean
  /** Whether activity is flagged as anomalous */
  isAnomalous: boolean
  /** Claimed intensity mode */
  intensityMode: IntensityMode
  /** Average heart rate (if available) */
  avgHeartRate?: number | null
  /** Max heart rate (if available) */
  maxHeartRate?: number | null
  /** User's estimated max HR (220 - age if available) */
  userMaxHR?: number | null
}

export interface ConfidenceResult {
  /** Final confidence weight (0.6 - 1.2) */
  weight: number
  /** Base weight from source */
  sourceWeight: number
  /** Total data bonus */
  dataBonus: number
  /** Penalty applied (if any) */
  penalty: number
  /** Whether RPE matches HR data */
  rpeHRConsistent: boolean | null
  /** Explanation for debugging */
  breakdown: string
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export function computeConfidence(input: ConfidenceInput): ConfidenceResult {
  const config = CONFIDENCE_CONFIG
  const breakdown: string[] = []

  // 1. Base weight from source
  const sourceKey = mapSourceToKey(input.source)
  let sourceWeight = config.sourceWeights[sourceKey] ?? config.sourceWeights.MANUAL
  breakdown.push(`Source (${sourceKey}): ${sourceWeight}`)

  // 2. Verification tier adjustment
  if (input.verificationTier === "GOLD") {
    sourceWeight += 0.05
    breakdown.push(`Gold tier: +0.05`)
  } else if (input.verificationTier === "SILVER") {
    sourceWeight += 0.02
    breakdown.push(`Silver tier: +0.02`)
  }

  // 3. Data bonuses
  let dataBonus = 0
  if (input.hasGPS) {
    dataBonus += config.dataBonuses.hasGPS
    breakdown.push(`GPS: +${config.dataBonuses.hasGPS}`)
  }
  if (input.hasHeartRate) {
    dataBonus += config.dataBonuses.hasHeartRate
    breakdown.push(`HR: +${config.dataBonuses.hasHeartRate}`)
  }
  if (input.hasCadence) {
    dataBonus += config.dataBonuses.hasCadence
    breakdown.push(`Cadence: +${config.dataBonuses.hasCadence}`)
  }
  if (input.hasPower) {
    dataBonus += config.dataBonuses.hasPower
    breakdown.push(`Power meter: +${config.dataBonuses.hasPower}`)
  }

  // 4. Anomaly penalty
  let penalty = 0
  if (input.isAnomalous) {
    penalty += config.anomalyPenalty
    breakdown.push(`Anomaly: -${config.anomalyPenalty}`)
  }

  // 5. RPE/HR consistency check
  let rpeHRConsistent: boolean | null = null
  if (input.hasHeartRate && input.avgHeartRate && input.userMaxHR) {
    rpeHRConsistent = checkRPEHRConsistency(
      input.intensityMode,
      input.avgHeartRate,
      input.userMaxHR
    )
    if (rpeHRConsistent === false) {
      // RPE doesn't match HR - apply small penalty
      penalty += 0.05
      breakdown.push(`RPE/HR mismatch: -0.05`)
    }
  }

  // 6. Calculate final weight
  const rawWeight = sourceWeight + dataBonus - penalty
  const weight = Math.max(
    config.minConfidence,
    Math.min(config.maxConfidence, rawWeight)
  )

  // 7. Manual entries cap
  if (sourceKey === "MANUAL" && weight > 1.0) {
    breakdown.push(`Manual cap: ${weight} -> 1.0`)
    return {
      weight: 1.0,
      sourceWeight,
      dataBonus,
      penalty,
      rpeHRConsistent,
      breakdown: breakdown.join("; "),
    }
  }

  return {
    weight,
    sourceWeight,
    dataBonus,
    penalty,
    rpeHRConsistent,
    breakdown: breakdown.join("; "),
  }
}

// =============================================================================
// HELPERS
// =============================================================================

type SourceKey = keyof typeof CONFIDENCE_CONFIG.sourceWeights

function mapSourceToKey(source: string): SourceKey {
  const upper = source.toUpperCase()

  if (upper === "MANUAL") return "MANUAL"
  if (upper === "STRAVA") return "STRAVA"
  if (upper === "GARMIN" || upper === "GARMIN_CONNECT") return "GARMIN"
  if (upper.includes("SENSOR")) return "SENSOR"
  if (upper === "OFFICIAL_RESULT" || upper === "OFFICIAL") return "OFFICIAL"
  if (
    upper.includes("IMPORT") ||
    upper.includes("FILE") ||
    upper.includes("GPX") ||
    upper.includes("FIT")
  ) {
    return "FILE_IMPORT"
  }

  // Platform imports
  if (
    upper.includes("WAHOO") ||
    upper.includes("POLAR") ||
    upper.includes("SUUNTO") ||
    upper.includes("COROS") ||
    upper.includes("WHOOP") ||
    upper.includes("FITBIT") ||
    upper.includes("APPLE") ||
    upper.includes("GOOGLE")
  ) {
    return "STRAVA" // Treat as platform-verified
  }

  return "MANUAL"
}

/**
 * Check if claimed RPE matches heart rate zone
 *
 * HR Zones (approximate % of max HR):
 * - Easy: 50-65%
 * - Moderate: 65-80%
 * - Hard: 80-90%
 * - Race: 85-100%
 */
function checkRPEHRConsistency(
  intensityMode: IntensityMode,
  avgHR: number,
  maxHR: number
): boolean {
  const hrPercent = avgHR / maxHR

  switch (intensityMode) {
    case "easy":
      // Easy claimed but HR > 70% = inconsistent
      return hrPercent <= 0.7
    case "moderate":
      // Moderate claimed, HR should be 60-85%
      return hrPercent >= 0.55 && hrPercent <= 0.85
    case "hard":
      // Hard claimed, HR should be > 75%
      return hrPercent >= 0.72
    case "race":
      // Race claimed, HR should be > 80%
      return hrPercent >= 0.78
    default:
      return true
  }
}

// =============================================================================
// UTILITY: Get confidence badge for display
// =============================================================================

export type ConfidenceBadge = "Verified" | "Mixed" | "Manual"

export function getConfidenceBadge(weight: number, source: string): ConfidenceBadge {
  const sourceKey = mapSourceToKey(source)

  if (sourceKey === "MANUAL") {
    return "Manual"
  }

  if (weight >= 0.9) {
    return "Verified"
  }

  return "Mixed"
}
