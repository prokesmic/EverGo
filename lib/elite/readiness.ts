import { prisma } from "@/lib/db"
import { getPersonalizationProfile } from "@/lib/personalization/profile"

export type ReadinessBand = "LOW" | "MODERATE" | "HIGH" | "PEAK"

export interface ReadinessSnapshot {
  score: number
  band: ReadinessBand
  trainingLoad: {
    acuteMinutes: number
    chronicWeeklyMinutes: number
    acuteChronicRatio: number | null
  }
  recovery: {
    hoursSinceLastActivity: number | null
    suggestedIntensity: "RECOVERY" | "EASY" | "QUALITY"
  }
  consistency: {
    weeklyGoal: number
    weeklyProgress: number
    completionPct: number
  }
  drivers: string[]
  signals: Array<{
    label: string
    detail: string
    impact: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
  }>
}

export async function getReadinessSnapshot(userId: string): Promise<ReadinessSnapshot> {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  const twentyEightDaysAgo = new Date(now)
  twentyEightDaysAgo.setDate(now.getDate() - 28)

  const [activities, userStreak, profile] = await Promise.all([
    prisma.activity.findMany({
      where: {
        userId,
        activityDate: { gte: twentyEightDaysAgo },
      },
      select: {
        activityDate: true,
        durationSeconds: true,
        rpe: true,
        avgHeartRate: true,
      },
      orderBy: { activityDate: "desc" },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: {
        weeklyGoal: true,
        weeklyProgress: true,
        lastActivityDate: true,
      },
    }),
    getPersonalizationProfile(userId),
  ])

  const acuteMinutes = sumMinutes(
    activities.filter((item) => item.activityDate >= sevenDaysAgo)
  )
  const chronicMinutes = sumMinutes(activities)
  const baselineWeeklyMinutes = Math.max(1, profile.baselineWeeklyMinutes || Math.round(chronicMinutes / 4))
  const chronicWeeklyMinutes = baselineWeeklyMinutes
  const acuteChronicRatio =
    chronicWeeklyMinutes > 0 ? acuteMinutes / chronicWeeklyMinutes : null

  const hoursSinceLastActivity = userStreak?.lastActivityDate
    ? Math.max(0, (now.getTime() - userStreak.lastActivityDate.getTime()) / 3_600_000)
    : null

  const weeklyGoal = Math.max(1, userStreak?.weeklyGoal ?? 3)
  const weeklyProgress = userStreak?.weeklyProgress ?? 0
  const completionPct = Math.min(100, Math.round((weeklyProgress / weeklyGoal) * 100))

  let score = 68
  const drivers: string[] = []
  const signals: ReadinessSnapshot["signals"] = []

  if (acuteChronicRatio != null) {
    if (acuteChronicRatio > 1.35) {
      score -= 18
      drivers.push("Acute load is significantly above your baseline")
      signals.push({
        label: "Load spike",
        detail: "This week is >35% above your baseline volume.",
        impact: "NEGATIVE",
      })
    } else if (acuteChronicRatio > 1.15) {
      score -= 8
      drivers.push("Training load is elevated this week")
      signals.push({
        label: "Elevated load",
        detail: "Volume sits 15-35% above baseline.",
        impact: "NEGATIVE",
      })
    } else if (acuteChronicRatio >= 0.85 && acuteChronicRatio <= 1.1) {
      score += 10
      drivers.push("Load is in the optimal adaptation zone")
      signals.push({
        label: "Adaptation zone",
        detail: "Load is aligned with your rolling baseline.",
        impact: "POSITIVE",
      })
    } else if (acuteChronicRatio < 0.7) {
      score -= 6
      drivers.push("Load is below baseline; a progressive session can help")
      signals.push({
        label: "Under-load",
        detail: "Volume is below baseline; progressive stimulus recommended.",
        impact: "NEUTRAL",
      })
    }
  } else {
    drivers.push("Limited recent training data; recommendations are conservative")
    signals.push({
      label: "Limited data",
      detail: "Not enough training history to compute a stable baseline.",
      impact: "NEUTRAL",
    })
  }

  if (hoursSinceLastActivity != null) {
    if (hoursSinceLastActivity < 10) {
      score -= 12
      drivers.push("Very short recovery window since last session")
      signals.push({
        label: "Short recovery",
        detail: "Less than 10 hours since last session.",
        impact: "NEGATIVE",
      })
    } else if (hoursSinceLastActivity >= 18 && hoursSinceLastActivity <= 40) {
      score += 8
      drivers.push("Recovery window supports quality work today")
      signals.push({
        label: "Good recovery",
        detail: "Recovery window supports quality work.",
        impact: "POSITIVE",
      })
    } else if (hoursSinceLastActivity > 72) {
      score -= 4
      drivers.push("Long inactivity window; start with controlled intensity")
      signals.push({
        label: "Long gap",
        detail: "More than 72 hours since last session.",
        impact: "NEUTRAL",
      })
    }
  }

  if (completionPct >= 100) {
    score += 6
    drivers.push("Weekly consistency target achieved")
    signals.push({
      label: "Consistency achieved",
      detail: "Weekly target completed.",
      impact: "POSITIVE",
    })
  } else if (completionPct < 35) {
    score -= 4
    drivers.push("Weekly consistency target is behind plan")
    signals.push({
      label: "Consistency behind",
      detail: "Weekly goal progress is below 35%.",
      impact: "NEGATIVE",
    })
  }

  const recentStress = rollingStress(activities.slice(0, 6))
  if (recentStress > 120) {
    score -= 8
    drivers.push("Recent intensity and heart-rate stress are high")
    signals.push({
      label: "Stress spike",
      detail: "Recent RPE and HR stress are elevated.",
      impact: "NEGATIVE",
    })
  } else if (recentStress > 60 && recentStress < 95) {
    score += 3
    drivers.push("Recent stress profile is balanced")
    signals.push({
      label: "Balanced stress",
      detail: "Intensity and duration are stable.",
      impact: "POSITIVE",
    })
  }

  score = clamp(Math.round(score), 20, 96)
  const band = readinessBand(score)
  const suggestedIntensity: ReadinessSnapshot["recovery"]["suggestedIntensity"] =
    score < 46 ? "RECOVERY" : score < 70 ? "EASY" : "QUALITY"

  if (drivers.length === 0) {
    drivers.push("Training signal is stable")
  }

  return {
    score,
    band,
    trainingLoad: {
      acuteMinutes: Math.round(acuteMinutes),
      chronicWeeklyMinutes: Math.round(chronicWeeklyMinutes),
      acuteChronicRatio:
        acuteChronicRatio == null ? null : Math.round(acuteChronicRatio * 100) / 100,
    },
    recovery: {
      hoursSinceLastActivity:
        hoursSinceLastActivity == null ? null : Math.round(hoursSinceLastActivity),
      suggestedIntensity,
    },
    consistency: {
      weeklyGoal,
      weeklyProgress,
      completionPct,
    },
    drivers,
    signals,
  }
}

function sumMinutes(activities: Array<{ durationSeconds: number | null }>): number {
  return activities.reduce((sum, item) => sum + ((item.durationSeconds ?? 0) / 60), 0)
}

function rollingStress(
  activities: Array<{ durationSeconds: number | null; rpe: number | null; avgHeartRate: number | null }>
): number {
  return activities.reduce((sum, item) => {
    const minutes = (item.durationSeconds ?? 0) / 60
    const rpeFactor = (item.rpe ?? 5) / 5
    const hrFactor = item.avgHeartRate ? Math.max(0.75, item.avgHeartRate / 145) : 1
    return sum + minutes * rpeFactor * hrFactor
  }, 0)
}

function readinessBand(score: number): ReadinessBand {
  if (score >= 82) return "PEAK"
  if (score >= 68) return "HIGH"
  if (score >= 50) return "MODERATE"
  return "LOW"
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
