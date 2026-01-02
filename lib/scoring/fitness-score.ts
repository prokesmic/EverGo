/**
 * v4.2 Fitness Score Module
 *
 * Calculates a universal cross-sport "Fitness Score" based on MET weighting.
 * MET (Metabolic Equivalent of Task) represents the energy cost of activities.
 *
 * Formula: FitnessScore = sum(MET * durationHours * intensityFactor)
 *
 * The score is calculated over a rolling window (default 28 days) and
 * normalized to a 0-1000 scale for leaderboard comparability.
 */

import type { Activity, Sport } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

export interface FitnessScoreInput {
  durationSeconds: number;
  sport: {
    metDefault: number;
  };
  // Optional intensity modifiers
  avgHeartRate?: number | null;
  maxHeartRate?: number | null;
  rpe?: number | null; // Rate of Perceived Exertion (1-10)
  elevationGain?: number | null;
}

export interface FitnessScoreResult {
  rawEffort: number; // MET-hours
  normalizedScore: number; // 0-1000 scale
  intensityFactor: number; // Calculated intensity modifier
}

export interface WindowedFitnessScore {
  totalEffort: number;
  activityCount: number;
  fitnessScore: number; // 0-1000
  periodDays: number;
}

// =============================================================================
// DEFAULT MET VALUES BY SPORT CATEGORY
// =============================================================================

/**
 * Default MET values for common sports.
 * These can be overridden by the Sport.metDefault field.
 *
 * Sources: Compendium of Physical Activities
 * https://sites.google.com/site/compendiumofphysicalactivities/
 */
export const SPORT_MET_DEFAULTS: Record<string, number> = {
  // Endurance
  running: 9.8, // Running, 6 mph (10 min mile)
  cycling: 7.5, // Cycling, 12-14 mph
  swimming: 8.0, // Swimming, freestyle, moderate effort
  triathlon: 9.0, // Combined estimate
  hiking: 6.0, // Hiking, cross country

  // Team Sports
  soccer: 7.0, // Soccer, competitive
  basketball: 6.5, // Basketball, game
  volleyball: 4.0, // Volleyball, competitive
  football: 8.0, // Football, competitive
  hockey: 8.0, // Ice hockey, general

  // Racket Sports
  tennis: 7.3, // Tennis, singles
  badminton: 5.5, // Badminton, competitive
  pickleball: 4.5, // Pickleball, general
  squash: 7.3, // Squash

  // Strength
  weightlifting: 6.0, // Weight lifting, vigorous
  crossfit: 8.0, // High intensity circuit

  // Combat
  boxing: 7.8, // Boxing, sparring
  judo: 10.3, // Judo, jujitsu
  mma: 8.0, // Mixed martial arts

  // Water/Board Sports
  surfing: 3.0, // Surfing, body or board
  kitesurfing: 4.0, // Kitesurfing estimate
  wakeboarding: 6.0, // Wakeboarding estimate
  paddleboarding: 4.0, // Stand-up paddleboarding

  // Winter Sports
  skiing: 6.8, // Skiing, downhill, moderate
  snowboarding: 5.3, // Snowboarding, moderate
  crosscountry_skiing: 9.0, // Cross-country skiing, moderate

  // Mind/Body
  yoga: 2.5, // Yoga, hatha
  pilates: 3.0, // Pilates

  // Default fallback
  default: 6.0,
};

// =============================================================================
// INTENSITY CALCULATION
// =============================================================================

/**
 * Calculate intensity factor based on heart rate zones.
 * Uses percentage of max heart rate if available.
 *
 * Returns a multiplier between 0.5 (very easy) and 1.5 (very hard).
 */
export function calculateIntensityFromHeartRate(
  avgHeartRate: number | null | undefined,
  maxHeartRate: number | null | undefined
): number {
  if (!avgHeartRate) return 1.0;

  // Estimate max HR if not provided (220 - age approximation, use 185 as default)
  const maxHR = maxHeartRate ?? 185;
  const hrPercentage = avgHeartRate / maxHR;

  // Zone-based intensity multiplier
  if (hrPercentage < 0.5) return 0.6; // Zone 1: Recovery
  if (hrPercentage < 0.6) return 0.8; // Zone 2: Easy
  if (hrPercentage < 0.7) return 1.0; // Zone 3: Moderate
  if (hrPercentage < 0.8) return 1.2; // Zone 4: Threshold
  if (hrPercentage < 0.9) return 1.3; // Zone 5a: VO2max
  return 1.4; // Zone 5b: Anaerobic
}

/**
 * Calculate intensity factor based on RPE (Rate of Perceived Exertion).
 * RPE is a 1-10 scale where 10 is maximum effort.
 */
export function calculateIntensityFromRPE(rpe: number | null | undefined): number {
  if (!rpe || rpe < 1 || rpe > 10) return 1.0;

  // Map RPE to intensity multiplier
  // RPE 1-3: Easy (0.7-0.9)
  // RPE 4-6: Moderate (1.0-1.1)
  // RPE 7-9: Hard (1.2-1.4)
  // RPE 10: Maximum (1.5)
  return 0.6 + rpe * 0.09;
}

/**
 * Calculate intensity factor based on elevation gain.
 * Hills/climbing require more effort than flat terrain.
 */
