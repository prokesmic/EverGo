import { prisma } from "@/lib/db"
import { ScoringKind } from "@prisma/client"

/**
 * Sport multipliers for Activity Score calculation
 * Higher multiplier = more effort rewarded
 */
export const SPORT_MULTIPLIERS: Record<string, number> = {
  running: 1.0,
  cycling: 0.7,
  swimming: 1.5,
  hiking: 0.8,
  walking: 0.5,
  gym: 1.2,
  yoga: 0.6,
  rowing: 1.3,
  "cross-country-skiing": 1.4,
  default: 1.0,
}

/**
 * Intensity factors based on activity metrics
 */
export const INTENSITY_FACTORS = {
  EASY: 1.0,
  MODERATE: 1.3,
  HARD: 1.6,
  MAX: 2.0,
}

/**
 * Calculate intensity factor from activity metrics
 */
export function calculateIntensityFactor(activity: {
  avgHeartRate?: number | null
  maxHeartRate?: number | null
  avgPace?: number | null
  caloriesBurned?: number | null
  durationSeconds?: number | null
}): number {
  // If we have heart rate data, use it
  if (activity.avgHeartRate && activity.maxHeartRate) {
    const hrPercent = activity.avgHeartRate / activity.maxHeartRate
    if (hrPercent >= 0.9) return INTENSITY_FACTORS.MAX
    if (hrPercent >= 0.8) return INTENSITY_FACTORS.HARD
    if (hrPercent >= 0.7) return INTENSITY_FACTORS.MODERATE
    return INTENSITY_FACTORS.EASY
  }

  // Fall back to calories per minute if available
  if (activity.caloriesBurned && activity.durationSeconds && activity.durationSeconds > 0) {
    const calsPerMinute = activity.caloriesBurned / (activity.durationSeconds / 60)
    if (calsPerMinute >= 15) return INTENSITY_FACTORS.MAX
    if (calsPerMinute >= 10) return INTENSITY_FACTORS.HARD
    if (calsPerMinute >= 6) return INTENSITY_FACTORS.MODERATE
    return INTENSITY_FACTORS.EASY
  }

  // Default to moderate
  return INTENSITY_FACTORS.MODERATE
}

/**
 * Calculate Activity Score for a user (rolling 30-day window)
 * Formula: SUM(durationMinutes * sportMultiplier * intensityFactor * timeDecayFactor)
 */
export async function calculateActivityScore(userId: string): Promise<number> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const activities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: {
        gte: thirtyDaysAgo,
      },
    },
    include: {
      discipline: {
        include: {
          sport: true,
        },
      },
    },
  })

  let totalScore = 0

  for (const activity of activities) {
    const durationMinutes = (activity.durationSeconds || 0) / 60
    const sportSlug = activity.discipline?.sport?.slug || "default"
    const sportMultiplier = SPORT_MULTIPLIERS[sportSlug] || SPORT_MULTIPLIERS.default
    const intensityFactor = calculateIntensityFactor(activity)

    // Time decay: activities older than 7 days count at 50%
    const isRecent = new Date(activity.activityDate) >= sevenDaysAgo
    const timeDecayFactor = isRecent ? 1.0 : 0.5

    const activityPoints = durationMinutes * sportMultiplier * intensityFactor * timeDecayFactor
    totalScore += activityPoints
  }

  return Math.round(totalScore)
}

/**
 * Get a user's score for a specific discipline
 * Handles different ScoringKind values
 */
