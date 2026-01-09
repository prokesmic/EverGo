import { prisma } from "@/lib/db"
import { ScoringKind, BenchmarkSource, MinVerificationTier } from "@prisma/client"
import {
  meetsVerificationTier,
  getMinTierForScope,
  isEligibleForScope,
  assignCompetitionRanks,
  type RankingScope,
} from "@/lib/scoring/strategies"

/**
 * BenchmarkSource values that count as "verified" for leaderboard eligibility
 * These are sources that can be trusted (imported from devices/apps)
 */
export const VERIFIED_BENCHMARK_SOURCES: BenchmarkSource[] = [
  BenchmarkSource.ACTIVITY_DERIVED,
  BenchmarkSource.IMPORT_STRAVA,
  BenchmarkSource.IMPORT_GARMIN,
  BenchmarkSource.IMPORT_APPLE_HEALTH,
  BenchmarkSource.IMPORT_GOOGLE_FIT,
  BenchmarkSource.SENSOR_WOO,
  BenchmarkSource.SENSOR_SURFR,
  BenchmarkSource.SENSOR_OTHER,
  BenchmarkSource.DEVICE_OTHER,
]

/**
 * Check if a BenchmarkSource counts as verified
 */
export function isVerifiedSource(source: BenchmarkSource | null | undefined): boolean {
  if (!source) return false
  return VERIFIED_BENCHMARK_SOURCES.includes(source)
}

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
 * Result from getDisciplineScore with verification info
 */
export interface DisciplineScoreResult {
  score: number | null
  isVerified: boolean
  source: BenchmarkSource | null
}

/**
 * Get a user's score for a specific discipline
 * Handles different ScoringKind values
 * Returns score along with verification status
 */
