/**
 * GPX Parser
 *
 * Parses GPX (GPS Exchange Format) files into normalized activity data.
 * GPX is an XML-based format widely used for GPS data interchange.
 */

import { ActivityNormalized, GpsPoint, guessSportSlug } from "../types"

interface GpxTrackPoint {
  lat: number
  lon: number
  ele?: number
  time?: string
  extensions?: {
    hr?: number
    cad?: number
    power?: number
  }
}

/**
 * Parse GPX XML string into normalized activity
 */
export function parseGpx(content: string): ActivityNormalized {
  // Simple XML parsing using regex (for server-side without DOM)
  const points: GpsPoint[] = []

  // Extract track points
  const trkptRegex =
    /<trkpt[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g
  let match

  while ((match = trkptRegex.exec(content)) !== null) {
    const lat = parseFloat(match[1])
    const lon = parseFloat(match[2])
    const pointContent = match[3]

    const point: GpsPoint = { lat, lon }

    // Extract elevation
    const eleMatch = /<ele>([^<]+)<\/ele>/.exec(pointContent)
    if (eleMatch) {
      point.elevation = parseFloat(eleMatch[1])
    }

    // Extract time
    const timeMatch = /<time>([^<]+)<\/time>/.exec(pointContent)
    if (timeMatch) {
      point.time = new Date(timeMatch[1])
    }

    // Extract heart rate from extensions
    const hrMatch =
      /<(?:gpxtpx:hr|ns3:hr|hr)>([^<]+)<\/(?:gpxtpx:hr|ns3:hr|hr)>/.exec(
        pointContent
      )
    if (hrMatch) {
      point.hr = parseInt(hrMatch[1], 10)
    }

    // Extract cadence from extensions
    const cadMatch =
      /<(?:gpxtpx:cad|ns3:cad|cad)>([^<]+)<\/(?:gpxtpx:cad|ns3:cad|cad)>/.exec(
        pointContent
      )
    if (cadMatch) {
      point.cadence = parseInt(cadMatch[1], 10)
    }

    // Extract power from extensions
    const powerMatch = /<(?:power|ns3:power)>([^<]+)<\/(?:power|ns3:power)>/.exec(
      pointContent
    )
    if (powerMatch) {
      point.power = parseInt(powerMatch[1], 10)
    }

    points.push(point)
  }

  // Calculate metrics from points
  const { distanceM, elevGainM, durationSec, startAt } = calculateMetrics(points)

  // Calculate averages
  const hrValues = points.filter((p) => p.hr).map((p) => p.hr!)
  const cadenceValues = points.filter((p) => p.cadence).map((p) => p.cadence!)
  const powerValues = points.filter((p) => p.power).map((p) => p.power!)

  const avgHr =
    hrValues.length > 0
      ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length)
      : undefined

  const maxHr = hrValues.length > 0 ? Math.max(...hrValues) : undefined

  const avgCadence =
    cadenceValues.length > 0
      ? Math.round(cadenceValues.reduce((a, b) => a + b, 0) / cadenceValues.length)
      : undefined

  const avgPowerW =
    powerValues.length > 0
      ? Math.round(powerValues.reduce((a, b) => a + b, 0) / powerValues.length)
      : undefined

  const maxPowerW = powerValues.length > 0 ? Math.max(...powerValues) : undefined

  // Calculate speed/pace
  const avgSpeed = durationSec > 0 ? (distanceM / 1000 / (durationSec / 3600)) : 0
  const avgPace = distanceM > 0 ? (durationSec / (distanceM / 1000)) : 0

  // Extract title from metadata
  const titleMatch = /<name>([^<]+)<\/name>/.exec(content)
  const title = titleMatch ? titleMatch[1] : undefined

  return {
    startAt,
    durationSec,
    distanceM,
    elevGainM,
    avgHr,
    maxHr,
    avgPowerW,
    maxPowerW,
    avgCadence,
    avgSpeed,
    avgPace,
    sportSlugGuess: guessSportSlug(distanceM, durationSec, avgSpeed, avgPowerW !== undefined),
    gpsPoints: points,
    gpsPointsCount: points.length,
    hasGps: points.length > 0,
    hasHr: hrValues.length > 0,
    hasPower: powerValues.length > 0,
    hasCadence: cadenceValues.length > 0,
    title,
  }
}

/**
 * Calculate distance and elevation from GPS points
 */
function calculateMetrics(points: GpsPoint[]): {
  distanceM: number
  elevGainM: number
  durationSec: number
  startAt: Date
} {
  if (points.length === 0) {
    return { distanceM: 0, elevGainM: 0, durationSec: 0, startAt: new Date() }
  }

  let distanceM = 0
  let elevGainM = 0

  for (let i = 1; i < points.length; i++) {
    // Distance using Haversine formula
    distanceM += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon
    )

    // Elevation gain (only positive changes)
    if (points[i].elevation && points[i - 1].elevation) {
      const elevDiff = points[i].elevation! - points[i - 1].elevation!
      if (elevDiff > 0) {
        elevGainM += elevDiff
      }
    }
  }

  // Duration from timestamps
  const startAt = points[0].time || new Date()
  const endTime = points[points.length - 1].time || startAt
  const durationSec = Math.round((endTime.getTime() - startAt.getTime()) / 1000)

  return { distanceM, elevGainM, durationSec, startAt }
}

/**
 * Haversine formula for distance between two GPS points
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
