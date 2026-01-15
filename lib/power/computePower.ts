/**
 * Power Computation Engine
 *
 * The core algorithm for calculating activity Power.
 *
 * PowerFinal = clamp( PowerBase(sport, duration, intensity) * ConfidenceWeight )
 *
 * Where PowerBase uses:
 * - Sport-aware duration saturation curves
 * - Intensity multipliers (bounded for manual entries)
 * - Sport-specific base rates
 *
 * This is the SOURCE OF TRUTH for Power computation.
 */

import { SportCategory, VerificationTier, ProofLevel } from "@prisma/client"
import {
  SATURATION_CONFIGS,
  INTENSITY_CONFIG,
  POWER_CEILINGS,
  SPORT_CATEGORY_MAP,
  PowerSportCategory,
  IntensityMode,
  POWER_VERSION,
} from "./constants"
import { computeConfidence, ConfidenceInput, ConfidenceResult } from "./confidence"
import { validateIntensityBySensor, SensorSignals, IntensityValidationResult } from "./sensorValidation"
import { isFlagEnabled } from "@/lib/flags"

// =============================================================================
// TYPES
// =============================================================================

export interface PowerInput {
  /** Duration in seconds */
  durationSeconds: number
  /** Sport category from Prisma */
  sportCategory: SportCategory
  /** Intensity mode (easy/moderate/hard/race) */
  intensityMode: IntensityMode
  /** Activity source (MANUAL, STRAVA, etc.) */
  source: string
  /** Verification tier */
  verificationTier: VerificationTier
  /** Proof level for V12 sensor validation */
  proofLevel?: ProofLevel
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
  /** Average heart rate (if available) */
  avgHeartRate?: number | null
  /** Max heart rate (if available) */
  maxHeartRate?: number | null
  /** User's estimated max HR */
  userMaxHR?: number | null
  /** V12: Time spent in HR zones 4-5 (seconds) */
  timeInZ4Z5Seconds?: number | null
  /** V12: Average power in watts (cycling) */
  avgPowerWatts?: number | null
  /** V12: Normalized power (cycling) */
  normalizedPowerWatts?: number | null
}

