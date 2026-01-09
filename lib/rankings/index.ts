/**
 * Rankings Module
 *
 * Centralized rankings, eligibility, and percentile calculations.
 */

// Types
export type {
  LeaderboardMode,
  RankingScope,
  UserStanding,
  StandingsResponse,
} from "./types"

// Eligibility
export {
  tierForSource,
  meetsMinTier,
  scopeMinTier,
  isPbEligibleForScope,
  isVerifiedSource,
  getSourceLabel,
} from "./eligibility"

// Percentiles
export {
  formatPercentile,
  calculatePercentile,
  formatRankDisplay,
  getOrdinalSuffix,
  formatStandingsDisplay,
} from "./percentile"

// Standings removed in V6 (benchmark-based)
export async function getUserStandings() { return [] }
export async function getUserBestStanding() { return null }

// Next Tier Ghost removed in V6 (benchmark-based)
export async function getNextTierGhost() { return null }
export async function getAllTierGhosts() { return [] }
export type NextTierGhost = { targetValue: number; percentileLabel: string }
export type NextTierResult = NextTierGhost | null
