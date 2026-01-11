/**
 * Power System
 *
 * Central export for all power-related functionality.
 */

export {
  computePower,
  estimatePower,
  getPowerBreakdown,
  type PowerInput,
  type PowerResult,
  type PowerBreakdown,
} from "./computePower"

export {
  computeConfidence,
  getConfidenceBadge,
  type ConfidenceInput,
  type ConfidenceResult,
  type ConfidenceBadge,
} from "./confidence"

export {
  validateIntensity,
  getUserWeeklyRaceCount,
  rpeToIntensityMode,
  intensityModeToRPE,
  type IntensityValidationInput,
  type IntensityValidationResult,
} from "./validateIntensity"

export {
  SATURATION_CONFIGS,
  INTENSITY_CONFIG,
  CONFIDENCE_CONFIG,
  POWER_CEILINGS,
  RACE_CONFIG,
  SPORT_CATEGORY_MAP,
  POWER_VERSION,
  type PowerSportCategory,
  type IntensityMode,
  type SaturationConfig,
  type IntensityConfig,
  type ConfidenceFactors,
  type PowerCeiling,
} from "./constants"
