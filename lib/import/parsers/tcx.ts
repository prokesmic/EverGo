/**
 * TCX Parser
 *
 * Parses TCX (Training Center XML) files into normalized activity data.
 * TCX is Garmin's proprietary XML format for fitness data.
 */

import { ActivityNormalized, GpsPoint, guessSportSlug } from "../types"

/**
 * Parse TCX XML string into normalized activity
 */
export function parseTcx(content: string): ActivityNormalized {
  const points: GpsPoint[] = []

  // Extract trackpoints
  const tpRegex = /<Trackpoint>([\s\S]*?)<\/Trackpoint>/g
  let match

  while ((match = tpRegex.exec(content)) !== null) {
    const tpContent = match[1]

    // Extract position
    const latMatch = /<LatitudeDegrees>([^<]+)<\/LatitudeDegrees>/.exec(tpContent)
    const lonMatch = /<LongitudeDegrees>([^<]+)<\/LongitudeDegrees>/.exec(tpContent)

    if (!latMatch || !lonMatch) continue

    const point: GpsPoint = {
      lat: parseFloat(latMatch[1]),
      lon: parseFloat(lonMatch[1]),
    }

    // Extract altitude
    const altMatch = /<AltitudeMeters>([^<]+)<\/AltitudeMeters>/.exec(tpContent)
    if (altMatch) {
      point.elevation = parseFloat(altMatch[1])
    }

    // Extract time
    const timeMatch = /<Time>([^<]+)<\/Time>/.exec(tpContent)
    if (timeMatch) {
      point.time = new Date(timeMatch[1])
    }

    // Extract heart rate
    const hrMatch = /<HeartRateBpm[^>]*>[\s\S]*?<Value>([^<]+)<\/Value>/.exec(
      tpContent
    )
    if (hrMatch) {
      point.hr = parseInt(hrMatch[1], 10)
    }

    // Extract cadence
    const cadMatch = /<Cadence>([^<]+)<\/Cadence>/.exec(tpContent)
    if (cadMatch) {
      point.cadence = parseInt(cadMatch[1], 10)
    }

    // Extract power from extensions
    const powerMatch = /<(?:ns3:)?Watts>([^<]+)<\/(?:ns3:)?Watts>/.exec(tpContent)
    if (powerMatch) {
      point.power = parseInt(powerMatch[1], 10)
    }

    points.push(point)
  }

  // Calculate metrics from points
  const { distanceM, elevGainM, durationSec, startAt } = calculateMetrics(points)

  // Try to get distance from TCX summary (more accurate)
  const distMatch = /<DistanceMeters>([^<]+)<\/DistanceMeters>/.exec(content)
  const tcxDistanceM = distMatch ? parseFloat(distMatch[1]) : distanceM

  // Try to get total time from TCX summary
  const timeMatch = /<TotalTimeSeconds>([^<]+)<\/TotalTimeSeconds>/.exec(content)
  const tcxDurationSec = timeMatch ? parseFloat(timeMatch[1]) : durationSec

  // Try to get calories
  const calMatch = /<Calories>([^<]+)<\/Calories>/.exec(content)
  const calories = calMatch ? parseInt(calMatch[1], 10) : undefined

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
  const finalDistance = tcxDistanceM || distanceM
  const finalDuration = tcxDurationSec || durationSec
  const avgSpeed = finalDuration > 0 ? (finalDistance / 1000 / (finalDuration / 3600)) : 0
  const avgPace = finalDistance > 0 ? (finalDuration / (finalDistance / 1000)) : 0

  // Try to detect sport from TCX
  const sportMatch = /<Activity Sport="([^"]+)"/.exec(content)
  let sportSlugGuess = "running"
  if (sportMatch) {
    const tcxSport = sportMatch[1].toLowerCase()
    if (tcxSport.includes("biking") || tcxSport.includes("cycling")) {
      sportSlugGuess = "cycling"
    } else if (tcxSport.includes("running")) {
      sportSlugGuess = "running"
    } else if (tcxSport.includes("walking")) {
      sportSlugGuess = "walking"
    } else if (tcxSport.includes("swimming")) {
      sportSlugGuess = "swimming"
    }
  } else {
    sportSlugGuess = guessSportSlug(finalDistance, finalDuration, avgSpeed, avgPowerW !== undefined)
  }

  return {
    startAt,
    durationSec: finalDuration,
    distanceM: finalDistance,
    elevGainM,
    avgHr,
    maxHr,
    avgPowerW,
    maxPowerW,
    avgCadence,
    avgSpeed,
    avgPace,
    sportSlugGuess,
    gpsPoints: points,
    gpsPointsCount: points.length,
    hasGps: points.length > 0,
    hasHr: hrValues.length > 0,
    hasPower: powerValues.length > 0,
    hasCadence: cadenceValues.length > 0,
    calories,
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
    distanceM += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon
    )

    if (points[i].elevation && points[i - 1].elevation) {
      const elevDiff = points[i].elevation! - points[i - 1].elevation!
      if (elevDiff > 0) {
        elevGainM += elevDiff
      }
    }
  }

  const startAt = points[0].time || new Date()
  const endTime = points[points.length - 1].time || startAt
  const durationSec = Math.round((endTime.getTime() - startAt.getTime()) / 1000)

  return { distanceM, elevGainM, durationSec, startAt }
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000
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
