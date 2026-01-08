/**
 * Eligibility Helpers
 *
 * Determines whether a PB/benchmark is eligible for rankings
 * based on verification source and discipline requirements.
 */

import type { MinVerificationTier, VerificationSource } from "@prisma/client"
import {
  LeaderboardMode,
  RankingScope,
  SOURCE_TIER_MAP,
  MIN_TIER_LEVELS
} from "./types"

/**
 * Get the tier level for a verification source
 */
export function tierForSource(source: VerificationSource): number {
  return SOURCE_TIER_MAP[source] ?? 0
}

/**
 * Check if a source meets the minimum tier requirement
 */
export function meetsMinTier(minTier: MinVerificationTier, source: VerificationSource): boolean {
  const sourceTier = tierForSource(source)
  const requiredTier = MIN_TIER_LEVELS[minTier]
  return sourceTier >= requiredTier
}

/**
 * Get the minimum verification tier for a discipline at a given scope
 */
export function scopeMinTier(
  discipline: {
    minTierGlobal: MinVerificationTier
    minTierCountry: MinVerificationTier
    minTierCity: MinVerificationTier
    minTierTeam: MinVerificationTier
  },
  scope: RankingScope
): MinVerificationTier {
  switch (scope) {
    case "global":
      return discipline.minTierGlobal
    case "country":
      return discipline.minTierCountry
    case "city":
      return discipline.minTierCity
    case "team":
      return discipline.minTierTeam
    default:
      return "NON_MANUAL"
  }
}

/**
 * Check if a PB is eligible for rankings at a given scope and mode
 *
 * VERIFIED mode: Only includes non-manual sources
 * COMMUNITY mode: Includes all sources (manual + non-manual)
 */
export function isPbEligibleForScope(
  pb: {
    verificationSource: VerificationSource
  },
  discipline: {
    minTierGlobal: MinVerificationTier
    minTierCountry: MinVerificationTier
    minTierCity: MinVerificationTier
    minTierTeam: MinVerificationTier
  },
  scope: RankingScope,
  mode: LeaderboardMode
): boolean {
  // In VERIFIED mode, exclude manual entries regardless of discipline settings
  if (mode === "VERIFIED" && pb.verificationSource === "MANUAL") {
    return false
  }

  // Check if source meets the discipline's min tier for this scope
  const minTier = scopeMinTier(discipline, scope)
  return meetsMinTier(minTier, pb.verificationSource)
}

/**
 * Check if source is considered "verified" (non-manual)
 */
export function isVerifiedSource(source: VerificationSource): boolean {
  return source !== "MANUAL"
}

/**
 * Get display label for verification source
 */
export function getSourceLabel(source: VerificationSource): string {
  const labels: Record<VerificationSource, string> = {
    MANUAL: "Manual",
    STRAVA: "Strava",
    GARMIN: "Garmin",
    APPLE_HEALTH: "Apple Health",
    GOOGLE_FIT: "Google Fit",
    WAHOO: "Wahoo",
    POLAR: "Polar",
    SUUNTO: "Suunto",
    COROS: "COROS",
    WHOOP: "WHOOP",
    OURA: "Oura",
    FITBIT: "Fitbit",
    SENSOR_POWER: "Power Meter",
    SENSOR_HR: "HR Monitor",
    SENSOR_CADENCE: "Cadence Sensor",
    SENSOR_WOO: "Woo Sensor",
    SENSOR_SURFR: "Surfr Sensor",
    SENSOR_OTHER: "Sensor",
    DEVICE_OTHER: "Device",
    OFFICIAL_RESULT: "Official Result",
  }
  return labels[source] ?? source
}
