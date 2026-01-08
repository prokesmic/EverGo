/**
 * Rankings Types
 *
 * Defines the two-mode leaderboard system:
 * - VERIFIED: Only non-manual data sources (Strava, Garmin, sensors)
 * - COMMUNITY: Includes manual entries (for personal tracking)
 */

import type { MinVerificationTier, VerificationSource } from "@prisma/client"

// Leaderboard modes
export type LeaderboardMode = "VERIFIED" | "COMMUNITY"

// Ranking scopes
export type RankingScope = "global" | "country" | "city" | "team"

// Source tier levels (ordered from least to most trusted)
export const SOURCE_TIER_LEVELS = {
  MANUAL: 0,
  NON_MANUAL: 1,
  VERIFIED_ONLY: 2,
} as const

// Map verification sources to their tier level
export const SOURCE_TIER_MAP: Record<VerificationSource, number> = {
  MANUAL: SOURCE_TIER_LEVELS.MANUAL,
  STRAVA: SOURCE_TIER_LEVELS.NON_MANUAL,
  GARMIN: SOURCE_TIER_LEVELS.NON_MANUAL,
  APPLE_HEALTH: SOURCE_TIER_LEVELS.NON_MANUAL,
  GOOGLE_FIT: SOURCE_TIER_LEVELS.NON_MANUAL,
  WAHOO: SOURCE_TIER_LEVELS.NON_MANUAL,
  POLAR: SOURCE_TIER_LEVELS.NON_MANUAL,
  SUUNTO: SOURCE_TIER_LEVELS.NON_MANUAL,
  COROS: SOURCE_TIER_LEVELS.NON_MANUAL,
  WHOOP: SOURCE_TIER_LEVELS.NON_MANUAL,
  OURA: SOURCE_TIER_LEVELS.NON_MANUAL,
  FITBIT: SOURCE_TIER_LEVELS.NON_MANUAL,
  SENSOR_POWER: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
  SENSOR_HR: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
  SENSOR_CADENCE: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
  SENSOR_WOO: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
  SENSOR_SURFR: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
  SENSOR_OTHER: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
  DEVICE_OTHER: SOURCE_TIER_LEVELS.NON_MANUAL,
  OFFICIAL_RESULT: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
}

// Min tier levels map
export const MIN_TIER_LEVELS: Record<MinVerificationTier, number> = {
  ANY: SOURCE_TIER_LEVELS.MANUAL,
  NON_MANUAL: SOURCE_TIER_LEVELS.NON_MANUAL,
  VERIFIED_ONLY: SOURCE_TIER_LEVELS.VERIFIED_ONLY,
}

// User standing result
export interface UserStanding {
  disciplineId: string
  disciplineName: string
  sportName: string
  value: number
  unit: string
  percentile: number
  rank: number
  totalInScope: number
  isVerified: boolean
  verificationSource: VerificationSource
  achievedAt: Date
}

// Standings response
export interface StandingsResponse {
  standings: UserStanding[]
  sportIndex: number
  sportIndexDelta7d: number
  mode: LeaderboardMode
}
