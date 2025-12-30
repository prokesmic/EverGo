import { prisma } from "@/lib/db"
import { BenchmarkVerificationStatus } from "@prisma/client"
import { getBenchmark, formatBenchmarkValue, type BenchmarkDef } from "@/src/config/benchmarks"

export type LeaderboardScope = "global" | "country" | "city" | "club" | "team"

export type LeaderboardEntry = {
  rank: number
  userId: string
  username: string | null
  displayName: string
  avatarUrl: string | null
  value: number
  formattedValue: string
  achievedAt: Date
  source: string
  verified: boolean
  location: string | null
}

export type LeaderboardResult = {
  benchmark: {
    id: string
    name: string
    sportSlug: string
    kind: string
    unit: string
    better: string
  }
  entries: LeaderboardEntry[]
  total: number
  page: number
  limit: number
}

export type GetBenchmarkLeaderboardInput = {
  benchmarkId: string
  scope?: LeaderboardScope
  scopeValue?: string | null
  mode?: "valid" | "allTime"
  limit?: number
  offset?: number
}

/**
 * Get leaderboard for a specific benchmark, ranked by real values.
 *
 * - Queries UserBenchmarkBest for the best value per user per benchmark
 * - Sorts based on benchmark.better (lower or higher)
 * - Optionally filters by validity window
 */
export async function getBenchmarkLeaderboard(
  input: GetBenchmarkLeaderboardInput
): Promise<LeaderboardResult | null> {
  const {
    benchmarkId,
    scope = "global",
    scopeValue,
    mode = "valid",
    limit = 50,
    offset = 0,
  } = input

  // Get benchmark definition
  const benchmarkDef = getBenchmark(benchmarkId)
  if (!benchmarkDef) {
    return null
  }

  // Find the benchmark in DB to get its ID
  const dbBenchmark = await prisma.benchmarkDefinition.findFirst({
    where: {
      OR: [
        { id: benchmarkId },
        { slug: benchmarkId },
      ],
    },
  })

  if (!dbBenchmark) {
    return null
  }

  // Build where clause
  const whereClause: {
    benchmarkId: string
    achievedAt?: { gte: Date }
    user?: { country?: string; city?: string }
  } = {
    benchmarkId: dbBenchmark.id,
  }

  // Filter by validity window if mode is "valid"
  if (mode === "valid") {
    const validityMonths = benchmarkDef.validityMonths
    const cutoffDate = new Date()
    cutoffDate.setMonth(cutoffDate.getMonth() - validityMonths)
    whereClause.achievedAt = { gte: cutoffDate }
  }

  // Scope filtering (requires joining with User)
  const userWhere: { country?: string; city?: string } = {}
  if (scope === "country" && scopeValue) {
    userWhere.country = scopeValue
  } else if (scope === "city" && scopeValue) {
    userWhere.city = scopeValue
  }

  if (Object.keys(userWhere).length > 0) {
    whereClause.user = userWhere
  }

  // Determine sort direction
  const orderBy = benchmarkDef.better === "lower"
    ? { value: "asc" as const }
    : { value: "desc" as const }

  // Query leaderboard
  const entries = await prisma.userBenchmarkBest.findMany({
    where: whereClause,
    orderBy,
    skip: offset,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          city: true,
          country: true,
        },
      },
    },
  })

  // Get total count
  const total = await prisma.userBenchmarkBest.count({
    where: whereClause,
  })

  // Format entries
  const formattedEntries: LeaderboardEntry[] = entries.map((entry, index) => ({
    rank: offset + index + 1,
    userId: entry.userId,
    username: entry.user.username,
    displayName: entry.user.displayName,
    avatarUrl: entry.user.avatarUrl,
    value: entry.value,
    formattedValue: formatBenchmarkValue(entry.value, benchmarkDef),
    achievedAt: entry.achievedAt,
    source: entry.source,
    verified: entry.verificationStatus !== BenchmarkVerificationStatus.UNVERIFIED,
    location: entry.user.city || entry.user.country || null,
  }))

  return {
    benchmark: {
      id: benchmarkDef.id,
      name: benchmarkDef.name,
      sportSlug: benchmarkDef.sportSlug,
      kind: benchmarkDef.kind,
      unit: benchmarkDef.unit,
      better: benchmarkDef.better,
    },
    entries: formattedEntries,
    total,
    page: Math.floor(offset / limit) + 1,
    limit,
  }
}

/**
 * Get available benchmarks for a sport (from DB, not just config).
 */
export async function getBenchmarksForSportFromDb(sportSlug: string) {
  const sport = await prisma.sport.findUnique({
    where: { slug: sportSlug },
    include: {
      benchmarkDefinitions: {
        where: { isActive: true },
        orderBy: { rankWeight: "desc" },
      },
    },
  })

  if (!sport) return []

  return sport.benchmarkDefinitions.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    measurementType: b.measurementType,
    unit: b.unit,
    higherIsBetter: b.higherIsBetter,
    validityMonths: b.validityMonths,
  }))
}
