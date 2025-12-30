import { prisma } from "@/lib/db"
import { AnomalyType } from "@prisma/client"

/**
 * Sport-specific thresholds for anomaly detection
 * All values are "impossible" or "highly suspicious" levels
 */
const THRESHOLDS = {
  // Running: world record marathon pace is ~2:55/km (~175 sec/km)
  // Sub-3:00/km sustained is suspicious for non-elite
  running: {
    minPaceSecPerKm: 150, // <2:30/km is impossible for humans
    maxSpeedKmh: 45,      // >45 km/h is impossible on foot
    maxDistanceKm: 250,   // Ultra marathons can be 200km+, but 250 is rare
    minDurationForDistanceCheck: 300, // 5 min minimum for pace checks
  },
  // Cycling: Tour de France average ~45 km/h on flats
  // Sustained >50 km/h without downhill is suspicious
  cycling: {
    maxSpeedKmh: 80,     // >80 km/h sustained is impossible without motor
    maxDistanceKm: 400,   // Very long rides exist but 400+ is rare
    minPaceSecPerKm: 45,  // <45s/km (~80 km/h) is motor territory
  },
  // Swimming: World record 50m is ~21s (~1:24/100m pace)
  // <1:00/100m sustained is Olympic level
  swimming: {
    minPaceSecPer100m: 50, // <50s/100m is impossible for non-elite
    maxSpeedKmh: 8,        // ~7.5 km/h is world record pace
    maxDistanceKm: 50,     // Open water swims can be long
  },
  // Default fallback for other sports
  default: {
    maxSpeedKmh: 100,
    maxDistanceKm: 500,
  },
}

type AnomalyResult = {
  type: AnomalyType
  severity: number // 0-100
  message: string
}

type ActivityData = {
  id: string
  userId: string
  durationSeconds?: number | null
  distanceMeters?: number | null
  avgPace?: number | null
  avgSpeed?: number | null
  gpsRoute?: string | null
  sportSlug?: string | null
}

/**
 * Check an activity for anomalies
 * Returns array of detected anomalies with severity scores
 */
export function detectAnomalies(activity: ActivityData): AnomalyResult[] {
  const anomalies: AnomalyResult[] = []
  const sport = activity.sportSlug?.toLowerCase() ?? "default"
  const thresholds =
    THRESHOLDS[sport as keyof typeof THRESHOLDS] ?? THRESHOLDS.default

  const durationSec = activity.durationSeconds ?? 0
  const distanceM = activity.distanceMeters ?? 0
  const distanceKm = distanceM / 1000

  // Calculate derived metrics if not provided
  let speedKmh = activity.avgSpeed
  let paceSecPerKm = activity.avgPace

  if (!speedKmh && distanceM > 0 && durationSec > 0) {
    speedKmh = (distanceKm / durationSec) * 3600
  }
  if (!paceSecPerKm && distanceM > 0 && durationSec > 0) {
    paceSecPerKm = durationSec / distanceKm
  }

  // --- IMPOSSIBLE_PACE checks ---
  if (sport === "running" && paceSecPerKm && paceSecPerKm > 0) {
    const runThresholds = THRESHOLDS.running
    if (
      paceSecPerKm < runThresholds.minPaceSecPerKm &&
      durationSec >= runThresholds.minDurationForDistanceCheck
    ) {
      const paceMinPerKm = paceSecPerKm / 60
      anomalies.push({
        type: "IMPOSSIBLE_PACE",
        severity: Math.min(100, 50 + (runThresholds.minPaceSecPerKm - paceSecPerKm)),
        message: `Running pace of ${paceMinPerKm.toFixed(2)} min/km is faster than world record level`,
      })
    }
  }

  if (sport === "swimming" && paceSecPerKm && distanceM >= 100) {
    // Convert to per 100m
    const paceSecPer100m = (paceSecPerKm / 1000) * 100
    const swimThresholds = THRESHOLDS.swimming
    if (paceSecPer100m < swimThresholds.minPaceSecPer100m) {
      anomalies.push({
        type: "IMPOSSIBLE_PACE",
        severity: Math.min(100, 50 + (swimThresholds.minPaceSecPer100m - paceSecPer100m) * 2),
        message: `Swimming pace of ${paceSecPer100m.toFixed(0)}s/100m exceeds Olympic level`,
      })
    }
  }

  // --- IMPOSSIBLE_SPEED checks ---
  if (speedKmh && speedKmh > 0) {
    const maxSpeed = "maxSpeedKmh" in thresholds ? thresholds.maxSpeedKmh : 100
    if (speedKmh > maxSpeed) {
      anomalies.push({
        type: "IMPOSSIBLE_SPEED",
        severity: Math.min(100, 50 + (speedKmh - maxSpeed)),
        message: `Average speed of ${speedKmh.toFixed(1)} km/h exceeds physical limits for ${sport}`,
      })
    }
  }

  // --- EXCESSIVE_DISTANCE checks (>500km is suspicious) ---
  // Using IMPOSSIBLE_DISTANCE from schema
  if (distanceKm > 500) {
    anomalies.push({
      type: "IMPOSSIBLE_DISTANCE",
      severity: Math.min(100, 30 + Math.floor((distanceKm - 500) / 50)),
      message: `Activity distance of ${distanceKm.toFixed(0)} km seems impossibly long`,
    })
  }

  // --- GPS_TELEPORT checks ---
  // This would require parsing GPS data which is stored as JSON string
  if (activity.gpsRoute) {
    try {
      const route = JSON.parse(activity.gpsRoute)
      const teleportResult = checkGpsTeleport(route)
      if (teleportResult) {
        anomalies.push(teleportResult)
      }
    } catch {
      // Invalid GPS data, ignore
    }
  }

  return anomalies
}

