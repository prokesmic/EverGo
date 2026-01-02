/**
 * v4.2 Scoring Strategies Module
 *
 * Provides scoring strategies for different discipline kinds without using
 * a formula parser (which was explicitly excluded from scope in v4.2).
 *
 * Each strategy knows how to:
 * - Extract a comparable value from an activity/benchmark result
 * - Determine if higher or lower is better
 * - Compare two values for ranking purposes
 */

import type {
  BenchmarkSource,
  MeasurementType,
  ScoringKind,
  MinVerificationTier,
} from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

export interface ScoringInput {
  value: number;
  source: BenchmarkSource;
  achievedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface ScoringContext {
  measurementType: MeasurementType;
  higherIsBetter: boolean;
  scoringKind: ScoringKind;
  validityMonths: number;
  decayAfterMonths?: number;
}

export interface ScoredResult {
  rawValue: number;
  normalizedScore: number; // 0-1000 scale for comparability
  isStale: boolean; // Past validity window
  isDecayed: boolean; // Past decay threshold
  decayFactor: number; // 1.0 = no decay, < 1.0 = decayed
}

export type RankingScope = 'GLOBAL' | 'COUNTRY' | 'CITY' | 'TEAM';

// =============================================================================
// VERIFICATION TIER CLASSIFICATION
// =============================================================================

/**
 * Sources that count as "non-manual" for MinVerificationTier checks.
 * These are imports from connected apps/devices.
 */
export const NON_MANUAL_SOURCES: BenchmarkSource[] = [
  'ACTIVITY_DERIVED',
  'IMPORT_STRAVA',
  'IMPORT_GARMIN',
  'IMPORT_APPLE_HEALTH',
  'IMPORT_GOOGLE_FIT',
  'SENSOR_WOO',
  'SENSOR_SURFR',
  'SENSOR_OTHER',
  'DEVICE_OTHER',
];

/**
 * Sources that count as "verified" for stricter MinVerificationTier checks.
 * These are sensor-based or officially verified.
 */
export const VERIFIED_SOURCES: BenchmarkSource[] = [
  'SENSOR_WOO',
  'SENSOR_SURFR',
  'SENSOR_OTHER',
  // Could add OFFICIAL_RESULT if using VerificationSource enum
];

/**
 * Check if a source meets a given verification tier requirement.
 */
export function meetsVerificationTier(
  source: BenchmarkSource,
  minTier: MinVerificationTier
): boolean {
  switch (minTier) {
    case 'ANY':
      return true;
    case 'NON_MANUAL':
      return NON_MANUAL_SOURCES.includes(source);
    case 'VERIFIED_ONLY':
      return VERIFIED_SOURCES.includes(source);
    default:
      return false;
  }
}

/**
 * Get the minimum verification tier for a given scope.
 */
export function getMinTierForScope(
  scope: RankingScope,
  discipline: {
    minTierGlobal: MinVerificationTier;
    minTierCountry: MinVerificationTier;
    minTierCity: MinVerificationTier;
    minTierTeam: MinVerificationTier;
  }
): MinVerificationTier {
  switch (scope) {
    case 'GLOBAL':
      return discipline.minTierGlobal;
    case 'COUNTRY':
      return discipline.minTierCountry;
    case 'CITY':
      return discipline.minTierCity;
    case 'TEAM':
      return discipline.minTierTeam;
    default:
      return 'NON_MANUAL';
  }
}

/**
 * Check if a personal best is eligible for a given scope.
 */
export function isEligibleForScope(
  source: BenchmarkSource,
  scope: RankingScope,
  discipline: {
    minTierGlobal: MinVerificationTier;
    minTierCountry: MinVerificationTier;
    minTierCity: MinVerificationTier;
    minTierTeam: MinVerificationTier;
  }
): boolean {
  const minTier = getMinTierForScope(scope, discipline);
  return meetsVerificationTier(source, minTier);
}

// =============================================================================
// SCORING STRATEGIES
// =============================================================================

/**
 * Calculate decay factor based on how old a result is.
 * Results older than validityMonths have 0 factor (excluded).
 * Results between decayAfterMonths and validityMonths have partial decay.
 */
export function calculateDecayFactor(
  achievedAt: Date,
  now: Date,
  validityMonths: number,
  decayAfterMonths?: number
): { factor: number; isStale: boolean; isDecayed: boolean } {
  const ageMs = now.getTime() - achievedAt.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44); // Average month

  if (ageMonths > validityMonths) {
    return { factor: 0, isStale: true, isDecayed: true };
  }

