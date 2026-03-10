import { prisma } from "@/lib/db"

export interface ActivityStory {
  headline: string
  summary: string
  talkingPoints: string[]
  coachTakeaway: string
  shareCaption: string
}

export async function getActivityStory(activityId: string): Promise<ActivityStory | null> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      user: { select: { displayName: true } },
      sport: { select: { name: true } },
    },
  })

  if (!activity) return null
  return buildActivityStory({
    athlete: activity.user.displayName,
    sport: activity.sport?.name ?? "Training",
    title: activity.title,
    distanceMeters: activity.distanceMeters,
    durationSeconds: activity.durationSeconds,
    elevationGain: activity.elevationGain,
    rpe: activity.rpe,
    avgHeartRate: activity.avgHeartRate,
    source: activity.source,
  })
}

export function buildActivityStory(input: {
  athlete: string
  sport: string
  title: string
  distanceMeters: number | null
  durationSeconds: number | null
  elevationGain: number | null
  rpe: number | null
  avgHeartRate: number | null
  source: string
}): ActivityStory {
  const distanceKm = (input.distanceMeters ?? 0) / 1000
  const durationMin = (input.durationSeconds ?? 0) / 60
  const avgPacePerKm =
    distanceKm > 0 && durationMin > 0 ? durationMin / distanceKm : null

  const headline =
    distanceKm >= 20
      ? "Big volume day executed"
      : distanceKm >= 10
        ? "Strong endurance session"
        : durationMin >= 45
          ? "Solid consistency block"
          : "Momentum session complete"

  const summaryParts = [
    `${input.athlete} logged "${input.title}" in ${input.sport}.`,
    distanceKm > 0 ? `Distance: ${distanceKm.toFixed(1)} km.` : null,
    durationMin > 0 ? `Duration: ${Math.round(durationMin)} min.` : null,
    avgPacePerKm ? `Average pace: ${formatPace(avgPacePerKm)} /km.` : null,
    input.elevationGain ? `Elevation gain: ${Math.round(input.elevationGain)} m.` : null,
  ].filter(Boolean)

  const talkingPoints: string[] = []
  if (input.rpe != null) {
    talkingPoints.push(
      input.rpe >= 8
        ? "High-effort session; prioritize recovery in the next 24h."
        : "Controlled effort with room to progress in the next quality session."
    )
  }
  if (input.avgHeartRate != null) {
    talkingPoints.push(
      `Heart-rate trace averaged ${Math.round(input.avgHeartRate)} bpm, useful for intensity benchmarking.`
    )
  }
  if (input.source.toUpperCase() !== "MANUAL") {
    talkingPoints.push("Imported/device-backed activity improves leaderboard trust.")
  }
  if (talkingPoints.length === 0) {
    talkingPoints.push("Consistency compounds; repeat this quality two to three times weekly.")
  }

  const coachTakeaway =
    avgPacePerKm && avgPacePerKm < 5
      ? "You are holding competitive pace. Build around one threshold and one long aerobic session this week."
      : "Maintain consistency and progress volume by 5-10% week over week without forcing intensity."

  const shareCaption =
    distanceKm > 0
      ? `Logged ${distanceKm.toFixed(1)} km in ${input.sport} today. Building the edge on EverGo.`
      : `Another ${input.sport} session in the bank. Consistency wins.`

  return {
    headline,
    summary: summaryParts.join(" "),
    talkingPoints,
    coachTakeaway,
    shareCaption,
  }
}

function formatPace(minutesPerKm: number) {
  const whole = Math.floor(minutesPerKm)
  const sec = Math.round((minutesPerKm - whole) * 60)
  return `${whole}:${sec.toString().padStart(2, "0")}`
}
