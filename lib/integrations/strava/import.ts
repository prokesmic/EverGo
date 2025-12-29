/**
 * Strava Activity Import Logic
 * Converts Strava activities to EverGo activities with benchmark computation
 */
import { prisma } from "@/lib/db"
import type { StravaActivity } from "./types"
import { mapStravaTypeToSport, mapStravaVisibility } from "./sportMap"

const ACTIVITY_SOURCE = "IMPORT_STRAVA"

interface ImportResult {
  activityId: string
  isNew: boolean
  benchmarkCount: number
}

/**
 * Import a single Strava activity into EverGo
 */
export async function importStravaActivity(
  userId: string,
  stravaActivity: StravaActivity
): Promise<ImportResult> {
  const externalId = stravaActivity.id.toString()

  // Check if activity already exists
  const existing = await prisma.activity.findFirst({
    where: {
      source: ACTIVITY_SOURCE,
      externalId,
    },
  })

  // Map Strava type to EverGo sport
  const sportSlug = mapStravaTypeToSport(stravaActivity.type, stravaActivity.sport_type)
  const sport = await prisma.sport.findUnique({
    where: { slug: sportSlug },
    include: { disciplines: true },
  })

  if (!sport) {
    console.warn(`[Strava Import] Sport not found for slug: ${sportSlug}, using default`)
    // Try to find a generic fitness sport
    const fallbackSport = await prisma.sport.findFirst({
      where: { slug: "fitness" },
      include: { disciplines: true },
    })
    if (!fallbackSport) {
      throw new Error(`No sport found for Strava type: ${stravaActivity.type}`)
    }
  }

  const targetSport = sport || (await prisma.sport.findFirstOrThrow({
    where: { slug: "fitness" },
    include: { disciplines: true },
  }))

  // Use the first discipline as default (or create a general one)
  let disciplineId = targetSport.disciplines[0]?.id

  if (!disciplineId) {
    // Create a default discipline for this sport
    const newDiscipline = await prisma.discipline.create({
      data: {
        sportId: targetSport.id,
        name: "General",
        slug: "general",
        measurementType: "TIME",
        primaryMetric: "duration",
        rankingFormula: "duration",
        lowerIsBetter: true,
      },
    })
    disciplineId = newDiscipline.id
  }

  // Map visibility
  const visibility = mapStravaVisibility(stravaActivity.visibility)

  // Convert speeds from m/s to km/h
  const avgSpeedKmh = stravaActivity.average_speed * 3.6
  const maxSpeedKmh = stravaActivity.max_speed * 3.6

  // Calculate pace (min/km) from speed
  const avgPaceSecPerKm = avgSpeedKmh > 0 ? 3600 / avgSpeedKmh : null

  // Prepare activity data
  const activityData = {
    userId,
    sportId: targetSport.id,
    disciplineId,
    title: stravaActivity.name,
    description: stravaActivity.description,
    activityDate: new Date(stravaActivity.start_date),
    durationSeconds: stravaActivity.moving_time,
    distanceMeters: stravaActivity.distance,
    elevationGain: stravaActivity.total_elevation_gain,
    caloriesBurned: stravaActivity.calories ? Math.round(stravaActivity.calories) : null,
    avgHeartRate: stravaActivity.average_heartrate ? Math.round(stravaActivity.average_heartrate) : null,
    maxHeartRate: stravaActivity.max_heartrate ? Math.round(stravaActivity.max_heartrate) : null,
    avgPace: avgPaceSecPerKm,
    avgSpeed: avgSpeedKmh,
    primaryValue: stravaActivity.moving_time, // Use duration as primary value
    score: null,
    gpsRoute: stravaActivity.map?.polyline || stravaActivity.map?.summary_polyline || null,
    startLocation: stravaActivity.start_latlng
      ? JSON.stringify({ lat: stravaActivity.start_latlng[0], lng: stravaActivity.start_latlng[1] })
      : null,
    mapImageUrl: null,
    photos: "[]",
    source: ACTIVITY_SOURCE,
    externalId,
    raw: JSON.stringify(stravaActivity),
    isHidden: stravaActivity.visibility === "only_me" || stravaActivity.private,
    weatherConditions: null,
    visibility,
  }

  let activityId: string
  let isNew: boolean

  if (existing) {
    // Update existing activity
    const updated = await prisma.activity.update({
      where: { id: existing.id },
      data: activityData,
    })
    activityId = updated.id
    isNew = false
    console.log(`[Strava Import] Updated activity: ${activityId}`)
  } else {
    // Create new activity
    const created = await prisma.activity.create({
      data: activityData,
    })
    activityId = created.id
    isNew = true
    console.log(`[Strava Import] Created activity: ${activityId}`)
  }

  // Compute and store benchmark results
  const benchmarkCount = await computeActivityBenchmarks(activityId, userId, targetSport.id, stravaActivity)

  // Update user's Strava connection last sync time
  await prisma.stravaConnection.update({
    where: { userId },
    data: { lastSyncAt: new Date() },
  })

  return { activityId, isNew, benchmarkCount }
}

