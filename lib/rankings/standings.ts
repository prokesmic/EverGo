/**
 * User Standings
 *
 * Fetches user's benchmark standings with percentile calculations.
 * Supports both VERIFIED and COMMUNITY leaderboard modes.
 */

import { prisma } from "@/lib/db"
import type { LeaderboardMode, RankingScope, UserStanding, StandingsResponse } from "./types"
import { calculatePercentile } from "./percentile"
import type { BenchmarkSource } from "@prisma/client"

interface GetUserStandingsParams {
  userId: string
  sportId?: string
  scope?: RankingScope
  mode?: LeaderboardMode
  limit?: number
}

/**
 * Check if source is non-manual (for VERIFIED mode)
 */
function isNonManualSource(source: BenchmarkSource): boolean {
  return source !== "MANUAL"
}

/**
 * Get user's standings across their benchmarks
 */
export async function getUserStandings({
  userId,
  sportId,
  scope = "global",
  mode = "VERIFIED",
  limit = 10,
}: GetUserStandingsParams): Promise<StandingsResponse> {
  // Get user with their stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stats: true,
    },
  })

  if (!user) {
    return {
      standings: [],
      sportIndex: 0,
      sportIndexDelta7d: 0,
      mode,
    }
  }

  // Get user's benchmark bests
  const benchmarkBests = await prisma.userBenchmarkBest.findMany({
    where: {
      userId,
      ...(sportId && {
        benchmark: { sportId }
      }),
    },
    include: {
      benchmark: {
        include: {
          sport: true,
        },
      },
    },
    orderBy: { achievedAt: "desc" },
    take: limit * 2, // Fetch extra to account for filtered entries
  })

  // Calculate standings for each benchmark
  const standings: UserStanding[] = []

  for (const best of benchmarkBests) {
    // Filter based on mode
    if (mode === "VERIFIED" && !isNonManualSource(best.source)) {
      continue
    }

    // Get total count for this benchmark in scope
    const whereClause: Record<string, unknown> = {
      benchmarkId: best.benchmarkId,
    }

    // Add mode-specific filter
    if (mode === "VERIFIED") {
      whereClause.source = { not: "MANUAL" }
    }

    // Add scope-specific filter
    if (scope === "country" && user.countryCode) {
      whereClause.user = { countryCode: user.countryCode }
    } else if (scope === "city" && user.cityId) {
      whereClause.user = { cityId: user.cityId }
    }

    const totalInScope = await prisma.userBenchmarkBest.count({
      where: whereClause,
    })

    if (totalInScope === 0) continue

    // Get rank using standard competition ranking
    const betterClause = {
      ...whereClause,
      value: best.benchmark.higherIsBetter
        ? { gt: best.value }
        : { lt: best.value },
    }

    const betterCount = await prisma.userBenchmarkBest.count({
      where: betterClause,
    })

    const rank = betterCount + 1
    const percentile = calculatePercentile(rank, totalInScope)

    // Map BenchmarkSource to VerificationSource for compatibility
    // Since BenchmarkSource and VerificationSource differ, we use MANUAL as fallback
    const verificationSource = best.source === "MANUAL" ? "MANUAL" : "STRAVA"

    standings.push({
      disciplineId: best.benchmarkId,
      disciplineName: best.benchmark.name,
      sportName: best.benchmark.sport.name,
      value: best.value,
      unit: best.benchmark.unit,
      percentile,
      rank,
      totalInScope,
      isVerified: isNonManualSource(best.source),
      verificationSource: verificationSource as any,
      achievedAt: best.achievedAt,
    })

    // Stop if we have enough
    if (standings.length >= limit) break
  }

  // Sort by percentile (best first)
  standings.sort((a, b) => b.percentile - a.percentile)

  return {
    standings: standings.slice(0, limit),
    sportIndex: user.stats?.sportIndex ?? 0,
    sportIndexDelta7d: user.stats?.sportIndexDelta7d ?? 0,
    mode,
  }
}

/**
 * Get quick summary of user's best standings
 * Returns the user's highest percentile standing for display
 */
export async function getUserBestStanding(
  userId: string,
  mode: LeaderboardMode = "VERIFIED"
): Promise<UserStanding | null> {
  const { standings } = await getUserStandings({
    userId,
    mode,
    limit: 1,
  })

  return standings[0] ?? null
}
