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

  // Auto-enroll in current season if this is a new activity
  if (isNew) {
    try {
      const { enrollOnFirstActivity } = await import("@/lib/season")
      await enrollOnFirstActivity(userId, new Date(stravaActivity.start_date))
    } catch (e) {
      console.error("[Strava Import] Season enrollment failed:", e)
    }
  }

  // Update user's Strava connection last sync time
  await prisma.stravaConnection.update({
    where: { userId },
    data: { lastSyncAt: new Date() },
  })

  return { activityId, isNew, benchmarkCount }
}

/**
 * Compute benchmark results (deprecated in V6)
 */
async function computeActivityBenchmarks(
  _activityId: string,
  _userId: string,
  _sportId: string,
  _stravaActivity: StravaActivity
): Promise<number> {
  // Benchmarks removed in V6
  return 0
}

// Benchmark functions removed in V6

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
