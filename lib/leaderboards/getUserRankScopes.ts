import { prisma } from "@/lib/db"
import { unstable_cache } from "next/cache"

export type RankScopeData = {
  rank: number | null
  total: number
  score: number | null
  label: string
  scopeValue?: string // Country name, city name, or team name
  missingField?: "country" | "city" | "team" // If rank is null, what to fix
}

export type UserRankScopes = {
  global: RankScopeData
  country: RankScopeData
  city: RankScopeData
  team: RankScopeData
}

type UserContext = {
  id: string
  country: string | null
  city: string | null
  sportIndex: number
  primaryTeamId: string | null
  primaryTeamName: string | null
}

/**
 * Get user context (location, score, team) for rank calculation
 */
async function getUserContext(userId: string): Promise<UserContext | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      country: true,
      city: true,
      stats: {
        select: { sportIndex: true },
      },
      teamMemberships: {
        take: 1,
        orderBy: { joinedAt: "asc" },
        include: {
          team: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })

  if (!user) return null

  return {
    id: user.id,
    country: user.country,
    city: user.city,
    sportIndex: user.stats?.sportIndex ?? 0,
    primaryTeamId: user.teamMemberships[0]?.team?.id ?? null,
    primaryTeamName: user.teamMemberships[0]?.team?.name ?? null,
  }
}

/**
 * Count users with higher score (for rank calculation)
 * Returns rank as (count + 1)
 */
async function computeRank(
  score: number,
  whereFilter: Record<string, unknown>
): Promise<{ rank: number; total: number }> {
  const [higherCount, total] = await Promise.all([
    prisma.userStats.count({
      where: {
        sportIndex: { gt: score },
        user: {
          privacyLevel: { not: "PRIVATE" },
          ...whereFilter,
        },
      },
    }),
    prisma.userStats.count({
      where: {
        sportIndex: { gt: 0 },
        user: {
          privacyLevel: { not: "PRIVATE" },
          ...whereFilter,
        },
      },
    }),
  ])

  return { rank: higherCount + 1, total }
}

/**
 * Get all 4 ranks for a user in a single efficient call
 * Cached for 60 seconds to reduce DB load
 */
async function _getUserRankScopes(userId: string): Promise<UserRankScopes> {
  const ctx = await getUserContext(userId)

  // Default response for missing user
  const defaultScope = (label: string, missingField?: "country" | "city" | "team"): RankScopeData => ({
    rank: null,
    total: 0,
    score: null,
    label,
    missingField,
  })

  if (!ctx || ctx.sportIndex === 0) {
    return {
      global: defaultScope("Global"),
      country: defaultScope("Country", "country"),
      city: defaultScope("City", "city"),
      team: defaultScope("Team", "team"),
    }
  }

  // Parallel rank calculations
  const [globalRank, countryRank, cityRank, teamRank] = await Promise.all([
    // GLOBAL: No filter
    computeRank(ctx.sportIndex, {}),

    // COUNTRY: Filter by user's country
    ctx.country
      ? computeRank(ctx.sportIndex, { country: ctx.country })
      : Promise.resolve(null),

    // CITY: Filter by user's city (and country for disambiguation)
    ctx.city
      ? computeRank(ctx.sportIndex, { city: ctx.city, country: ctx.country })
      : Promise.resolve(null),

    // TEAM: Filter by team members
    ctx.primaryTeamId
      ? (async () => {
          const members = await prisma.teamMember.findMany({
            where: { teamId: ctx.primaryTeamId! },
            select: { userId: true },
          })
          const memberIds = members.map((m) => m.userId)
          return computeRank(ctx.sportIndex, { id: { in: memberIds } })
        })()
      : Promise.resolve(null),
  ])

  return {
    global: {
      rank: globalRank.rank,
      total: globalRank.total,
      score: ctx.sportIndex,
      label: "Global",
    },
    country: countryRank
      ? {
          rank: countryRank.rank,
          total: countryRank.total,
          score: ctx.sportIndex,
          label: "Country",
          scopeValue: ctx.country ?? undefined,
        }
      : defaultScope("Country", "country"),
    city: cityRank
      ? {
          rank: cityRank.rank,
          total: cityRank.total,
          score: ctx.sportIndex,
          label: "City",
          scopeValue: ctx.city ?? undefined,
        }
      : defaultScope("City", "city"),
    team: teamRank
      ? {
          rank: teamRank.rank,
          total: teamRank.total,
          score: ctx.sportIndex,
          label: "Team",
          scopeValue: ctx.primaryTeamName ?? undefined,
        }
      : defaultScope("Team", "team"),
  }
}

/**
 * Cached version - revalidates every 60 seconds
 */
export const getUserRankScopes = unstable_cache(
  _getUserRankScopes,
  ["user-rank-scopes"],
  { revalidate: 60 }
)