  const decayStart = decayAfterMonths ?? validityMonths;
  if (ageMonths <= decayStart) {
    return { factor: 1, isStale: false, isDecayed: false };
  }

  // Linear decay from 1.0 to 0.5 between decayStart and validityMonths
  const decayProgress = (ageMonths - decayStart) / (validityMonths - decayStart);
  const factor = 1 - decayProgress * 0.5;

  return { factor, isStale: false, isDecayed: true };
}

/**
 * Normalize a value to a 0-1000 score.
 * This is a simple percentile-based normalization that could be enhanced
 * with population statistics in the future.
 */
export function normalizeToScore(
  value: number,
  measurementType: MeasurementType,
  higherIsBetter: boolean
): number {
  // For now, return the raw value scaled.
  // In production, this should use population percentiles.
  // E.g., a 5K time of 20:00 might be 60th percentile = 600 score.

  // Placeholder implementation - in v4.3 we'd integrate population stats
  // For TIME_SECONDS: sub-15min 5K = 900+, 25min = 500, 35min = 200
  // For POWER_WKG: 5+ W/kg = 900+, 3 W/kg = 500, 1.5 W/kg = 200

  // Return raw value for now - actual normalization requires benchmarks
  return Math.min(1000, Math.max(0, value));
}

/**
 * Score a benchmark result according to its context.
 */
export function scoreBenchmark(
  input: ScoringInput,
  context: ScoringContext,
  now: Date = new Date()
): ScoredResult {
  const decay = calculateDecayFactor(
    input.achievedAt,
    now,
    context.validityMonths,
    context.decayAfterMonths
  );

  const normalizedScore = normalizeToScore(
    input.value,
    context.measurementType,
    context.higherIsBetter
  );

  return {
    rawValue: input.value,
    normalizedScore: normalizedScore * decay.factor,
    isStale: decay.isStale,
    isDecayed: decay.isDecayed,
    decayFactor: decay.factor,
  };
}

/**
 * Compare two results for ranking.
 * Returns negative if a ranks higher, positive if b ranks higher.
 */
export function compareForRanking(
  a: ScoredResult,
  b: ScoredResult,
  higherIsBetter: boolean
): number {
  // If one is stale and one isn't, the non-stale one ranks higher
  if (a.isStale && !b.isStale) return 1;
  if (!a.isStale && b.isStale) return -1;

  // Compare normalized scores
  if (higherIsBetter) {
    return b.normalizedScore - a.normalizedScore;
  } else {
    return a.normalizedScore - b.normalizedScore;
  }
}

// =============================================================================
// RANKING WITH TIES (Standard Competition Ranking: "1224")
// =============================================================================

export interface RankedEntry<T> {
  entry: T;
  rank: number;
  score: number;
  tiedWith: number; // Number of entries with the same rank
}

/**
 * Assign ranks using standard competition ranking ("1224" style).
 * Same scores get the same rank, next rank skips appropriately.
 *
 * Example: [100, 100, 90, 80] => ranks [1, 1, 3, 4]
 */
export function assignCompetitionRanks<T>(
  entries: T[],
  getScore: (entry: T) => number,
  higherIsBetter: boolean = true
): RankedEntry<T>[] {
  if (entries.length === 0) return [];

  // Sort by score
  const sorted = [...entries].map((entry) => ({
    entry,
    score: getScore(entry),
  }));

  sorted.sort((a, b) => {
    if (higherIsBetter) {
      return b.score - a.score;
    }
    return a.score - b.score;
  });

  const result: RankedEntry<T>[] = [];
  let currentRank = 1;
  let tieCount = 1;

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : null;

    if (prev && current.score === prev.score) {
      // Same score as previous - same rank
      tieCount++;
    } else {
      // New score - update rank to current position (1-indexed)
      currentRank = i + 1;
      tieCount = 1;
    }

    result.push({
      entry: current.entry,
      rank: currentRank,
      score: current.score,
      tiedWith: 0, // Will be filled in second pass
    });
  }

  // Second pass: fill in tiedWith counts
  for (let i = 0; i < result.length; i++) {
    const rank = result[i].rank;
    const tiedWithCount = result.filter((r) => r.rank === rank).length - 1;
    result[i].tiedWith = tiedWithCount;
  }

  return result;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const ScoringStrategies = {
  meetsVerificationTier,
  getMinTierForScope,
  isEligibleForScope,
  calculateDecayFactor,
  normalizeToScore,
  scoreBenchmark,
  compareForRanking,
  assignCompetitionRanks,
};

export default ScoringStrategies;
