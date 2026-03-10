import { prisma } from "@/lib/db"

export type TimeWindow = "early" | "morning" | "midday" | "evening" | "night"

export interface PersonalizationProfile {
  baselineWeeklyMinutes: number
  baselineWeeklySessions: number
  typicalSessionMinutes: number
  preferredWindow: TimeWindow
  loadTolerance: "LOW" | "MEDIUM" | "HIGH"
  primarySportSlug: string | null
  lastActivityAt: Date | null
}

export async function getPersonalizationProfile(userId: string): Promise<PersonalizationProfile> {
  const now = new Date()
  const lookback = new Date(now)
  lookback.setDate(now.getDate() - 28)

  const [activities, streak, primarySport] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, activityDate: { gte: lookback } },
      select: { activityDate: true, durationSeconds: true },
      orderBy: { activityDate: "desc" },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: { lastActivityDate: true },
    }),
    prisma.userSport.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { priority: "asc" },
      select: { sport: { select: { slug: true } } },
    }),
  ])

  const totalMinutes = activities.reduce((sum, item) => sum + ((item.durationSeconds ?? 0) / 60), 0)
  const baselineWeeklyMinutes = Math.round(totalMinutes / 4)
  const baselineWeeklySessions = Math.round(activities.length / 4)
  const typicalSessionMinutes =
    activities.length > 0 ? Math.round(totalMinutes / activities.length) : 45

  const preferredWindow = inferPreferredWindow(activities.map((item) => item.activityDate.getHours()))
  const loadTolerance =
    baselineWeeklyMinutes < 150 ? "LOW" : baselineWeeklyMinutes < 280 ? "MEDIUM" : "HIGH"

  return {
    baselineWeeklyMinutes,
    baselineWeeklySessions,
    typicalSessionMinutes,
    preferredWindow,
    loadTolerance,
    primarySportSlug: primarySport?.sport?.slug ?? null,
    lastActivityAt: streak?.lastActivityDate ?? null,
  }
}

function inferPreferredWindow(hours: number[]): TimeWindow {
  if (hours.length === 0) return "morning"
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
  return (Object.entries(counts) as Array<[TimeWindow, number]>).sort((a, b) => b[1] - a[1])[0][0]
}

function toWindow(hour: number): TimeWindow {
  if (hour < 6) return "early"
  if (hour < 11) return "morning"
  if (hour < 16) return "midday"
  if (hour < 21) return "evening"
  return "night"
}