export async function getDisciplineScore(
  userId: string,
  disciplineId: string
): Promise<number | null> {
  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    include: { sport: true },
  })

  if (!discipline) return null

  const validityDate = new Date()
  validityDate.setMonth(validityDate.getMonth() - discipline.validityMonths)

  switch (discipline.scoringKind) {
    case ScoringKind.PB_BEST: {
      // Get best personal record for this discipline
      const bestPR = await prisma.personalRecord.findFirst({
        where: {
          userId,
          disciplineId,
          achievedAt: { gte: validityDate },
        },
        orderBy: discipline.lowerIsBetter
          ? { value: "asc" }
          : { value: "desc" },
      })
      return bestPR?.value ?? null
    }

    case ScoringKind.PERIOD_BEST: {
      // Get best activity value in the period
      const activities = await prisma.activity.findMany({
        where: {
          userId,
          disciplineId,
          activityDate: { gte: validityDate },
        },
      })

      if (activities.length === 0) return null

      // Use primary metric based on discipline
      const values = activities.map((a) => {
        if (discipline.primaryMetric === "pace") return a.avgPace
        if (discipline.primaryMetric === "distance") return a.distanceMeters
        if (discipline.primaryMetric === "duration") return a.durationSeconds
        return null
      }).filter((v): v is number => v !== null)

      if (values.length === 0) return null

      return discipline.lowerIsBetter
        ? Math.min(...values)
        : Math.max(...values)
    }

    case ScoringKind.PERIOD_SUM: {
      // Sum of values in the period (for Activity Score)
      if (discipline.slug === "activity-score") {
        return await calculateActivityScore(userId)
      }

      // Generic sum for other disciplines
      const activities = await prisma.activity.findMany({
        where: {
          userId,
          disciplineId,
          activityDate: { gte: validityDate },
        },
      })

      let sum = 0
      for (const activity of activities) {
        if (discipline.primaryMetric === "distance") {
          sum += activity.distanceMeters ?? 0
        } else if (discipline.primaryMetric === "duration") {
          sum += activity.durationSeconds ?? 0
        } else if (discipline.primaryMetric === "elevation") {
          sum += activity.elevationGain ?? 0
        }
      }
      return sum
    }

    default:
      return null
  }
}

/**
 * Leaderboard entry type
 */
export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string | null
  score: number
  formattedScore: string
}

/**
 * Get leaderboard for a discipline with optional scope filtering
 */
export async function getDisciplineLeaderboard(
  disciplineId: string,
  options: {
    scope?: "GLOBAL" | "COUNTRY" | "CITY" | "FRIENDS"
    scopeValue?: string
    userId?: string // For friends scope
    limit?: number
    offset?: number
  } = {}
): Promise<{ entries: LeaderboardEntry[]; totalCount: number }> {
  const { scope = "GLOBAL", scopeValue, userId, limit = 50, offset = 0 } = options

  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
  })

  if (!discipline) {
    return { entries: [], totalCount: 0 }
  }

  // Build user filter based on scope
  let userFilter: any = {}

  if (scope === "COUNTRY" && scopeValue) {
    userFilter.country = scopeValue
  } else if (scope === "CITY" && scopeValue) {
    userFilter.city = scopeValue
  } else if (scope === "FRIENDS" && userId) {
    // Get friend IDs
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    const friendIds = following.map((f) => f.followingId)
    friendIds.push(userId) // Include self
    userFilter.id = { in: friendIds }
  }

  // Get all users matching scope
  const users = await prisma.user.findMany({
    where: userFilter,
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
    },
  })

  // Calculate scores for each user
  const userScores: Array<{
    userId: string
    displayName: string
    avatarUrl: string | null
    score: number
  }> = []

  for (const user of users) {
    const score = await getDisciplineScore(user.id, disciplineId)
    if (score !== null && score > 0) {
      userScores.push({
        userId: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        score,
      })
    }
  }

  // Sort by score
  userScores.sort((a, b) => {
    if (discipline.lowerIsBetter) {
      return a.score - b.score
    }
    return b.score - a.score
  })

  const totalCount = userScores.length

  // Apply pagination
  const paginatedScores = userScores.slice(offset, offset + limit)

  // Format scores and add ranks
  const entries: LeaderboardEntry[] = paginatedScores.map((entry, index) => ({
    rank: offset + index + 1,
    userId: entry.userId,
    displayName: entry.displayName,
    avatarUrl: entry.avatarUrl,
    score: entry.score,
    formattedScore: formatScore(entry.score, discipline.unit || "", discipline.primaryMetric),
  }))

  return { entries, totalCount }
}

/**
 * Format a score value for display
 */
