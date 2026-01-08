/**
 * Universal Import Engine Types
 *
 * Defines the normalized activity data structure for imported files.
 */

export interface GpsPoint {
  lat: number
  lon: number
  elevation?: number
  time?: Date
  hr?: number
  cadence?: number
  power?: number
}

/**
 * Normalized activity data from any import source
 */
export interface ActivityNormalized {
  // Time
  startAt: Date
  durationSec: number

  // Distance & Elevation
  distanceM: number
  elevGainM: number

  // Metrics
  avgHr?: number
  maxHr?: number
  avgPowerW?: number
  maxPowerW?: number
  avgCadence?: number
  avgSpeed?: number // km/h
  avgPace?: number // sec/km

  // Sport detection
  sportSlugGuess: string

  // GPS data
  gpsPoints: GpsPoint[]
  gpsPointsCount: number

  // Data quality flags
  hasGps: boolean
  hasHr: boolean
  hasPower: boolean
  hasCadence: boolean

  // Calories (if available)
  calories?: number

  // Title (if available in file)
  title?: string

  // Raw metadata
  metadata?: Record<string, unknown>
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean
  activityId?: string
  importId?: string
  error?: string
  normalized?: ActivityNormalized
}

/**
 * File extension to type mapping
 */
export const FILE_TYPE_MAP = {
  fit: "FIT",
  gpx: "GPX",
  tcx: "TCX",
} as const

export type SupportedFileType = keyof typeof FILE_TYPE_MAP

/**
 * Sport slug guessing based on activity characteristics
 */
export function guessSportSlug(
  distanceM: number,
  durationSec: number,
  avgSpeed?: number,
  hasPower?: boolean
): string {
  const speedKmh = avgSpeed ?? (distanceM / 1000 / (durationSec / 3600))

  // Cycling typically > 15 km/h average, or has power meter
  if (hasPower || speedKmh > 15) {
    return "cycling"
  }

  // Running typically 5-20 km/h
  if (speedKmh >= 5 && speedKmh <= 20) {
    return "running"
  }

  // Walking typically < 7 km/h
  if (speedKmh < 7) {
    return "walking"
  }

  // Default to running
  return "running"
}
