/**
 * Moment Impact Scoring (V12)
 *
 * Calculates impact score for moments to enable quality filtering.
 * Higher scores = more significant achievements worth highlighting.
 *
 * Scoring Components:
 * 1. Type weight (PRs > Rankings > Streaks > General)
 * 2. Proof level bonus (SENSOR/VERIFIED get boost)
 * 3. Rarity factor (larger improvements = higher score)
 * 4. Recency of last similar achievement
 */

import type { MomentType, ProofLevel, UserPersona } from "@prisma/client"
import { isFlagEnabled } from "@/lib/flags"

// =============================================================================
// TYPES
// =============================================================================

export interface MomentScoreInput {
  type: MomentType
  /** Value achieved */
  value?: number | null
  /** Previous value (for improvement calculation) */
  previousValue?: number | null
  /** Proof level of the activity */
  proofLevel?: ProofLevel | null
  /** Whether this is from a verified source */
  isVerified?: boolean
  /** User's persona for weighting */
  persona?: UserPersona | null
  /** Percentile improvement (if rank-based) */
  percentileImprovement?: number | null
  /** Days since last similar moment */
  daysSinceLastSimilar?: number | null
}

export interface MomentScoreResult {
  /** Final impact score (0-100) */
  score: number
  /** Breakdown of score components */
  breakdown: {
    typeWeight: number
    proofBonus: number
    rarityBonus: number
    recencyBonus: number
  }
  /** Whether this moment should be prioritized for the persona */
  priorityForPersona: boolean
}

// =============================================================================
// CONFIGURATION
// =============================================================================

// Base weights by moment type (out of 50)
const TYPE_WEIGHTS: Record<MomentType, number> = {
  PERSONAL_RECORD: 50,      // PRs are most significant
  SEASON_PLACEMENT: 45,     // Top season finish
  RIVALRY_WIN: 42,          // Competition win
  GAUNTLET_WIN: 42,         // Competition win
  RANK_UP: 40,              // Ranking improvement
  BIG_ACTIVITY: 35,         // Exceptional activity
  BADGE_EARNED: 30,         // New badge
  STREAK_MILESTONE: 28,     // Streak achievement
  ACTIVITY_MILESTONE: 25,   // 100th, 500th activity
  FIRST_ACTIVITY: 20,       // First in a sport
}