export function formatScore(
  value: number,
  unit: string,
  metric?: string
): string {
  if (unit === "sec" || metric === "pace") {
    // Format as time (e.g., 3:45)
    const minutes = Math.floor(value / 60)
    const seconds = Math.round(value % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (unit === "km" || metric === "distance") {
    // Format as distance (e.g., 42.2 km)
    return `${(value / 1000).toFixed(1)} km`
  }

  if (unit === "m") {
    // Format as meters
    return `${value.toFixed(0)} m`
  }

  if (unit === "points") {
    // Format as integer
    return value.toLocaleString()
  }

  // Default: show 2 decimal places
  return value.toFixed(2)
}

/**
 * Cache discipline leaderboard (top entries)
 */
export async function cacheDisciplineLeaderboard(
  disciplineId: string,
  scope: string,
  scopeValue: string | null
): Promise<void> {
  const { entries, totalCount } = await getDisciplineLeaderboard(disciplineId, {
    scope: scope as "GLOBAL" | "COUNTRY" | "CITY",
    scopeValue: scopeValue || undefined,
    limit: 100,
  })

  await prisma.disciplineLeaderboardCache.upsert({
    where: {
      disciplineId_scope_scopeValue: {
        disciplineId,
        scope,
        scopeValue: scopeValue ?? "",
      },
    },
    update: {
      leaderboard: JSON.stringify(entries),
      totalUsers: totalCount,
      calculatedAt: new Date(),
    },
    create: {
      disciplineId,
      scope,
      scopeValue: scopeValue ?? "",
      leaderboard: JSON.stringify(entries),
      totalUsers: totalCount,
    },
  })
}

/**
 * Get cached leaderboard
 */
export async function getCachedLeaderboard(
  disciplineId: string,
  scope: string,
  scopeValue: string | null
): Promise<{ entries: LeaderboardEntry[]; totalCount: number; cachedAt: Date } | null> {
  const cached = await prisma.disciplineLeaderboardCache.findUnique({
    where: {
      disciplineId_scope_scopeValue: {
        disciplineId,
        scope,
        scopeValue: scopeValue ?? "",
      },
    },
  })

  if (!cached) return null

  return {
    entries: JSON.parse(cached.leaderboard) as LeaderboardEntry[],
    totalCount: cached.totalUsers,
    cachedAt: cached.calculatedAt,
  }
}

/**
 * Recalculate all discipline rankings (background job)
 */
export async function recalculateAllDisciplineRankings(): Promise<void> {
  console.log("🏆 Recalculating all discipline rankings...")

  // Get all active disciplines
  const disciplines = await prisma.discipline.findMany({
    where: { isActive: true },
  })

  for (const discipline of disciplines) {
    console.log(`  Processing: ${discipline.name}`)

    // Cache global leaderboard
    await cacheDisciplineLeaderboard(discipline.id, "GLOBAL", null)

    // Cache country leaderboards
    const countries = await prisma.user.findMany({
      where: { country: { not: null } },
      distinct: ["country"],
      select: { country: true },
    })

    for (const { country } of countries) {
      if (country) {
        await cacheDisciplineLeaderboard(discipline.id, "COUNTRY", country)
      }
    }

    // Cache city leaderboards
    const cities = await prisma.user.findMany({
      where: { city: { not: null } },
      distinct: ["city"],
      select: { city: true },
    })

    for (const { city } of cities) {
      if (city) {
        await cacheDisciplineLeaderboard(discipline.id, "CITY", city)
      }
    }
  }

  console.log("✅ Discipline rankings recalculated!")
}

/**
 * Update UserActivityScore for a single user
 */
export async function updateUserActivityScore(userId: string): Promise<number> {
  const score = await calculateActivityScore(userId)

  // Get user's location for denormalization
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { country: true, city: true },
  })

  // Count activities in the window
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activityCount = await prisma.activity.count({
    where: {
      userId,
      activityDate: { gte: thirtyDaysAgo },
    },
  })

  // Today at start of day UTC
  const asOfDate = new Date()
  asOfDate.setUTCHours(0, 0, 0, 0)

  // Upsert using compound unique key
  await prisma.userActivityScore.upsert({
    where: {
      userId_asOfDate_windowDays: {
        userId,
        asOfDate,
        windowDays: 28,
      },
    },
    update: {
      totalEffort: score,
      activityScore: Math.min(1000, Math.round(score / 10)), // Scale to 0-1000
      activityCount,
      country: user?.country,
      city: user?.city,
    },
    create: {
      userId,
      asOfDate,
      windowDays: 28,
      totalEffort: score,
      activityScore: Math.min(1000, Math.round(score / 10)), // Scale to 0-1000
      activityCount,
      country: user?.country,
      city: user?.city,
    },
  })

  return score
}
