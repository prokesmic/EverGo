export interface RoutePoint {
  lat: number
  lng: number
  elevation?: number | null
}

export interface SplitSegment {
  label: string
  distanceKm: number
  splitSeconds: number
  cumulativeSeconds: number
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function normalizePoint(point: unknown): RoutePoint | null {
  if (!point || typeof point !== "object") return null

  const p = point as Record<string, unknown>
  const lat = toNumber(p.lat ?? p.latitude)
  const lng = toNumber(p.lng ?? p.lon ?? p.longitude)
  const elevation = toNumber(p.ele ?? p.elevation ?? p.altitude ?? p.alt)

  if (lat === null || lng === null) return null

  return {
    lat,
    lng,
    elevation,
  }
}

function decodePolyline(encoded: string): RoutePoint[] {
  const points: RoutePoint[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte: number

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index < encoded.length)

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lat += deltaLat

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index < encoded.length)

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    lng += deltaLng

    points.push({
      lat: lat / 1e5,
      lng: lng / 1e5,
    })
  }

  return points
}

export function parseGpsRoute(gpsRoute: string | null | undefined): RoutePoint[] {
  if (!gpsRoute || !gpsRoute.trim()) return []

  const raw = gpsRoute.trim()

  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw)

      if (Array.isArray(parsed)) {
        return parsed.map(normalizePoint).filter((point): point is RoutePoint => point !== null)
      }

      if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>
        const points = obj.points
        if (Array.isArray(points)) {
          return points.map(normalizePoint).filter((point): point is RoutePoint => point !== null)
        }
      }
    } catch {
      return []
    }
  }

  try {
    return decodePolyline(raw)
  } catch {
    return []
  }
}

export function parseStartLocation(startLocation: string | null | undefined): RoutePoint | null {
  if (!startLocation || !startLocation.trim()) return null

  const raw = startLocation.trim()
  if (!raw.startsWith("{") && !raw.startsWith("[")) return null

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 2) {
      const lat = toNumber(parsed[0])
      const lng = toNumber(parsed[1])
      if (lat === null || lng === null) return null
      return { lat, lng }
    }
    return normalizePoint(parsed)
  } catch {
    return null
  }
}

export function toLeafletPath(points: RoutePoint[]): [number, number][] {
  return points.map((point) => [point.lat, point.lng])
}

export function getMapCenter(
  path: [number, number][],
  fallbackPoint?: RoutePoint | null
): [number, number] {
  if (path.length > 0) return path[Math.floor(path.length / 2)]
  if (fallbackPoint) return [fallbackPoint.lat, fallbackPoint.lng]
  return [50.0755, 14.4378]
}

export function buildElevationProfile(points: RoutePoint[], maxSamples = 64): number[] {
  const values = points
    .map((point) => point.elevation)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))

  if (values.length < 2) return []
  if (values.length <= maxSamples) return values

  const step = (values.length - 1) / (maxSamples - 1)
  const sampled: number[] = []
  for (let i = 0; i < maxSamples; i += 1) {
    sampled.push(values[Math.round(i * step)])
  }
  return sampled
}

export function buildEstimatedSplits(
  distanceMeters: number | null | undefined,
  durationSeconds: number | null | undefined,
  maxSplits = 20
): SplitSegment[] {
  if (!distanceMeters || !durationSeconds) return []
  if (distanceMeters <= 0 || durationSeconds <= 0) return []

  const totalKm = distanceMeters / 1000
  if (totalKm < 0.2) return []

  const paceSecPerKm = durationSeconds / totalKm
  let remainingKm = totalKm
  let cumulative = 0
  const splits: SplitSegment[] = []
  let index = 1

  while (remainingKm > 0.001 && splits.length < maxSplits) {
    const segmentKm = Math.min(1, remainingKm)
    const splitSeconds = paceSecPerKm * segmentKm
    cumulative += splitSeconds

    splits.push({
      label: segmentKm === 1 ? `${index} km` : `Last ${segmentKm.toFixed(2)} km`,
      distanceKm: segmentKm,
      splitSeconds,
      cumulativeSeconds: cumulative,
    })

    remainingKm -= segmentKm
    index += 1
  }

  return splits
}
