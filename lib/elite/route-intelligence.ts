import { prisma } from "@/lib/db"
import { parseGpsRoute } from "@/lib/activity/route"
import type { TimeWindow } from "@/lib/personalization/profile"

type Terrain = "flat" | "rolling" | "hilly" | "mixed"
type Surface = "road" | "trail" | "mixed"
type RouteIntent = "speed" | "endurance" | "recovery"

export interface RouteSuggestion {
  id: string
  title: string
  sport: string
  distanceKm: number
  elevationGain: number
  terrain: Terrain
  surface: Surface
  intent: RouteIntent
  crowdHeat: number
  safetyScore: number
  popularityScore: number
  recommendedWindows: TimeWindow[]
  conditions: string[]
  previewPath: string | null
  center: { lat: number; lng: number } | null
}

interface RouteOptions {
  userId: string
  sportSlug?: string
  timeWindow?: TimeWindow
  terrain?: Terrain
  limit?: number
}

export async function getRouteSuggestions(options: RouteOptions): Promise<RouteSuggestion[]> {
  const { userId, sportSlug, timeWindow, terrain, limit = 10 } = options

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { city: true, country: true },
  })

  const activities = await prisma.activity.findMany({
    where: {
      visibility: "PUBLIC",
      gpsRoute: { not: null },
      user: {
        ...(me?.city ? { city: me.city } : {}),
        ...(me?.country ? { country: me.country } : {}),
      },
      ...(sportSlug
        ? {
            OR: [
              { sport: { slug: sportSlug } },
              { discipline: { sport: { slug: sportSlug } } },
            ],
          }
        : {}),
    },
    include: {
      sport: { select: { name: true, slug: true } },
      discipline: { include: { sport: { select: { name: true, slug: true } } } },
      user: { select: { city: true } },
    },
    orderBy: { activityDate: "desc" },
    take: 300,
  })

  const grouped = new Map<string, RouteSuggestion & { sampleHours: number[]; sampleCount: number }>()

  for (const activity of activities) {
    const points = parseGpsRoute(activity.gpsRoute)
    if (points.length < 4) continue

    const first = points[0]
    const key = `${round(first.lat, 2)}:${round(first.lng, 2)}:${activity.sportId ?? "na"}`
    const resolvedSport = activity.sport?.name ?? activity.discipline?.sport?.name ?? "Activity"
    const elevation = Math.max(0, Math.round(activity.elevationGain ?? 0))
    const distanceKm = (activity.distanceMeters ?? 0) / 1000
    const inferredTerrain = inferTerrain(distanceKm, elevation)
    const surface = inferSurface(inferredTerrain)
    const intent = inferIntent(distanceKm, inferredTerrain)
    const hour = activity.activityDate.getHours()
    const previewPath = buildPreviewPath(points)

    const existing = grouped.get(key)
    if (!existing) {
      grouped.set(key, {
        id: key,
        title: activity.title || `${resolvedSport} Route`,
        sport: resolvedSport,
        distanceKm: round(distanceKm, 1),
        elevationGain: elevation,
        terrain: inferredTerrain,
        surface,
        intent,
        crowdHeat: 1,
        safetyScore: inferSafety(hour),
        popularityScore: 10,
        recommendedWindows: [],
        conditions: [],
        previewPath,
        center: { lat: round(first.lat, 4), lng: round(first.lng, 4) },
        sampleHours: [hour],
        sampleCount: 1,
      })
      continue
    }

    existing.distanceKm = round((existing.distanceKm * existing.sampleCount + distanceKm) / (existing.sampleCount + 1), 1)
    existing.elevationGain = Math.round(
      (existing.elevationGain * existing.sampleCount + elevation) / (existing.sampleCount + 1)
    )
    existing.crowdHeat += 1
    existing.popularityScore += 7
    existing.safetyScore = Math.round((existing.safetyScore + inferSafety(hour)) / 2)
    existing.sampleHours.push(hour)
    existing.sampleCount += 1
    if (existing.title.length < (activity.title?.length ?? 0)) {
      existing.title = activity.title
    }
  }

  const all = [...grouped.values()].map((item) => ({
    ...item,
    recommendedWindows: inferWindows(item.sampleHours),
    crowdHeat: clamp(item.crowdHeat, 1, 100),
    popularityScore: clamp(item.popularityScore, 10, 99),
    conditions: inferConditions(item.sampleHours),
  }))

  return all
    .filter((item) => (terrain ? item.terrain === terrain : true))
    .filter((item) => (timeWindow ? item.recommendedWindows.includes(timeWindow) : true))
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit)
}

function inferTerrain(distanceKm: number, elevationGain: number): Terrain {
  if (distanceKm <= 0) return "mixed"
  const gainPerKm = elevationGain / distanceKm
  if (gainPerKm < 15) return "flat"
  if (gainPerKm < 40) return "rolling"
  if (gainPerKm > 65) return "hilly"
  return "mixed"
}

function inferSurface(terrain: Terrain): Surface {
  if (terrain === "hilly") return "trail"
  if (terrain === "rolling") return "mixed"
  return "road"
}

function inferIntent(distanceKm: number, terrain: Terrain): RouteIntent {
  if (distanceKm < 5) return "speed"
  if (terrain === "hilly") return "endurance"
  if (distanceKm > 15) return "endurance"
  return "recovery"
}

function inferSafety(hour: number) {
  if (hour >= 6 && hour <= 9) return 86
  if (hour >= 10 && hour <= 16) return 80
  if (hour >= 17 && hour <= 21) return 78
  return 62
}

function inferWindows(hours: number[]): TimeWindow[] {
  const counts: Record<TimeWindow, number> = {
    early: 0,
    morning: 0,
    midday: 0,
    evening: 0,
    night: 0,
  }
  for (const hour of hours) {
    counts[toWindow(hour)] += 1
  }
  return (Object.entries(counts) as Array<[TimeWindow, number]>)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 0)
    .slice(0, 2)
    .map(([window]) => window)
}

function inferConditions(hours: number[]): string[] {
  const windows = inferWindows(hours)
  const conditions: string[] = []
  if (windows.includes("early") || windows.includes("morning")) {
    conditions.push("Cooler temps")
    conditions.push("Low traffic")
  }
  if (windows.includes("evening")) {
    conditions.push("Golden-hour visibility")
  }
  if (windows.includes("night")) {
    conditions.push("High-visibility gear recommended")
  }
  return conditions.slice(0, 3)
}

function buildPreviewPath(points: Array<{ lat: number; lng: number }>) {
  if (points.length < 4) return null
  const sample = points.slice(0, 60)
  const lats = sample.map((p) => p.lat)
  const lngs = sample.map((p) => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const width = 120
  const height = 70
  const latSpan = Math.max(0.0001, maxLat - minLat)
  const lngSpan = Math.max(0.0001, maxLng - minLng)

  return sample
    .map((point, index) => {
      const x = ((point.lng - minLng) / lngSpan) * width
      const y = height - ((point.lat - minLat) / latSpan) * height
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

function toWindow(hour: number): TimeWindow {
  if (hour < 6) return "early"
  if (hour < 11) return "morning"
  if (hour < 16) return "midday"
  if (hour < 21) return "evening"
  return "night"
}

function round(value: number, precision = 0) {
  const p = 10 ** precision
  return Math.round(value * p) / p
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
