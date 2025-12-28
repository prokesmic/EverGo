/**
 * PB Validity and Decay Logic
 *
 * Ranking validity window: PBs affect ranking seeding for 24 months (hard cutoff)
 * Recency decay (soft): after 12 months, PB weight decays (still visible, less impact)
 * PBs older than 24 months remain stored as Legacy PB (for history) but do not affect ranking
 */

/**
 * Calculate the number of months between two dates
 */
export function monthsBetween(a: Date, b: Date): number {
  const ay = a.getFullYear()
  const am = a.getMonth()
  const by = b.getFullYear()
  const bm = b.getMonth()
  return Math.abs((by - ay) * 12 + (bm - am))
}

export interface PbStatusParams {
  achievedAt: Date
  validityMonths: number
  decayAfterMonths: number
}

export interface PbStatus {
  monthsOld: number
  isLegacy: boolean
  weight: number
  statusLabel: "current" | "decaying" | "legacy"
}

/**
 * Compute the status of a PB based on its age
 *
 * - Current (weight 1.0): within decayAfterMonths (e.g., 12 months)
 * - Decaying (weight 0.0-1.0): between decayAfterMonths and validityMonths
 * - Legacy (weight 0.0): older than validityMonths
 */
export function computePbStatus(params: PbStatusParams): PbStatus {
  const now = new Date()
  const m = monthsBetween(params.achievedAt, now)

  // PB older than validity window is legacy
  const isLegacy = m > params.validityMonths

  // Calculate weight based on age
  let weight: number
  let statusLabel: PbStatus["statusLabel"]

  if (m <= params.decayAfterMonths) {
    // Current - full weight
    weight = 1.0
    statusLabel = "current"
  } else if (m <= params.validityMonths) {
    // Decaying - linear decay from 1.0 to 0.0
    weight = Math.max(
      0,
      1 - (m - params.decayAfterMonths) / (params.validityMonths - params.decayAfterMonths)
    )
    statusLabel = "decaying"
  } else {
    // Legacy - no ranking impact
    weight = 0
    statusLabel = "legacy"
  }

  return {
    monthsOld: m,
    isLegacy,
    weight,
    statusLabel,
  }
}

/**
 * Check if a new value is better than the current value
 */
export function isBetter(params: {
  value: number
  current?: number | null
  higherIsBetter: boolean
}): boolean {
  if (params.current == null) return true
  return params.higherIsBetter
    ? params.value > params.current
    : params.value < params.current
}

/**
 * Format a time value (seconds) as mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return "0:00"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

/**
 * Parse a time string (mm:ss or hh:mm:ss) to seconds
 */
export function parseTime(timeStr: string): number | null {
  const parts = timeStr.split(":").map(Number)
  if (parts.some(isNaN)) return null

  if (parts.length === 2) {
    // mm:ss
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // hh:mm:ss
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return null
}

/**
 * Format a benchmark value for display based on measurement type
 */
export function formatBenchmarkValue(
  value: number,
  measurementType: string,
  unit: string
): string {
  switch (measurementType) {
    case "TIME":
      return formatTime(value)
    case "DISTANCE":
      if (unit === "m" && value >= 1000) {
        return `${(value / 1000).toFixed(2)} km`
      }
      return `${value.toFixed(0)} ${unit}`
    case "SPEED":
      return `${value.toFixed(1)} ${unit}`
    case "POWER":
      return `${value.toFixed(0)} ${unit}`
    case "WEIGHT_REPS":
      return `${value.toFixed(1)} ${unit}`
    case "SCORE":
    case "COUNT":
      return `${value.toFixed(0)} ${unit}`
    case "GRADE_LEVEL":
      return `Level ${value.toFixed(0)}`
    default:
      return `${value} ${unit}`
  }
}