export function calculateIntensityFromElevation(
  elevationGain: number | null | undefined,
  durationMinutes: number
): number {
  if (!elevationGain || elevationGain < 0) return 1.0;

  // Elevation gain per minute (m/min)
  const gainPerMinute = elevationGain / Math.max(1, durationMinutes);

  // No bonus below 1 m/min
  if (gainPerMinute < 1) return 1.0;

  // Linear bonus up to 30% for steep climbs (10+ m/min is very steep)
  const bonus = Math.min(0.3, gainPerMinute * 0.03);
  return 1.0 + bonus;
}

/**
 * Calculate combined intensity factor from all available inputs.
 */
export function calculateIntensityFactor(input: FitnessScoreInput): number {
  const durationMinutes = input.durationSeconds / 60;

  // Collect intensity signals
  const hrIntensity = calculateIntensityFromHeartRate(
    input.avgHeartRate,
    input.maxHeartRate
  );

  const rpeIntensity = calculateIntensityFromRPE(input.rpe);

  const elevationIntensity = calculateIntensityFromElevation(
    input.elevationGain,
    durationMinutes
  );

  // Weight by data quality:
  // - HR data is most objective
  // - RPE is subjective but useful
  // - Elevation is an objective modifier
  let totalWeight = 0;
  let weightedSum = 0;

  if (input.avgHeartRate) {
    weightedSum += hrIntensity * 3;
    totalWeight += 3;
  }

  if (input.rpe) {
    weightedSum += rpeIntensity * 2;
    totalWeight += 2;
  }

  // Elevation is additive, not weighted
  const baseIntensity = totalWeight > 0 ? weightedSum / totalWeight : 1.0;

  // Apply elevation modifier on top
  return baseIntensity * elevationIntensity;
}

// =============================================================================
// FITNESS SCORE CALCULATION
// =============================================================================

/**
 * Calculate MET-hours for a single activity.
 * This is the raw effort value before normalization.
 */
export function calculateMETHours(input: FitnessScoreInput): number {
  const durationHours = input.durationSeconds / 3600;
  const met = input.sport.metDefault;
  const intensityFactor = calculateIntensityFactor(input);

  return met * durationHours * intensityFactor;
}

/**
 * Calculate Fitness Score for a single activity.
 */
export function calculateActivityFitnessScore(
  input: FitnessScoreInput
): FitnessScoreResult {
  const intensityFactor = calculateIntensityFactor(input);
  const rawEffort = calculateMETHours(input);

  // Normalize to 0-1000 scale
  // Roughly: 1 MET-hour = 10 points
  // A 1-hour moderate run (~10 MET) = 100 points
  // Weekly active person might get 300-500 points
  // Elite athlete might get 800-1000 points per week
  const normalizedScore = Math.min(1000, rawEffort * 10);

  return {
    rawEffort,
    normalizedScore,
    intensityFactor,
  };
}

/**
 * Calculate windowed Fitness Score from multiple activities.
 */
export function calculateWindowedFitnessScore(
  activities: Array<{
    durationSeconds: number | null;
    sport: { metDefault: number };
    avgHeartRate?: number | null;
    maxHeartRate?: number | null;
    rpe?: number | null;
    elevationGain?: number | null;
  }>,
  periodDays: number = 28
): WindowedFitnessScore {
  let totalEffort = 0;
  let activityCount = 0;

  for (const activity of activities) {
    if (!activity.durationSeconds || activity.durationSeconds <= 0) continue;

    const input: FitnessScoreInput = {
      durationSeconds: activity.durationSeconds,
      sport: activity.sport,
      avgHeartRate: activity.avgHeartRate,
      maxHeartRate: activity.maxHeartRate,
      rpe: activity.rpe,
      elevationGain: activity.elevationGain,
    };

    totalEffort += calculateMETHours(input);
    activityCount++;
  }

  // Normalize total effort to 0-1000 scale
  // Target: ~50 MET-hours/week for moderately active = 500
  // 28-day window at 50 MET-hours/week = 200 MET-hours = 500 score
  // So: score = (totalEffort / 200) * 500 = totalEffort * 2.5
  // But we want some headroom for elite athletes, so use 2.0
  const fitnessScore = Math.min(1000, Math.round(totalEffort * 2.0));

  return {
    totalEffort,
    activityCount,
    fitnessScore,
    periodDays,
  };
}

// =============================================================================
// EFFORT POINTS CALCULATION (for Activity.effortPoints)
// =============================================================================

/**
 * Calculate effort points for an activity to store in Activity.effortPoints.
 * This is a simpler calculation for quick sorting/filtering.
 */
export function calculateEffortPoints(input: FitnessScoreInput): number {
  const metHours = calculateMETHours(input);

  // Scale to integer points: 1 MET-hour = 100 points
  // A 1-hour moderate run = 1000 points
  // A 30-min easy walk = 150 points
  return Math.round(metHours * 100);
}

// =============================================================================
// EXPORTS
// =============================================================================

export const FitnessScoreCalculator = {
  calculateIntensityFactor,
  calculateMETHours,
  calculateActivityFitnessScore,
  calculateWindowedFitnessScore,
  calculateEffortPoints,
  SPORT_MET_DEFAULTS,
};

export default FitnessScoreCalculator;