export async function getDisciplineScore(
  userId: string,
  disciplineId: string,
  options: {
    verifiedOnly?: boolean
  } = {}
): Promise<DisciplineScoreResult> {
  const { verifiedOnly = false } = options

  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
    include: { sport: true },
  })

  if (!discipline) return { score: null, isVerified: false, source: null }

  const validityDate = new Date()
  validityDate.setMonth(validityDate.getMonth() - discipline.validityMonths)

  switch (discipline.scoringKind) {
    case ScoringKind.PB_BEST: {
      // Build where clause with optional verification filter
      const whereClause: any = {
        userId,
        disciplineId,
        achievedAt: { gte: validityDate },
      }

      if (verifiedOnly) {
        whereClause.source = { in: VERIFIED_BENCHMARK_SOURCES }
      }

      // Get best personal record for this discipline
      const bestPR = await prisma.personalRecord.findFirst({
        where: whereClause,
        orderBy: discipline.lowerIsBetter
          ? { value: "asc" }
          : { value: "desc" },
      })

      if (!bestPR) return { score: null, isVerified: false, source: null }

      return {
        score: bestPR.value,
        isVerified: isVerifiedSource(bestPR.source),
        source: bestPR.source,
      }
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

      if (activities.length === 0) return { score: null, isVerified: false, source: null }

      // Use primary metric based on discipline
      const values = activities.map((a) => {
        if (discipline.primaryMetric === "pace") return a.avgPace
        if (discipline.primaryMetric === "distance") return a.distanceMeters
        if (discipline.primaryMetric === "duration") return a.durationSeconds
        return null
      }).filter((v): v is number => v !== null)

      if (values.length === 0) return { score: null, isVerified: false, source: null }

      const score = discipline.lowerIsBetter
        ? Math.min(...values)
        : Math.max(...values)

      // Activities are considered verified if they come from an import
      // For now, we'll assume activities are verified (they typically come from imports)
      return { score, isVerified: true, source: null }
    }

    case ScoringKind.PERIOD_SUM: {
      // Sum of values in the period (for Activity Score)
      if (discipline.slug === "activity-score") {
        const score = await calculateActivityScore(userId)
        return { score, isVerified: true, source: null }
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
      return { score: sum, isVerified: true, source: null }
    }

    default:
      return { score: null, isVerified: false, source: null }
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
  isVerified: boolean
  source: BenchmarkSource | null
  tiedWith?: number // Number of other entries with the same rank (0 if not tied)
}

/**
 * Leaderboard metadata including discipline badges
 */
export interface LeaderboardMetadata {
  disciplineId: string
  disciplineName: string
  fairnessBadge: string
  verificationBadge: string
  requireVerifiedForGlobal: boolean
  allowManualAtAll: boolean
  isVerifiedLeaderboard: boolean
}

/**
 * Check if a discipline allows the current entry type
 *
 * v4.2: Now supports per-scope MinVerificationTier (minTierGlobal, minTierCountry, etc.)
 * Falls back to legacy requireVerifiedForGlobal/allowManualAtAll for backwards compat.
 */
export function isEligibleForLeaderboard(
  discipline: {
    requireVerifiedForGlobal: boolean
    allowManualAtAll: boolean
    // v4.2 per-scope min tiers
    minTierGlobal?: MinVerificationTier
    minTierCountry?: MinVerificationTier
    minTierCity?: MinVerificationTier
    minTierTeam?: MinVerificationTier
  },
  source: BenchmarkSource,
  scope: "GLOBAL" | "COUNTRY" | "CITY" | "FRIENDS" | "TEAM"
): boolean {
  // v4.2: If discipline has per-scope min tiers, use the new system
  if (discipline.minTierGlobal !== undefined) {
    const disciplineWithTiers = {
      minTierGlobal: discipline.minTierGlobal,
      minTierCountry: discipline.minTierCountry ?? discipline.minTierGlobal,
      minTierCity: discipline.minTierCity ?? discipline.minTierGlobal,
      minTierTeam: discipline.minTierTeam ?? 'ANY' as MinVerificationTier,
    }

    // Map FRIENDS to TEAM for tier lookup
    const rankingScope = scope === 'FRIENDS' ? 'TEAM' : scope
    return isEligibleForScope(source, rankingScope as RankingScope, disciplineWithTiers)
  }

  // Legacy fallback for disciplines without v4.2 tier fields
  const isVerified = isVerifiedSource(source)

  // If manual entries aren't allowed at all, must be verified
  if (!discipline.allowManualAtAll && !isVerified) {
    return false
  }

  // If global scope requires verified entries
  if (scope === "GLOBAL" && discipline.requireVerifiedForGlobal && !isVerified) {
    return false
  }

  return true
}

/**
 * Legacy compatibility wrapper - checks by isVerified boolean instead of source
 * @deprecated Use isEligibleForLeaderboard with source parameter instead
 */
export function isEligibleForLeaderboardLegacy(
  discipline: {
    requireVerifiedForGlobal: boolean
    allowManualAtAll: boolean
  },
  isVerified: boolean,
  scope: "GLOBAL" | "COUNTRY" | "CITY" | "FRIENDS"
): boolean {
  // Map isVerified boolean to source
  const source = isVerified ? BenchmarkSource.IMPORT_STRAVA : BenchmarkSource.MANUAL
  return isEligibleForLeaderboard(discipline, source, scope)
}

/**
 * Get leaderboard for a discipline with optional scope filtering
 * Supports eligibility filtering based on discipline configuration
 */
export async function getDisciplineLeaderboard(
  disciplineId: string,
  options: {
    scope?: "GLOBAL" | "COUNTRY" | "CITY" | "FRIENDS"
    scopeValue?: string
    userId?: string // For friends scope
    limit?: number
    offset?: number
    verifiedOnly?: boolean // Force verified-only entries
  } = {}
): Promise<{ entries: LeaderboardEntry[]; totalCount: number; metadata: LeaderboardMetadata }> {
  const { scope = "GLOBAL", scopeValue, userId, limit = 50, offset = 0, verifiedOnly } = options

  const discipline = await prisma.discipline.findUnique({
    where: { id: disciplineId },
  })

  if (!discipline) {
    return {
      entries: [],
      totalCount: 0,
      metadata: {
        disciplineId,
        disciplineName: "",
        fairnessBadge: "STANDARD",
        verificationBadge: "MIXED",
        requireVerifiedForGlobal: false,
        allowManualAtAll: true,
        isVerifiedLeaderboard: false,
      },
    }
  }

  // Determine if this leaderboard should be verified-only
  const isVerifiedLeaderboard = verifiedOnly ??
    (scope === "GLOBAL" && discipline.requireVerifiedForGlobal)

  const metadata: LeaderboardMetadata = {
    disciplineId,
    disciplineName: discipline.name,
    fairnessBadge: discipline.fairnessBadge,
    verificationBadge: discipline.verificationBadge,
    requireVerifiedForGlobal: discipline.requireVerifiedForGlobal,
    allowManualAtAll: discipline.allowManualAtAll,
    isVerifiedLeaderboard,
  }

  // Build user filter based on scope
  const userFilter: any = {}

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

  // Calculate scores for each user with eligibility filtering
  const userScores: Array<{
    userId: string
    displayName: string
    avatarUrl: string | null
    score: number
    isVerified: boolean
    source: BenchmarkSource | null
  }> = []

  for (const user of users) {
    const result = await getDisciplineScore(user.id, disciplineId, {
      verifiedOnly: isVerifiedLeaderboard,
    })

    if (result.score !== null && result.score > 0) {
      // Check eligibility based on discipline configuration
      // Use source if available, otherwise map isVerified to a source
      const sourceForEligibility = result.source ?? (result.isVerified ? BenchmarkSource.IMPORT_STRAVA : BenchmarkSource.MANUAL)
      const eligible = isEligibleForLeaderboard(discipline, sourceForEligibility, scope)

      if (eligible) {
        userScores.push({
          userId: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          score: result.score,
          isVerified: result.isVerified,
          source: result.source,
        })
      }
    }
  }

  // Use competition ranking for proper ties handling ("1224" style)
  // Same scores get the same rank, next rank skips appropriately
  const rankedScores = assignCompetitionRanks(
    userScores,
    (entry) => entry.score,
    !discipline.lowerIsBetter // higherIsBetter is the inverse of lowerIsBetter
  )

  const totalCount = rankedScores.length

  // Apply pagination
  const paginatedScores = rankedScores.slice(offset, offset + limit)

  // Format scores and add ranks from competition ranking
  const entries: LeaderboardEntry[] = paginatedScores.map((rankedEntry) => ({
    rank: rankedEntry.rank,
    userId: rankedEntry.entry.userId,
    displayName: rankedEntry.entry.displayName,
    avatarUrl: rankedEntry.entry.avatarUrl,
    score: rankedEntry.entry.score,
    formattedScore: formatScore(rankedEntry.entry.score, discipline.unit || "", discipline.primaryMetric),
    isVerified: rankedEntry.entry.isVerified,
    source: rankedEntry.entry.source,
    tiedWith: rankedEntry.tiedWith, // Number of other entries with same rank
  }))

  return { entries, totalCount, metadata }
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
 * Caches both verified-only and all-entries versions for eligible disciplines
 */
export async function cacheDisciplineLeaderboard(
  disciplineId: string,
  scope: string,
  scopeValue: string | null,
  verifiedOnly: boolean = false
): Promise<void> {
  const { entries, totalCount, metadata } = await getDisciplineLeaderboard(disciplineId, {
    scope: scope as "GLOBAL" | "COUNTRY" | "CITY",
    scopeValue: scopeValue || undefined,
    limit: 100,
    verifiedOnly,
  })

  await prisma.disciplineLeaderboardCache.upsert({
    where: {
      disciplineId_scope_scopeValue_verifiedOnly: {
        disciplineId,
        scope,
        scopeValue: scopeValue ?? "",
        verifiedOnly,
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
      verifiedOnly,
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
  scopeValue: string | null,
  verifiedOnly: boolean = false
): Promise<{ entries: LeaderboardEntry[]; totalCount: number; cachedAt: Date } | null> {
  const cached = await prisma.disciplineLeaderboardCache.findUnique({
    where: {
      disciplineId_scope_scopeValue_verifiedOnly: {
        disciplineId,
        scope,
        scopeValue: scopeValue ?? "",
        verifiedOnly,
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
 * Caches both verified-only and all-entries versions for disciplines that require it
 */
export async function recalculateAllDisciplineRankings(): Promise<void> {
  console.log("🏆 Recalculating all discipline rankings...")

  // Get all active ranked disciplines
  const disciplines = await prisma.discipline.findMany({
    where: { isActive: true, isRanked: true },
  })

  for (const discipline of disciplines) {
    console.log(`  Processing: ${discipline.name} [${discipline.fairnessBadge}/${discipline.verificationBadge}]`)

    // Cache global leaderboard (both verified and all if applicable)
    await cacheDisciplineLeaderboard(discipline.id, "GLOBAL", null, false)

    // If discipline requires verified for global, also cache verified-only version
    if (discipline.requireVerifiedForGlobal) {
      await cacheDisciplineLeaderboard(discipline.id, "GLOBAL", null, true)
    }

    // Cache country leaderboards
    const countries = await prisma.user.findMany({
      where: { country: { not: null } },
      distinct: ["country"],
      select: { country: true },
    })

    for (const { country } of countries) {
      if (country) {
        await cacheDisciplineLeaderboard(discipline.id, "COUNTRY", country, false)
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
        await cacheDisciplineLeaderboard(discipline.id, "CITY", city, false)
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
      totalPower: score,
      activityScore: Math.min(1000, Math.round(score / 10)), // Scale to 0-1000
      activityCount,
      country: user?.country,
      city: user?.city,
    },
    create: {
      userId,
      asOfDate,
      windowDays: 28,
      totalPower: score,
      activityScore: Math.min(1000, Math.round(score / 10)), // Scale to 0-1000
      activityCount,
      country: user?.country,
      city: user?.city,
    },
  })

  return score
}
