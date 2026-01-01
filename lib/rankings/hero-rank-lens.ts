import { prisma } from "@/lib/db"
import { unstable_cache } from "next/cache"

// ============================================================================
// TYPES
// ============================================================================

export type RankTileScope = "global" | "country" | "city" | "team"

export type RankTile = {
  scope: RankTileScope
  rank: number | null
  total: number
  value: number | null // User's score/value for this benchmark
  scopeValue?: string // "Czech Republic", "Prague", "Team A"
  missingField?: "country" | "city" | "team" // If rank is null, hint for user
}

export type BenchmarkOption = {
  id: string
  slug: string
  name: string // "5K", "Bench Press 1RM", "Max Jump"
  unit: string // "sec", "kg", "m"
  higherIsBetter: boolean
}

export type HeroRankLensSnapshot = {
  sport: {
    id: string
    name: string
    slug: string
  }
  benchmarks: BenchmarkOption[] // All benchmarks for this sport
  currentBenchmark: BenchmarkOption | null // null = Sport Index
  tiles: Record<RankTileScope, RankTile>
}

export type HeroRankLensParams = {
  userId: string
  sportId: string
  benchmarkId: string | null // null = Sport Index leaderboard
}

// ============================================================================
// USER CONTEXT
// ============================================================================

type UserContext = {
  id: string
  country: string | null
  city: string | null
  primaryTeamId: string | null
  primaryTeamName: string | null
}

async function getUserContext(userId: string): Promise<UserContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      country: true,
      city: true,
      teamMemberships: {
        take: 1,
        orderBy: { joinedAt: "asc" },
        include: {
          team: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!user) return null

  return {
    id: user.id,
    country: user.country,
    city: user.city,
    primaryTeamId: user.teamMemberships[0]?.team?.id ?? null,
    primaryTeamName: user.teamMemberships[0]?.team?.name ?? null,
  }
}

// ============================================================================
// SPORT INDEX RANKING (benchmarkId = null)
// ============================================================================

async function getSportIndexRankTiles(
  ctx: UserContext,
  sportId: string
): Promise<Record<RankTileScope, RankTile>> {
  // Get user's sport index
  const userStats = await prisma.userStats.findUnique({
    where: { userId: ctx.id },
    select: { sportIndex: true },
  })

  const userScore = userStats?.sportIndex ?? 0

  // Get team member IDs if user has a team
  let teamMemberIds: string[] = []
  if (ctx.primaryTeamId) {
    const members = await prisma.teamMember.findMany({
      where: { teamId: ctx.primaryTeamId },
      select: { userId: true },
    })
    teamMemberIds = members.map((m) => m.userId)
  }

  // Parallel rank calculations for all scopes
  const [globalRank, countryRank, cityRank, teamRank] = await Promise.all([
    // GLOBAL: All users who practice this sport
    computeSportIndexRank(userScore, sportId, {}),

    // COUNTRY
    ctx.country
      ? computeSportIndexRank(userScore, sportId, { country: ctx.country })
      : Promise.resolve(null),

    // CITY
    ctx.city
      ? computeSportIndexRank(userScore, sportId, { city: ctx.city, country: ctx.country })
      : Promise.resolve(null),

    // TEAM
    ctx.primaryTeamId && teamMemberIds.length > 0
      ? computeSportIndexRank(userScore, sportId, { id: { in: teamMemberIds } })
      : Promise.resolve(null),
  ])

  const defaultTile = (scope: RankTileScope, missingField?: "country" | "city" | "team"): RankTile => ({
    scope,
    rank: null,
    total: 0,
    value: null,
    missingField,
  })

  return {
    global: globalRank
      ? { scope: "global", rank: globalRank.rank, total: globalRank.total, value: userScore }
      : defaultTile("global"),
    country: countryRank
      ? { scope: "country", rank: countryRank.rank, total: countryRank.total, value: userScore, scopeValue: ctx.country ?? undefined }
      : defaultTile("country", "country"),
    city: cityRank
      ? { scope: "city", rank: cityRank.rank, total: cityRank.total, value: userScore, scopeValue: ctx.city ?? undefined }
      : defaultTile("city", "city"),
    team: teamRank
      ? { scope: "team", rank: teamRank.rank, total: teamRank.total, value: userScore, scopeValue: ctx.primaryTeamName ?? undefined }
      : defaultTile("team", "team"),
  }
}

