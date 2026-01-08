/**
 * FIT Parser
 *
 * Simplified FIT (Flexible and Interoperable Data Transfer) parser.
 * FIT is Garmin's binary format for activity data.
 *
 * Note: For production, consider using a library like 'fit-file-parser'.
 * This is a minimal implementation for MVP.
 */

import { ActivityNormalized, GpsPoint, guessSportSlug } from "../types"

// FIT file constants
const FIT_HEADER_SIZE = 14
const FIT_MAGIC = [0x2e, 0x46, 0x49, 0x54] // ".FIT"

// Sport type mapping from FIT enum
const FIT_SPORT_MAP: Record<number, string> = {
  0: "running", // generic
  1: "running",
  2: "cycling",
  4: "walking", // transition
  5: "swimming",
  6: "cycling", // stationary bike
  10: "walking",
  11: "walking", // hiking
  17: "cycling", // mountain biking
  23: "rowing",
}

/**
 * Parse FIT binary buffer into normalized activity
 *
 * This is a simplified parser that extracts basic data.
 * For full FIT support, use a dedicated library.
 */
export function parseFit(buffer: Buffer): ActivityNormalized {
  // Validate FIT header
  if (buffer.length < FIT_HEADER_SIZE) {
    throw new Error("Invalid FIT file: too small")
  }

  // Check magic bytes
  const magic = buffer.slice(8, 12)
  if (
    magic[0] !== FIT_MAGIC[0] ||
    magic[1] !== FIT_MAGIC[1] ||
    magic[2] !== FIT_MAGIC[2] ||
    magic[3] !== FIT_MAGIC[3]
  ) {
    throw new Error("Invalid FIT file: bad magic bytes")
  }

  // For MVP, we'll return a placeholder with minimal parsing
  // In production, use a proper FIT parser library

  // Try to extract basic summary data from known record positions
  // This is a simplified approach; real FIT parsing requires full protocol implementation

  const points: GpsPoint[] = []
  let startAt = new Date()
  const durationSec = 0
  const distanceM = 0
  const elevGainM = 0
  let avgHr: number | undefined
  let maxHr: number | undefined
  let avgPowerW: number | undefined
  let avgCadence: number | undefined
  let calories: number | undefined
  const sportType = 1 // Default to running

  // Scan for common field patterns in the data section
  // This is a heuristic approach for MVP
  const dataStart = FIT_HEADER_SIZE
  const dataEnd = buffer.length - 2 // Skip CRC

  // Look for session/lap summary messages
  // FIT message types: 0=file_id, 18=session, 19=lap, 20=record, 21=event

  // Simple heuristic: scan for patterns that look like timestamp + distance + duration
  // This won't work for all FIT files but provides basic extraction

  // Attempt to find session data by looking for specific byte patterns
  for (let i = dataStart; i < dataEnd - 20; i++) {
    // Look for what might be a timestamp (4-byte little-endian, ~2020-2030 range)
    const possibleTimestamp = buffer.readUInt32LE(i)
    // FIT timestamps are seconds since 1989-12-31 00:00:00 UTC
    // 2020 would be ~978307200 (since 1989)
    // 2030 would be ~1293840000 (since 1989)
    if (possibleTimestamp > 800000000 && possibleTimestamp < 1400000000) {
      // This might be a timestamp, check surrounding data
      // For MVP, just use current time if we can't parse properly
      startAt = new Date((possibleTimestamp + 631065600) * 1000)
      break
    }
  }

  // Since proper FIT parsing is complex, for MVP we'll return a template
  // with flags indicating the file was recognized but needs full parsing

  return {
    startAt,
    durationSec,
    distanceM,
    elevGainM,
    avgHr,
    maxHr,
    avgPowerW,
    avgCadence,
    avgSpeed: 0,
    avgPace: 0,
    sportSlugGuess: FIT_SPORT_MAP[sportType] || "running",
    gpsPoints: points,
    gpsPointsCount: points.length,
    hasGps: false,
    hasHr: avgHr !== undefined,
    hasPower: avgPowerW !== undefined,
    hasCadence: avgCadence !== undefined,
    calories,
    metadata: {
      parserNote:
        "FIT file detected. Full parsing requires fit-file-parser library.",
      fileSize: buffer.length,
    },
  }
}

/**
 * Check if a buffer looks like a valid FIT file
 */
export function isFitFile(buffer: Buffer): boolean {
  if (buffer.length < FIT_HEADER_SIZE) return false

  const magic = buffer.slice(8, 12)
  return (
    magic[0] === FIT_MAGIC[0] &&
    magic[1] === FIT_MAGIC[1] &&
    magic[2] === FIT_MAGIC[2] &&
    magic[3] === FIT_MAGIC[3]
  )
}