/**
 * Compute benchmark results for an imported activity
 */
async function computeActivityBenchmarks(
  activityId: string,
  userId: string,
  sportId: string,
  stravaActivity: StravaActivity
): Promise<number> {
  // Get all active benchmarks for this sport
  const benchmarks = await prisma.benchmarkDefinition.findMany({
    where: { sportId, isActive: true },
  })

  let count = 0

  for (const benchmark of benchmarks) {
    let value: number | null = null
    const targetJson = benchmark.targetJson as Record<string, unknown> | null

    switch (benchmark.measurementType) {
      case "TIME":
        // For time benchmarks, check if this activity matches the target distance
        if (targetJson?.distanceMeters && stravaActivity.distance) {
          const targetDistance = targetJson.distanceMeters as number
          const tolerance = targetDistance * 0.05 // 5% tolerance

          if (Math.abs(stravaActivity.distance - targetDistance) <= tolerance) {
            value = stravaActivity.moving_time
          }
        } else if (!targetJson?.distanceMeters) {
          // General time benchmark
          value = stravaActivity.moving_time
        }
        break

      case "DISTANCE":
        value = stravaActivity.distance
        break

      case "SPEED":
        value = stravaActivity.average_speed * 3.6 // Convert m/s to km/h
        break

      case "POWER":
        if (stravaActivity.weighted_average_watts) {
          value = stravaActivity.weighted_average_watts
        } else if (stravaActivity.average_watts) {
          value = stravaActivity.average_watts
        }
        break

      default:
        continue
    }

    if (value === null || value <= 0) continue

    // Upsert the benchmark result
    await prisma.activityBenchmarkResult.upsert({
      where: {
        activityId_benchmarkId: {
          activityId,
          benchmarkId: benchmark.id,
        },
      },
      create: {
        activityId,
        benchmarkId: benchmark.id,
        value,
        source: "AUTO",
        isPersonalBest: false,
        countsForRanking: true,
      },
      update: {
        value,
        computedAt: new Date(),
      },
    })

    count++

    // Check if this is a new PB
    await checkAndUpdatePB(userId, benchmark.id, value, benchmark.higherIsBetter, new Date(stravaActivity.start_date))
  }

  return count
}

/**
 * Check if value is a new PB and update if so
 */
async function checkAndUpdatePB(
  userId: string,
  benchmarkId: string,
  value: number,
  higherIsBetter: boolean,
  achievedAt: Date
): Promise<boolean> {
  const existingPB = await prisma.userBenchmarkBest.findUnique({
    where: {
      userId_benchmarkId: {
        userId,
        benchmarkId,
      },
    },
  })

  const isBetter = !existingPB ||
    (higherIsBetter ? value > existingPB.value : value < existingPB.value)

  if (isBetter) {
    await prisma.userBenchmarkBest.upsert({
      where: {
        userId_benchmarkId: {
          userId,
          benchmarkId,
        },
      },
      create: {
        userId,
        benchmarkId,
        value,
        achievedAt,
        source: "IMPORT_STRAVA",
        verificationStatus: "VERIFIED_IMPORT",
        isLegacy: false,
      },
      update: {
        value,
        achievedAt,
        source: "IMPORT_STRAVA",
        verificationStatus: "VERIFIED_IMPORT",
        updatedAt: new Date(),
      },
    })

    console.log(`[Strava Import] New PB for benchmark ${benchmarkId}: ${value}`)
    return true
  }

  return false
}

/**
 * Mark an activity as hidden (for delete events)
 */
export async function hideStravaActivity(externalId: string): Promise<void> {
  await prisma.activity.updateMany({
    where: {
      source: ACTIVITY_SOURCE,
      externalId,
    },
    data: {
      isHidden: true,
      updatedAt: new Date(),
    },
  })
}

/**
 * Permanently delete a Strava activity
 */
export async function deleteStravaActivity(externalId: string): Promise<void> {
  await prisma.activity.deleteMany({
    where: {
      source: ACTIVITY_SOURCE,
      externalId,
    },
  })
}