async function computeSportIndexRank(
  score: number,
  _sportId: string, // Reserved for future sport-specific filtering
  userFilter: Record<string, unknown>
): Promise<{ rank: number; total: number } | null> {
  if (score <= 0) return null

  // For now, rank against all users globally (sport-specific filtering will be added later)
  // when we have UserSportStats or better sport-specific indexes
  const [higherCount, total] = await Promise.all([
    prisma.userStats.count({
      where: {
        sportIndex: { gt: score },
        user: {
          privacyLevel: { not: "PRIVATE" },
          ...userFilter,
        },
      },
    }),
    prisma.userStats.count({
      where: {
        sportIndex: { gt: 0 },
        user: {
          privacyLevel: { not: "PRIVATE" },
          ...userFilter,
        },
      },
    }),
  ])

  return { rank: higherCount + 1, total }
}

// ============================================================================
// BENCHMARK RANKING (specific benchmark)
// ============================================================================

async function getBenchmarkRankTiles(
  ctx: UserContext,
  benchmarkId: string
): Promise<Record<RankTileScope, RankTile>> {
  // Get benchmark definition to know if higher is better
  const benchmark = await prisma.benchmarkDefinition.findUnique({
    where: { id: benchmarkId },
    select: { higherIsBetter: true },
  })

  if (!benchmark) {
    return getDefaultTiles()
  }

  // Get user's best for this benchmark
  const userBest = await prisma.userBenchmarkBest.findUnique({
    where: {
      userId_benchmarkId: {
        userId: ctx.id,
        benchmarkId,
      },
    },
    select: { value: true },
  })

  const userValue = userBest?.value ?? null

  // Get team member IDs if user has a team
  let teamMemberIds: string[] = []
  if (ctx.primaryTeamId) {
    const members = await prisma.teamMember.findMany({
      where: { teamId: ctx.primaryTeamId },
      select: { userId: true },
    })
    teamMemberIds = members.map((m) => m.userId)
  }

  // Parallel rank calculations
  const [globalRank, countryRank, cityRank, teamRank] = await Promise.all([
    // GLOBAL
    userValue !== null
      ? computeBenchmarkRank(userValue, benchmarkId, benchmark.higherIsBetter, {})
      : Promise.resolve(null),

    // COUNTRY
    ctx.country && userValue !== null
      ? computeBenchmarkRank(userValue, benchmarkId, benchmark.higherIsBetter, { country: ctx.country })
      : Promise.resolve(null),

    // CITY
    ctx.city && userValue !== null
      ? computeBenchmarkRank(userValue, benchmarkId, benchmark.higherIsBetter, { city: ctx.city, country: ctx.country })
      : Promise.resolve(null),

    // TEAM
    ctx.primaryTeamId && teamMemberIds.length > 0 && userValue !== null
      ? computeBenchmarkRank(userValue, benchmarkId, benchmark.higherIsBetter, { id: { in: teamMemberIds } })
      : Promise.resolve(null),
  ])

  const defaultTile = (scope: RankTileScope, missingField?: "country" | "city" | "team"): RankTile => ({
    scope,
    rank: null,
    total: 0,
    value: userValue,
    missingField,
  })

  return {
    global: globalRank
      ? { scope: "global", rank: globalRank.rank, total: globalRank.total, value: userValue }
      : defaultTile("global"),
    country: countryRank
      ? { scope: "country", rank: countryRank.rank, total: countryRank.total, value: userValue, scopeValue: ctx.country ?? undefined }
      : defaultTile("country", ctx.country ? undefined : "country"),
    city: cityRank
      ? { scope: "city", rank: cityRank.rank, total: cityRank.total, value: userValue, scopeValue: ctx.city ?? undefined }
      : defaultTile("city", ctx.city ? undefined : "city"),
    team: teamRank
      ? { scope: "team", rank: teamRank.rank, total: teamRank.total, value: userValue, scopeValue: ctx.primaryTeamName ?? undefined }
      : defaultTile("team", ctx.primaryTeamId ? undefined : "team"),
  }
}

