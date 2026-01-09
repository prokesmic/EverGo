/**
 * Power Points System (V6 - rebranded from Effort Points)
 *
 * Provides a normalized "power" score for any activity, making them
 * comparable across different sports for the "Most Active" leaderboard.
 *
 * Formula: powerPoints = durationMin * intensityFactor * sportFactor
 *
 * - intensityFactor is determined by HR, power, or RPE
 * - sportFactor approximates MET baseline for the sport
 */

/**
 * Sport-specific MET-like factors for normalizing effort across sports.
 * Higher values mean the sport is more demanding per minute.
 * Values are conservative estimates.
 */
const SPORT_FACTORS: Record<string, number> = {
  // Endurance (high sustained effort)
  running: 1.2,
  cycling: 1.0,
  swimming: 1.3,
  rowing: 1.3,
  "cross-country-skiing": 1.4,

  // Team sports (variable intensity)
  soccer: 1.1,
  basketball: 1.1,
  volleyball: 0.9,
  hockey: 1.2,

  // Racket sports (bursts)
  tennis: 1.0,
  badminton: 0.9,
  squash: 1.1,
  "table-tennis": 0.7,

  // Water sports
  kitesurfing: 1.1,
  windsurfing: 1.0,
  surfing: 0.9,
  sailing: 0.6,
  kayaking: 1.1,

  // Winter sports
  skiing: 1.0,
  snowboarding: 0.9,
  "ice-skating": 1.0,

  // Strength / Gym
  strength: 1.0,
  crossfit: 1.3,
  "weight-training": 0.9,

  // Mind-body (lower intensity)
  yoga: 0.6,
  pilates: 0.7,
  stretching: 0.4,
  meditation: 0.2,

  // Outdoor / Adventure
  hiking: 0.9,
  climbing: 1.1,
  "rock-climbing": 1.1,
  mountaineering: 1.2,
  walking: 0.5,

  // Combat sports
  boxing: 1.3,
  "martial-arts": 1.1,
  wrestling: 1.2,
  judo: 1.2,

  // Dance / Aerobics
  dancing: 0.8,
  aerobics: 1.0,
  zumba: 0.9,

  // Golf (low intensity but long duration)
  golf: 0.4,
}

export type ComputePowerInput = {
  sportSlug: string
  durationMin: number
  distanceKm?: number | null
  avgHr?: number | null
  maxHr?: number | null
  avgPower?: number | null
  rpe?: number | null // 1-10 scale
}

// Legacy alias
export type ComputeEffortInput = ComputePowerInput

/**
 * Compute power points for an activity.
 *
 * @returns A normalized power score (typically 0-500 for a 1-hour workout)
 */
export function computePowerPoints(input: ComputePowerInput): number {
  const {
    sportSlug,
    durationMin,
    avgHr,
    avgPower,
    rpe,
  } = input

  // Ensure positive duration
  const base = Math.max(0, durationMin)
  if (base === 0) return 0

  // Get sport factor (default to 1.0 if unknown sport)
  const sportFactor = SPORT_FACTORS[sportSlug.toLowerCase()] ?? 1.0

  // Determine intensity factor from available data
  // Priority: Power > Heart Rate > RPE > Default
  let intensity = 1.0

  if (typeof avgPower === "number" && avgPower > 0) {
    // Power-based intensity (cycling, rowing, etc.)
    // Normalize around 200W as baseline, scale from 0.7 to 2.0
    intensity = 0.7 + Math.min(1.3, (avgPower / 200) * 0.8)
  } else if (typeof avgHr === "number" && avgHr > 0) {
    // HR-based intensity
    // Normalize around 140 bpm as moderate, scale from 0.6 to 1.8
    intensity = 0.6 + Math.min(1.2, (avgHr / 140) * 0.6)
  } else if (typeof rpe === "number" && rpe >= 1 && rpe <= 10) {
    // RPE-based intensity (1-10 scale)
    // Map 1-10 to 0.4-1.8 intensity
    intensity = 0.4 + (Math.min(10, Math.max(1, rpe)) / 10) * 1.4
  }

  // Calculate final power points
  // A moderate 60-min run would be: 60 * 1.0 * 1.2 = 72 points
  const powerPoints = Math.round(base * intensity * sportFactor)

  return powerPoints
}

// Legacy alias
export const computeEffortPoints = computePowerPoints

/**
 * Compute the "activity score" from total power points.
 * Uses a logarithmic scale to prevent super-active users from dominating.
 *
 * Target: ~10,000 power in 28 days for a very active user = score of 1000
 *
 * @param totalPower Sum of powerPoints over the window
 * @returns Score from 0-1000
 */
export function computeActivityScore(totalPower: number): number {
  if (totalPower <= 0) return 0

  // Log scale: 1000 * log(1 + power) / log(1 + 10000)
  // This gives diminishing returns as power increases
  const score = Math.round(
    (1000 * Math.log(1 + totalPower)) / Math.log(1 + 10000)
  )

  return Math.min(1000, Math.max(0, score))
}

/**
 * Get the sport factor for a given sport slug.
 * Useful for displaying to users.
 */
export function getSportFactor(sportSlug: string): number {
  return SPORT_FACTORS[sportSlug.toLowerCase()] ?? 1.0
}

/**
 * Get all known sport factors.
 */
export function getAllSportFactors(): Record<string, number> {
  return { ...SPORT_FACTORS }
}
