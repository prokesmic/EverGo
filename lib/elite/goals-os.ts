import { prisma } from "@/lib/db"

export interface GoalOSSummary {
  weeklyTargetActivities: number
  weeklyTargetMinutes: number
  currentActivities: number
  currentMinutes: number
  completionPct: number
  forecastEndOfWeekActivities: number
  forecastConfidence: number
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

  const [streak, weekActivities, activeTargets] = await Promise.all([
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
  ])

  const currentActivities = weekActivities.length
  const currentMinutes = Math.round(
    weekActivities.reduce((sum, activity) => sum + ((activity.durationSeconds ?? 0) / 60), 0)
  )

  const baseTargetActivities = Math.max(3, streak?.weeklyGoal ?? 4)
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

  const recommendedSessions = buildRecommendedSessions(
    daysRemaining,
    weeklyTargetActivities - currentActivities
  )

  return {
    weeklyTargetActivities,
    weeklyTargetMinutes,
    currentActivities,
    currentMinutes,
    completionPct,
    forecastEndOfWeekActivities,
    forecastConfidence,
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