async function computeBenchmarkRank(
  value: number,
  benchmarkId: string,
  higherIsBetter: boolean,
  userFilter: Record<string, unknown>
): Promise<{ rank: number; total: number }> {
  // Count how many users have a better score
  const betterThan = higherIsBetter ? { gt: value } : { lt: value }

  const [betterCount, total] = await Promise.all([
    prisma.userBenchmarkBest.count({
      where: {
        benchmarkId,
        value: betterThan,
        user: {
          privacyLevel: { not: "PRIVATE" },
          ...userFilter,
        },
      },
    }),
    prisma.userBenchmarkBest.count({
      where: {
        benchmarkId,
        user: {
          privacyLevel: { not: "PRIVATE" },
          ...userFilter,
        },
      },
    }),
  ])

  return { rank: betterCount + 1, total }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

function getDefaultTiles(): Record<RankTileScope, RankTile> {
  return {
    global: { scope: "global", rank: null, total: 0, value: null },
    country: { scope: "country", rank: null, total: 0, value: null, missingField: "country" },
    city: { scope: "city", rank: null, total: 0, value: null, missingField: "city" },
    team: { scope: "team", rank: null, total: 0, value: null, missingField: "team" },
  }
}

async function _getHeroRankLensSnapshot(
  params: HeroRankLensParams
): Promise<HeroRankLensSnapshot> {
  const { userId, sportId, benchmarkId } = params

  // Get sport info and benchmarks in parallel with user context
  const [sport, benchmarks, userCtx] = await Promise.all([
    prisma.sport.findUnique({
      where: { id: sportId },
      select: { id: true, name: true, slug: true },
    }),
    prisma.benchmarkDefinition.findMany({
      where: { sportId, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        unit: true,
        higherIsBetter: true,
      },
      orderBy: { rankWeight: "desc" },
    }),
    getUserContext(userId),
  ])

  if (!sport) {
    throw new Error(`Sport not found: ${sportId}`)
  }

  // Find current benchmark if specified
  const currentBenchmark = benchmarkId
    ? benchmarks.find((b) => b.id === benchmarkId) ?? null
    : null

  // Get rank tiles based on whether we're showing Sport Index or a specific benchmark
  let tiles: Record<RankTileScope, RankTile>

  if (!userCtx) {
    tiles = getDefaultTiles()
  } else if (benchmarkId && currentBenchmark) {
    tiles = await getBenchmarkRankTiles(userCtx, benchmarkId)
  } else {
    tiles = await getSportIndexRankTiles(userCtx, sportId)
  }

  return {
    sport: {
      id: sport.id,
      name: sport.name,
      slug: sport.slug,
    },
    benchmarks,
    currentBenchmark,
    tiles,
  }
}

/**
 * Get hero rank lens snapshot - cached for 60 seconds
 *
 * @param params.userId - The user to get ranks for
 * @param params.sportId - The sport to filter rankings by
 * @param params.benchmarkId - Specific benchmark ID or null for Sport Index
 */
export const getHeroRankLensSnapshot = unstable_cache(
  _getHeroRankLensSnapshot,
  ["hero-rank-lens"],
  { revalidate: 60 }
)

/**
 * Get available benchmarks for a sport (for dropdown)
 */
export async function getSportBenchmarks(sportId: string): Promise<BenchmarkOption[]> {
  return prisma.benchmarkDefinition.findMany({
    where: { sportId, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      unit: true,
      higherIsBetter: true,
    },
    orderBy: { rankWeight: "desc" },
  })
}

/**
 * Get user's primary sport (most active sport by priority or first)
 */
export async function getUserPrimarySport(userId: string): Promise<{ id: string; name: string; slug: string } | null> {
  // Get user's primary sport (lowest priority = primary, null priority = secondary)
  const userSport = await prisma.userSport.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: [
      { priority: "asc" }, // 0 = Primary, 1+ = secondary
    ],
    include: {
      sport: {
        select: { id: true, name: true, slug: true },
      },
    },
  })

  return userSport?.sport ?? null
}
