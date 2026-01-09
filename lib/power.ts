import { prisma } from './db'
import { startOfWeek, endOfWeek } from 'date-fns'

/**
 * Power System (V6)
 *
 * Formula: Power = Duration (minutes) × Power Multiplier
 *
 * Power Multipliers:
 * - Easy (RPE 1-4): 1.0x
 * - Moderate (RPE 5-7): 1.5x
 * - Hard (RPE 8-10): 2.0x
 * - Race/Competition: 3.0x (overrides RPE)
 */

export type IntensityCategory = 'easy' | 'moderate' | 'hard' | 'race'

export function getPowerMultiplier(rpe: number, isRace: boolean): number {
  if (isRace) return 3.0
  if (rpe <= 4) return 1.0
  if (rpe <= 7) return 1.5
  return 2.0
}

export function getIntensityCategory(rpe: number, isRace: boolean): IntensityCategory {
  if (isRace) return 'race'
  if (rpe <= 4) return 'easy'
  if (rpe <= 7) return 'moderate'
  return 'hard'
}

export function calculatePower(
  durationSeconds: number,
  rpe: number = 5,
  isRace: boolean = false
): { power: number; multiplier: number; category: IntensityCategory } {
  const durationMinutes = durationSeconds / 60
  const multiplier = getPowerMultiplier(rpe, isRace)
  const power = Math.round(durationMinutes * multiplier)
  const category = getIntensityCategory(rpe, isRace)

  return { power, multiplier, category }
}

export async function updateActivityPower(activityId: string): Promise<void> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { durationSeconds: true, rpe: true, isRace: true }
  })

  if (!activity || !activity.durationSeconds) return

  const { power, multiplier } = calculatePower(
    activity.durationSeconds,
    activity.rpe ?? 5,
    activity.isRace ?? false
  )

  await prisma.activity.update({
    where: { id: activityId },
    data: {
      power: power,
      powerMultiplier: multiplier
    }
  })
}

export async function recalculateWeeklyPower(userId: string, date: Date = new Date()): Promise<void> {
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
      power: true
    }
  })

  // Calculate totals
  let totalPower = 0
  let easyMinutes = 0
  let moderateMinutes = 0
  let hardMinutes = 0
  let raceMinutes = 0

  for (const activity of activities) {
    if (!activity.durationSeconds) continue

    const minutes = Math.round(activity.durationSeconds / 60)
    const category = getIntensityCategory(activity.rpe ?? 5, activity.isRace ?? false)

    totalPower += activity.power ?? 0

    switch (category) {
      case 'easy': easyMinutes += minutes; break
      case 'moderate': moderateMinutes += minutes; break
      case 'hard': hardMinutes += minutes; break
      case 'race': raceMinutes += minutes; break
    }
  }

  // Upsert weekly record
  await prisma.weeklyPower.upsert({
    where: {
      userId_weekStart: { userId, weekStart }
    },
    create: {
      userId,
      weekStart,
      weekEnd,
      totalPower,
      easyMinutes,
      moderateMinutes,
      hardMinutes,
      raceMinutes,
      activityCount: activities.length
    },
    update: {
      totalPower,
      easyMinutes,
      moderateMinutes,
      hardMinutes,
      raceMinutes,
      activityCount: activities.length
    }
  })
}

// Get user's current week power with comparison to last week
export async function getUserWeeklyPower(userId: string) {
  const now = new Date()
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  const [thisWeek, lastWeek] = await Promise.all([
    prisma.weeklyPower.findUnique({
      where: { userId_weekStart: { userId, weekStart: thisWeekStart } }
    }),
    prisma.weeklyPower.findUnique({
      where: { userId_weekStart: { userId, weekStart: lastWeekStart } }
    })
  ])

  const currentPower = thisWeek?.totalPower ?? 0
  const lastPower = lastWeek?.totalPower ?? 0
  const delta = currentPower - lastPower
  const percentChange = lastPower > 0 ? Math.round((delta / lastPower) * 100) : 0

  return {
    currentPower: Math.round(currentPower),
    lastWeekPower: Math.round(lastPower),
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
 * Get weekly power leaderboard for a scope
 */
export async function getWeeklyPowerLeaderboard(
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

  const scores = await prisma.weeklyPower.findMany({
    where: whereClause,
    orderBy: { totalPower: 'desc' },
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
    power: Math.round(score.totalPower),
    activityCount: score.activityCount
  }))
}

// Legacy exports for backward compatibility during migration
export const calculateEffortScore = calculatePower
export const updateActivityEffortScore = updateActivityPower
export const recalculateWeeklyEffort = recalculateWeeklyPower
export const getUserWeeklyEffort = getUserWeeklyPower
export const getWeeklyEffortLeaderboard = getWeeklyPowerLeaderboard
export type EffortCategory = IntensityCategory
export const getEffortMultiplier = getPowerMultiplier
export const getEffortCategory = getIntensityCategory
