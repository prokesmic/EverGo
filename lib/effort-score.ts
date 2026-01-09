import { prisma } from './db'
import { startOfWeek, endOfWeek } from 'date-fns'

/**
 * Effort Score System
 *
 * Formula: Effort Score = Duration (minutes) × Effort Multiplier
 *
 * Effort Multipliers:
 * - Easy (RPE 1-4): 1.0x
 * - Moderate (RPE 5-7): 1.5x
 * - Hard (RPE 8-10): 2.0x
 * - Race/Competition: 3.0x (overrides RPE)
 */

export type EffortCategory = 'easy' | 'moderate' | 'hard' | 'race'

export function getEffortMultiplier(rpe: number, isRace: boolean): number {
  if (isRace) return 3.0
  if (rpe <= 4) return 1.0
  if (rpe <= 7) return 1.5
  return 2.0
}

export function getEffortCategory(rpe: number, isRace: boolean): EffortCategory {
  if (isRace) return 'race'
  if (rpe <= 4) return 'easy'
  if (rpe <= 7) return 'moderate'
  return 'hard'
}

export function calculateEffortScore(
  durationSeconds: number,
  rpe: number = 5,
  isRace: boolean = false
): { score: number; multiplier: number; category: EffortCategory } {
  const durationMinutes = durationSeconds / 60
  const multiplier = getEffortMultiplier(rpe, isRace)
  const score = Math.round(durationMinutes * multiplier)
  const category = getEffortCategory(rpe, isRace)

  return { score, multiplier, category }
}

export async function updateActivityEffortScore(activityId: string): Promise<void> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { durationSeconds: true, rpe: true, isRace: true }
  })

  if (!activity || !activity.durationSeconds) return

  const { score, multiplier } = calculateEffortScore(
    activity.durationSeconds,
    activity.rpe ?? 5,
    activity.isRace ?? false
  )

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      effortScore: score,
      effortMultiplier: multiplier
    }
  })
}

export async function recalculateWeeklyEffort(userId: string, date: Date = new Date()): Promise<void> {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

  // Get all activities for this week
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: {
        gte: weekStart,
        lte: weekEnd
      }
    },
    select: {
      durationSeconds: true,
      rpe: true,
      isRace: true,
      effortScore: true
    }
  })

  // Calculate totals
  let totalScore = 0
  let easyMinutes = 0
  let moderateMinutes = 0
  let hardMinutes = 0
  let raceMinutes = 0

  for (const activity of activities) {
    if (!activity.durationSeconds) continue

    const minutes = Math.round(activity.durationSeconds / 60)
    const category = getEffortCategory(activity.rpe ?? 5, activity.isRace ?? false)

    totalScore += activity.effortScore ?? 0

    switch (category) {
      case 'easy': easyMinutes += minutes; break
      case 'moderate': moderateMinutes += minutes; break
      case 'hard': hardMinutes += minutes; break
      case 'race': raceMinutes += minutes; break
    }
  }

  // Upsert weekly record
  await prisma.weeklyEffortScore.upsert({
    where: {
      userId_weekStart: { userId, weekStart }
    },
    create: {
      userId,
      weekStart,
      weekEnd,
      totalScore,
      easyMinutes,
      moderateMinutes,
      hardMinutes,
      raceMinutes,
      activityCount: activities.length
    },
    update: {
      totalScore,
      easyMinutes,
      moderateMinutes,
      hardMinutes,
      raceMinutes,
      activityCount: activities.length
    }
  })
}

// Get user's current week effort with comparison to last week
export async function getUserWeeklyEffort(userId: string) {
  const now = new Date()
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const [thisWeek, lastWeek] = await Promise.all([
    prisma.weeklyEffortScore.findUnique({
      where: { userId_weekStart: { userId, weekStart: thisWeekStart } }
    }),
    prisma.weeklyEffortScore.findUnique({
      where: { userId_weekStart: { userId, weekStart: lastWeekStart } }
    })
  ])

  const currentScore = thisWeek?.totalScore ?? 0
  const lastScore = lastWeek?.totalScore ?? 0
  const delta = currentScore - lastScore
  const percentChange = lastScore > 0 ? Math.round((delta / lastScore) * 100) : 0

  return {
    currentScore: Math.round(currentScore),
    lastWeekScore: Math.round(lastScore),
    delta: Math.round(delta),
    percentChange,
    breakdown: {
      easy: thisWeek?.easyMinutes ?? 0,
      moderate: thisWeek?.moderateMinutes ?? 0,
      hard: thisWeek?.hardMinutes ?? 0,
      race: thisWeek?.raceMinutes ?? 0
    },
    activityCount: thisWeek?.activityCount ?? 0
  }
}

/**
 * Get weekly effort leaderboard for a scope
 */
export async function getWeeklyEffortLeaderboard(
  scope: 'global' | 'country' | 'city',
  scopeValue?: string,
  limit: number = 100
) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const whereClause: Record<string, unknown> = { weekStart }

  if (scope === 'country' && scopeValue) {
    whereClause.user = { country: scopeValue }
  } else if (scope === 'city' && scopeValue) {
    whereClause.user = { city: scopeValue }
  }

  const scores = await prisma.weeklyEffortScore.findMany({
    where: whereClause,
    orderBy: { totalScore: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true
        }
      }
    }
  })

  return scores.map((score, index) => ({
    rank: index + 1,
    userId: score.userId,
    username: score.user.username,
    displayName: score.user.displayName,
    avatarUrl: score.user.avatarUrl,
    score: Math.round(score.totalScore),
    activityCount: score.activityCount
  }))
}