type GpsPoint = {
  lat: number
  lng: number
  timestamp?: number
}

/**
 * Check GPS route for teleportation (impossible jumps)
 */
function checkGpsTeleport(route: GpsPoint[]): AnomalyResult | null {
  if (!Array.isArray(route) || route.length < 2) return null

  // Check consecutive points for impossible jumps
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1]
    const curr = route[i]

    if (!prev.lat || !prev.lng || !curr.lat || !curr.lng) continue

    const distanceKm = haversineDistance(prev, curr)
    const timeDiffSec =
      prev.timestamp && curr.timestamp
        ? (curr.timestamp - prev.timestamp) / 1000
        : 10 // Assume 10s if no timestamp

    if (timeDiffSec > 0) {
      const speedKmh = (distanceKm / timeDiffSec) * 3600

      // >200 km/h between GPS points is teleportation
      if (speedKmh > 200) {
        return {
          type: "GPS_JUMP",
          severity: Math.min(100, 60 + (speedKmh - 200) / 10),
          message: `GPS shows ${Math.floor(speedKmh)} km/h movement between points (likely GPS error or tampering)`,
        }
      }
    }
  }

  return null
}

/**
 * Haversine formula for distance between two GPS points
 */
function haversineDistance(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Check an activity and persist any anomalies found
 * Updates activity.isAnomalous and activity.anomalyScore
 */
export async function checkActivityAnomalies(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      discipline: {
        include: { sport: true },
      },
    },
  })

  if (!activity) return null

  const sportSlug =
    activity.discipline?.sport?.slug ?? activity.discipline?.slug ?? null

  const anomalies = detectAnomalies({
    id: activity.id,
    userId: activity.userId,
    durationSeconds: activity.durationSeconds,
    distanceMeters: activity.distanceMeters,
    avgPace: activity.avgPace,
    avgSpeed: activity.avgSpeed,
    gpsRoute: activity.gpsRoute,
    sportSlug,
  })

  if (anomalies.length === 0) {
    // Clear any previous flags
    if (activity.isAnomalous) {
      await prisma.activity.update({
        where: { id: activityId },
        data: { isAnomalous: false, anomalyScore: null },
      })
    }
    return { anomalies: [], score: 0 }
  }

  // Calculate overall score (max of individual severities)
  const score = Math.max(...anomalies.map((a) => a.severity))

  // Persist anomalies
  await prisma.$transaction([
    // Update activity flags
    prisma.activity.update({
      where: { id: activityId },
      data: {
        isAnomalous: true,
        anomalyScore: score,
      },
    }),
    // Delete old anomalies for this activity
    prisma.activityAnomaly.deleteMany({
      where: { activityId },
    }),
    // Create new anomaly records
    ...anomalies.map((a) =>
      prisma.activityAnomaly.create({
        data: {
          activityId,
          userId: activity.userId,
          type: a.type,
          severity: a.severity,
          message: a.message,
        },
      })
    ),
  ])

  return { anomalies, score }
}

/**
 * Get verification tier weight multiplier
 */
export function getVerificationWeight(tier: "BRONZE" | "SILVER" | "GOLD"): number {
  switch (tier) {
    case "BRONZE":
      return 0.6
    case "SILVER":
      return 0.8
    case "GOLD":
      return 1.0
    default:
      return 0.6
  }
}
