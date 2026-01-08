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

// Standings
export {
  getUserStandings,
  getUserBestStanding,
} from "./standings"

// Next Tier Ghost
export {
  getNextTierGhost,
  getAllTierGhosts,
} from "./nextTier"

export type { NextTierGhost, NextTierResult } from "./nextTier"