export interface PowerResult {
  /** Final computed power (after all adjustments) */
  powerFinal: number
  /** Base power before confidence adjustment */
  powerBase: number
  /** Duration contribution */
  durationFactor: number
  /** Intensity multiplier applied */
  intensityFactor: number
  /** Sport-specific base multiplier */
  sportMultiplier: number
  /** Confidence weight (0.6-1.2) */
  confidenceWeight: number
  /** Confidence computation details */
  confidenceDetails: ConfidenceResult
  /** Reason if power was clamped */
  clampReason?: string
  /** Power version for tracking formula changes */
  powerVersion: string
  /** Sport category used for computation */
  sportCategory: PowerSportCategory
  /** V12: Intensity validation result (if POWER_V2 enabled) */
  intensityValidation?: IntensityValidationResult
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

export function computePower(input: PowerInput): PowerResult {
  // 1. Map sport category
  const sportCategory = SPORT_CATEGORY_MAP[input.sportCategory] || "GENERIC"
  const satConfig = SATURATION_CONFIGS[sportCategory]
  const ceiling = POWER_CEILINGS[sportCategory]

  // 2. Calculate duration factor with saturation curve
  const durationMinutes = input.durationSeconds / 60
  const durationFactor = computeDurationFactor(durationMinutes, satConfig)

  // V12: Validate intensity against sensor data if POWER_V2 is enabled
  let effectiveIntensity = input.intensityMode
  let intensityValidation: IntensityValidationResult | undefined

  if (isFlagEnabled("POWER_V2") && input.proofLevel) {
    const sensorSignals: SensorSignals = {
      avgHeartRate: input.avgHeartRate,
      maxHeartRate: input.maxHeartRate,
      userMaxHR: input.userMaxHR,
      timeInZ4Z5Seconds: input.timeInZ4Z5Seconds,
      durationSeconds: input.durationSeconds,
      avgPowerWatts: input.avgPowerWatts,
      normalizedPowerWatts: input.normalizedPowerWatts,
    }

    intensityValidation = validateIntensityBySensor(
      input.intensityMode,
      input.proofLevel,
      sensorSignals
    )

    // Use validated intensity for power calculation
    effectiveIntensity = intensityValidation.validatedIntensity
  }

  // 3. Get intensity multiplier (using validated intensity)
  const isManual = input.source.toUpperCase() === "MANUAL"
  const intensityFactor = getIntensityMultiplier(
    effectiveIntensity,
    isManual,
    input.verificationTier
  )

  // 4. Sport-specific base multiplier (from saturation config)
  const sportMultiplier = satConfig.basePowerPerMinute

  // 5. Calculate base power
  const powerBase = durationFactor * intensityFactor * sportMultiplier

  // 6. Compute confidence weight
  const confidenceInput: ConfidenceInput = {
    source: input.source,
    verificationTier: input.verificationTier,
    hasGPS: input.hasGPS,
    hasHeartRate: input.hasHeartRate,
    hasCadence: input.hasCadence,
    hasPower: input.hasPower,
    isAnomalous: input.isAnomalous,
    intensityMode: effectiveIntensity, // Use validated intensity
    avgHeartRate: input.avgHeartRate,
    maxHeartRate: input.maxHeartRate,
    userMaxHR: input.userMaxHR,
  }
  const confidenceDetails = computeConfidence(confidenceInput)

  // V12: Apply additional confidence penalty if intensity was downgraded
  let adjustedConfidenceWeight = confidenceDetails.weight
  if (intensityValidation?.wasDowngraded) {
    adjustedConfidenceWeight *= intensityValidation.confidence
  }

  // 7. Apply confidence weight
  let powerFinal = powerBase * adjustedConfidenceWeight
  let clampReason: string | undefined

  // 8. Apply power ceilings
  const durationHours = durationMinutes / 60
  const maxByHourly = ceiling.maxPowerPerHour * Math.max(1, durationHours)

  if (powerFinal > ceiling.maxTotalPower) {
    clampReason = `Exceeded total cap (${ceiling.maxTotalPower})`
    powerFinal = ceiling.maxTotalPower
  } else if (powerFinal > maxByHourly) {
    clampReason = `Exceeded hourly rate (${ceiling.maxPowerPerHour}/hr)`
    powerFinal = maxByHourly
  }

  // 9. Final floor
  powerFinal = Math.max(0, Math.round(powerFinal * 10) / 10)

  return {
    powerFinal,
    powerBase: Math.round(powerBase * 10) / 10,
    durationFactor: Math.round(durationFactor * 100) / 100,
    intensityFactor,
    sportMultiplier,
    confidenceWeight: adjustedConfidenceWeight,
    confidenceDetails,
    clampReason,
    powerVersion: POWER_VERSION,
    sportCategory,
    intensityValidation,
  }
}

// =============================================================================
// DURATION SATURATION CURVE
// =============================================================================

/**
 * Computes duration factor using piecewise saturation curve:
 * - Linear up to T1
 * - Diminishing returns T1 to T2
 * - Near-flat after T2
 */
function computeDurationFactor(
  durationMinutes: number,
  config: typeof SATURATION_CONFIGS.ENDURANCE
): number {
  const { t1Minutes, t2Minutes, maxMinutes, diminishingRate, flatRate } = config

  // Clamp to max
  const clampedDuration = Math.min(durationMinutes, maxMinutes)

  if (clampedDuration <= t1Minutes) {
    // Linear zone: full credit
    return clampedDuration
  }

  if (clampedDuration <= t2Minutes) {
    // Diminishing zone
    const linearPart = t1Minutes
    const diminishingPart = (clampedDuration - t1Minutes) * diminishingRate
    return linearPart + diminishingPart
  }

  // Flat zone
  const linearPart = t1Minutes
  const diminishingPart = (t2Minutes - t1Minutes) * diminishingRate
  const flatPart = (clampedDuration - t2Minutes) * flatRate

  return linearPart + diminishingPart + flatPart
}

// =============================================================================
// INTENSITY MULTIPLIER
// =============================================================================

function getIntensityMultiplier(
  mode: IntensityMode,
  isManual: boolean,
  verificationTier: VerificationTier
): number {
  const multipliers = isManual
    ? INTENSITY_CONFIG.manualMultipliers
    : INTENSITY_CONFIG.verifiedMultipliers

  let multiplier = multipliers[mode]

  // Gold tier gets slight bonus on verified activities
  if (!isManual && verificationTier === "GOLD" && mode === "race") {
    multiplier *= 1.05
  }

  return multiplier
}

// =============================================================================
// UTILITY: Quick power estimate (for UI preview)
// =============================================================================

export function estimatePower(
  durationMinutes: number,
  sportCategory: SportCategory,
  intensity: IntensityMode = "moderate"
): number {
  const category = SPORT_CATEGORY_MAP[sportCategory] || "GENERIC"
  const satConfig = SATURATION_CONFIGS[category]
  const durationFactor = computeDurationFactor(durationMinutes, satConfig)
  const intensityFactor = INTENSITY_CONFIG.manualMultipliers[intensity]

  return Math.round(durationFactor * intensityFactor * satConfig.basePowerPerMinute)
}

// =============================================================================
// UTILITY: Get power breakdown for tooltip
// =============================================================================

export interface PowerBreakdown {
  duration: string
  intensity: string
  confidence: string
  sport: string
  total: string
  clamp?: string
}

export function getPowerBreakdown(result: PowerResult): PowerBreakdown {
  return {
    duration: `${result.durationFactor.toFixed(1)} min (saturated)`,
    intensity: `×${result.intensityFactor.toFixed(2)} (${result.sportCategory})`,
    confidence: `×${result.confidenceWeight.toFixed(2)} (${result.confidenceDetails.breakdown.split(";")[0]})`,
    sport: `${result.sportMultiplier}/min base`,
    total: `${result.powerFinal.toFixed(1)} Power`,
    clamp: result.clampReason,
  }
}
