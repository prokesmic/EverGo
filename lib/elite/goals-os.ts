import { prisma } from "@/lib/db"
import { getPersonalizationProfile } from "@/lib/personalization/profile"

export interface GoalOSSummary {
  weeklyTargetActivities: number
  weeklyTargetMinutes: number
  currentActivities: number
  currentMinutes: number
  completionPct: number
  forecastEndOfWeekActivities: number
  forecastConfidence: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  slackDays: number
  requiredSessionsPerRemainingDay: number
  momentumScore: number
  rationale: string[]
  recommendedSessions: Array<{
    day: string
    focus: string
    durationMinutes: number
    intensity: "RECOVERY" | "EASY" | "QUALITY"
  }>
}

export async function getGoalOSSummary(userId: string): Promise<GoalOSSummary> {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  const daysElapsed = Math.max(1, Math.floor((now.getTime() - weekStart.getTime()) / 86_400_000) + 1)
  const daysRemaining = Math.max(0, 7 - daysElapsed)

  const [streak, weekActivities, activeTargets, profile] = await Promise.all([
    prisma.userStreak.findUnique({
      where: { userId },
      select: { weeklyGoal: true, weeklyProgress: true, currentStreak: true },
    }),
    prisma.activity.findMany({
      where: {
        userId,
        activityDate: { gte: weekStart, lte: weekEnd },
      },
      select: { durationSeconds: true, activityDate: true },
    }),
    prisma.target.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { targetDate: "asc" },
      take: 4,
      select: { targetValue: true, currentValue: true, targetDate: true },
    }),
    getPersonalizationProfile(userId),
  ])

  const currentActivities = weekActivities.length
  const currentMinutes = Math.round(
    weekActivities.reduce((sum, activity) => sum + ((activity.durationSeconds ?? 0) / 60), 0)
  )

  const baselineTarget = Math.max(3, profile.baselineWeeklySessions || 4)
  const baseTargetActivities = Math.max(3, streak?.weeklyGoal ?? baselineTarget)
  const targetBoost = activeTargets.length > 0 ? 1 : 0
  const weeklyTargetActivities = baseTargetActivities + targetBoost
  const weeklyTargetMinutes = weeklyTargetActivities * 45
  const completionPct = clamp(
    Math.round(
      ((currentActivities / Math.max(weeklyTargetActivities, 1)) * 60) +
        ((currentMinutes / Math.max(weeklyTargetMinutes, 1)) * 40)
    ),
    0,
    100
  )

  const paceActivities = currentActivities / daysElapsed
  const forecastEndOfWeekActivities = Math.round(currentActivities + paceActivities * daysRemaining)
  const forecastConfidence = clamp(
    45 +
      Math.min(25, (streak?.currentStreak ?? 0) * 2) +
      Math.max(-15, (forecastEndOfWeekActivities - weeklyTargetActivities) * 4),
    20,
    95
  )
  const remainingSessions = Math.max(0, weeklyTargetActivities - currentActivities)
  const requiredSessionsPerRemainingDay =
    daysRemaining > 0 ? Math.round((remainingSessions / daysRemaining) * 10) / 10 : remainingSessions
  const slackDays = Math.max(0, daysRemaining - remainingSessions)
  const momentumScore = clamp(Math.round((paceActivities / Math.max(weeklyTargetActivities / 7, 0.5)) * 100), 40, 120)
  const riskLevel: GoalOSSummary["riskLevel"] =
    requiredSessionsPerRemainingDay >= 1.4 ? "HIGH" : requiredSessionsPerRemainingDay >= 1 ? "MEDIUM" : "LOW"
  const rationale = buildRationale({
    currentActivities,
    weeklyTargetActivities,
    forecastEndOfWeekActivities,
    riskLevel,
    slackDays,
  })

  const recommendedSessions = buildRecommendedSessions(
    daysRemaining,
    remainingSessions
  )

  return {
    weeklyTargetActivities,
    weeklyTargetMinutes,
    currentActivities,
    currentMinutes,
    completionPct,
    forecastEndOfWeekActivities,
    forecastConfidence,
    riskLevel,
    slackDays,
    requiredSessionsPerRemainingDay,
    momentumScore,
    rationale,
    recommendedSessions,
  }
}

function buildRecommendedSessions(daysRemaining: number, sessionsNeeded: number) {
  const plan: GoalOSSummary["recommendedSessions"] = []
  const nextDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const cappedNeeded = clamp(sessionsNeeded, 0, 5)
  const totalToPlan = Math.max(2, Math.min(4, daysRemaining + 1))

  for (let i = 0; i < totalToPlan; i += 1) {
    const hardDay = i === 1 && cappedNeeded > 0
    const easyDay = i === totalToPlan - 1
    plan.push({
      day: nextDays[(new Date().getDay() + i) % 7],
      focus: hardDay
        ? "Quality progression"
        : easyDay
          ? "Recovery + mobility"
          : "Aerobic consistency",
      durationMinutes: hardDay ? 55 : easyDay ? 35 : 45,
      intensity: hardDay ? "QUALITY" : easyDay ? "RECOVERY" : "EASY",
    })
  }

  return plan
}

function buildRationale(input: {
  currentActivities: number
  weeklyTargetActivities: number
  forecastEndOfWeekActivities: number
  riskLevel: GoalOSSummary["riskLevel"]
  slackDays: number
}) {
  const items: string[] = []
  if (input.forecastEndOfWeekActivities >= input.weeklyTargetActivities) {
    items.push("Current pace keeps you on track to hit weekly volume.")
  } else {
    items.push("Projected pace is below target; add one more session to catch up.")
  }
  if (input.riskLevel === "HIGH") {
    items.push("Compression risk is high; prioritize shorter, consistent sessions.")
  } else if (input.riskLevel === "MEDIUM") {
    items.push("Moderate compression risk; keep one quality and one easy session.")
  } else {
    items.push("You have slack days available for recovery or skill work.")
  }
  if (input.slackDays === 0) {
    items.push("No slack days left; protect the remaining schedule.")
  }
  return items
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - diff)
  return d
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
