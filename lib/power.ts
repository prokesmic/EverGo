import { prisma } from './db'
import { startOfWeek, endOfWeek, subDays } from 'date-fns'

/**
 * Power System (V6) with Anti-Gaming Guardrails
 *
 * Formula: Power = Duration (minutes) × Power Multiplier × Confidence Factor
 *
 * Power Multipliers:
 * - Easy (RPE 1-4): 1.0x
 * - Moderate (RPE 5-7): 1.5x
 * - Hard (RPE 8-10): 2.0x
 * - Race/Competition: 3.0x (restricted - see guardrails)
 *
 * Anti-Gaming Guardrails:
 * 1. Source Confidence: VERIFIED (device) > MANUAL (user entered)
 * 2. Race Multiplier Restrictions:
 *    - Must have eventId, OR
 *    - Must be GOLD verification tier, OR
 *    - Limited to 2 races per week (frequency cap)
 * 3. Power Audit: All calculations stored with breakdown
 */

export type IntensityCategory = 'easy' | 'moderate' | 'hard' | 'race'
export type SourceConfidence = 'VERIFIED' | 'MANUAL'

// Activity sources that count as verified (device imported)
const VERIFIED_SOURCES = [
  'IMPORT_STRAVA',
  'IMPORT_GARMIN',
  'IMPORT_APPLE_HEALTH',
  'IMPORT_GOOGLE_FIT',
  'UPLOAD',
]

export function getSourceConfidence(source: string | null): SourceConfidence {
  if (!source) return 'MANUAL'
  return VERIFIED_SOURCES.includes(source) ? 'VERIFIED' : 'MANUAL'
}

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

/**
 * Check if user is eligible for race multiplier
 * Returns true if:
 * - Activity has an eventId (linked to official event), OR
 * - Activity is GOLD verification tier, OR
 * - User has < 2 races this week (frequency cap)
 */
export async function isRaceMultiplierEligible(
  userId: string,
  activityDate: Date,
  hasEventId: boolean,
  verificationTier: string | null
): Promise<{ eligible: boolean; reason: string }> {
  // Always allow if linked to an event
  if (hasEventId) {
    return { eligible: true, reason: 'EVENT_LINKED' }
  }

  // Always allow if verified (device import)
  if (verificationTier === 'GOLD') {
    return { eligible: true, reason: 'GOLD_VERIFIED' }
  }

  // Check race frequency (max 2 per week)
  const weekStart = startOfWeek(activityDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(activityDate, { weekStartsOn: 1 })

  const raceCount = await prisma.activity.count({
    where: {
      userId,
      isRace: true,
      activityDate: { gte: weekStart, lte: weekEnd },
    },
  })

  if (raceCount < 2) {
    return { eligible: true, reason: 'UNDER_FREQUENCY_CAP' }
  }

  return { eligible: false, reason: 'EXCEEDED_RACE_FREQUENCY' }
}

export interface PowerCalculation {
  power: number
  multiplier: number
  category: IntensityCategory
  confidence: SourceConfidence
  raceEligible?: boolean
  raceReason?: string
}

export function calculatePower(
  durationSeconds: number,
  rpe: number = 5,
  isRace: boolean = false,
  source?: string | null
): PowerCalculation {
  const durationMinutes = durationSeconds / 60
  const multiplier = getPowerMultiplier(rpe, isRace)
  const power = Math.round(durationMinutes * multiplier)
  const category = getIntensityCategory(rpe, isRace)
  const confidence = getSourceConfidence(source ?? null)

  return { power, multiplier, category, confidence }
}

/**
 * Calculate power with full guardrail checks
 * Use this for competitive contexts (gauntlets, seasons, rankings)
 */
export async function calculatePowerWithGuardrails(
  userId: string,
  durationSeconds: number,
  rpe: number = 5,
  isRace: boolean = false,
  source: string | null = null,
  activityDate: Date = new Date(),
  hasEventId: boolean = false,
  verificationTier: string | null = null
): Promise<PowerCalculation> {
  const durationMinutes = durationSeconds / 60
  const confidence = getSourceConfidence(source)

  // Check race multiplier eligibility
  let effectiveIsRace = isRace
  let raceReason = ''

  if (isRace) {
    const eligibility = await isRaceMultiplierEligible(
      userId,
      activityDate,
      hasEventId,
      verificationTier
    )

    if (!eligibility.eligible) {
      // Downgrade to hard intensity instead
      effectiveIsRace = false
      raceReason = eligibility.reason
      console.log(
        `[Power] Race multiplier denied for user ${userId}: ${eligibility.reason}`
      )
    } else {
      raceReason = eligibility.reason
    }
  }

  const multiplier = getPowerMultiplier(rpe, effectiveIsRace)
  const power = Math.round(durationMinutes * multiplier)
  const category = getIntensityCategory(rpe, effectiveIsRace)

  return {
    power,
    multiplier,
    category,
    confidence,
    raceEligible: effectiveIsRace,
    raceReason,
  }
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
