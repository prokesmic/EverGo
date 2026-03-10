import { prisma } from "@/lib/db"
import { parseGpsRoute } from "@/lib/activity/route"

type TimeWindow = "early" | "morning" | "midday" | "evening" | "night"
type Terrain = "flat" | "rolling" | "hilly" | "mixed"

export interface RouteSuggestion {
  id: string
  title: string
  sport: string
  distanceKm: number
  elevationGain: number
  terrain: Terrain
  crowdHeat: number
  safetyScore: number
  popularityScore: number
  recommendedWindows: TimeWindow[]
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
    const hour = activity.activityDate.getHours()

    const existing = grouped.get(key)
    if (!existing) {
      grouped.set(key, {
        id: key,
        title: activity.title || `${resolvedSport} Route`,
        sport: resolvedSport,
        distanceKm: round(distanceKm, 1),
        elevationGain: elevation,
        terrain: inferredTerrain,
        crowdHeat: 1,
        safetyScore: inferSafety(hour),
        popularityScore: 10,
        recommendedWindows: [],
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
