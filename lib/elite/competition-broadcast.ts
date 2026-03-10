import { prisma } from "@/lib/db"
import { getLiveCompetition } from "@/lib/elite/competition-live"

export interface BroadcastItem {
  id: string
  type: "SWING" | "MOMENTUM" | "MILESTONE"
  headline: string
  detail: string
  severity: "INFO" | "IMPORTANT" | "CRITICAL"
  timestamp: string
}

export interface CompetitionBroadcast {
  updatedAt: string
  items: BroadcastItem[]
}

export async function getCompetitionBroadcast(userId: string): Promise<CompetitionBroadcast> {
  const [live, recentActivities] = await Promise.all([
    getLiveCompetition(userId),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { activityDate: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        activityDate: true,
        distanceMeters: true,
        durationSeconds: true,
      },
    }),
  ])

  const items: BroadcastItem[] = []

  for (const item of live.slice(0, 3)) {
    const severity = item.finishProbability >= 80 ? "IMPORTANT" : item.finishProbability >= 60 ? "INFO" : "CRITICAL"
    const deltaLabel = Math.abs(item.delta)
    items.push({
      id: `live-${item.id}`,
      type: "SWING",
      headline:
        item.delta === 0
          ? `${item.title} is tied`
          : item.delta > 0
            ? `You lead ${item.title} by ${deltaLabel}`
            : `You trail ${item.title} by ${deltaLabel}`,
      detail: `Finish probability ${item.finishProbability}%. Momentum ${item.momentum >= 0 ? "+" : ""}${item.momentum}.`,
      severity,
      timestamp: item.updatedAt,
    })
  }

  for (const activity of recentActivities) {
    const distanceKm = activity.distanceMeters ? Math.round((activity.distanceMeters / 1000) * 10) / 10 : null
    items.push({
      id: `activity-${activity.id}`,
      type: "MILESTONE",
      headline: activity.title ?? "Session completed",
      detail: distanceKm ? `${distanceKm} km session logged` : "Session recorded",
      severity: "INFO",
      timestamp: activity.activityDate.toISOString(),
    })
  }

  return {
    updatedAt: new Date().toISOString(),
    items: items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6),
  }
}