// Persona preferences for moment types
const PERSONA_PRIORITIES: Record<UserPersona, MomentType[]> = {
  COMPETITOR: [
    "RANK_UP",
    "RIVALRY_WIN",
    "GAUNTLET_WIN",
    "SEASON_PLACEMENT",
    "PERSONAL_RECORD",
  ],
  TRACKER: [
    "STREAK_MILESTONE",
    "ACTIVITY_MILESTONE",
    "PERSONAL_RECORD",
    "BIG_ACTIVITY",
  ],
  SOCIAL: [
    "PERSONAL_RECORD",
    "BIG_ACTIVITY",
    "BADGE_EARNED",
    "FIRST_ACTIVITY",
  ],
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

/**
 * Calculate impact score for a moment
 */
export function scoreMoment(input: MomentScoreInput): MomentScoreResult {
  if (!isFlagEnabled("MOMENTS_QUALITY_V1")) {
    // Return default score if feature disabled
    return {
      score: 50,
      breakdown: { typeWeight: 50, proofBonus: 0, rarityBonus: 0, recencyBonus: 0 },
      priorityForPersona: false,
    }
  }

  const breakdown = {
    typeWeight: calculateTypeWeight(input.type),
    proofBonus: calculateProofBonus(input.proofLevel, input.isVerified),
    rarityBonus: calculateRarityBonus(input),
    recencyBonus: calculateRecencyBonus(input.daysSinceLastSimilar),
  }

  // Calculate total score (cap at 100)
  const score = Math.min(
    100,
    breakdown.typeWeight +
      breakdown.proofBonus +
      breakdown.rarityBonus +
      breakdown.recencyBonus
  )

  // Check if this type is priority for user's persona
  const priorityForPersona = isPriorityForPersona(input.type, input.persona)

  return {
    score: Math.round(score),
    breakdown,
    priorityForPersona,
  }
}

// =============================================================================
// COMPONENT CALCULATORS
// =============================================================================

function calculateTypeWeight(type: MomentType): number {
  return TYPE_WEIGHTS[type] ?? 25
}

function calculateProofBonus(
  proofLevel?: ProofLevel | null,
  isVerified?: boolean
): number {
  if (isVerified || proofLevel === "VERIFIED") return 15
  if (proofLevel === "SENSOR") return 12
  if (proofLevel === "GPX") return 8
  if (proofLevel === "PHOTO") return 4
  return 0
}

function calculateRarityBonus(input: MomentScoreInput): number {
  // For PRs, calculate improvement percentage
  if (
    input.type === "PERSONAL_RECORD" &&
    input.value != null &&
    input.previousValue != null &&
    input.previousValue !== 0
  ) {
    const improvementPct = Math.abs(
      ((input.value - input.previousValue) / input.previousValue) * 100
    )

    // Scale: 1% = 2 points, capped at 20 points
    return Math.min(20, Math.round(improvementPct * 2))
  }

  // For rank-ups, use percentile improvement
  if (input.type === "RANK_UP" && input.percentileImprovement != null) {
    // Moving up 5 percentile points = 10 bonus points
    return Math.min(20, Math.round(input.percentileImprovement * 2))
  }

  // For streak milestones, higher milestones = more points
  if (input.type === "STREAK_MILESTONE" && input.value != null) {
    if (input.value >= 365) return 20  // 1 year
    if (input.value >= 100) return 15  // 100 days
    if (input.value >= 30) return 10   // 1 month
    if (input.value >= 14) return 5    // 2 weeks
    return 2
  }

  // For activity milestones
  if (input.type === "ACTIVITY_MILESTONE" && input.value != null) {
    if (input.value >= 1000) return 20
    if (input.value >= 500) return 15
    if (input.value >= 100) return 10
    return 5
  }

  return 0
}

function calculateRecencyBonus(daysSinceLastSimilar?: number | null): number {
  if (daysSinceLastSimilar == null) return 5 // First of its kind = bonus

  // Rarer = more points
  if (daysSinceLastSimilar >= 365) return 15 // Over a year
  if (daysSinceLastSimilar >= 180) return 12 // 6 months
  if (daysSinceLastSimilar >= 90) return 8   // 3 months
  if (daysSinceLastSimilar >= 30) return 5   // 1 month
  if (daysSinceLastSimilar >= 7) return 2    // 1 week
  return 0 // Very recent = no bonus
}

function isPriorityForPersona(
  type: MomentType,
  persona?: UserPersona | null
): boolean {
  if (!persona) return false
  const priorities = PERSONA_PRIORITIES[persona]
  return priorities.includes(type)
}

// =============================================================================
// BATCH SCORING
// =============================================================================

/**
 * Score multiple moments and sort by impact
 */
export function scoreMoments(
  moments: Array<MomentScoreInput & { id: string }>
): Array<{ id: string; score: number; priorityForPersona: boolean }> {
  return moments
    .map((moment) => {
      const result = scoreMoment(moment)
      return {
        id: moment.id,
        score: result.score,
        priorityForPersona: result.priorityForPersona,
      }
    })
    .sort((a, b) => {
      // Priority for persona first, then by score
      if (a.priorityForPersona !== b.priorityForPersona) {
        return a.priorityForPersona ? -1 : 1
      }
      return b.score - a.score
    })
}

// =============================================================================
// THRESHOLD UTILITIES
// =============================================================================

/** Minimum score to be considered for weekly curation */
export const CURATION_THRESHOLD = 30

/** Number of moments to keep per week */
export const MOMENTS_PER_WEEK = 3

/**
 * Check if a moment passes the quality threshold
 */
export function passesQualityThreshold(score: number): boolean {
  return score >= CURATION_THRESHOLD
}
