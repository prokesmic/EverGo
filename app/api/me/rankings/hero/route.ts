import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { z } from "zod"
import type { RankMetric, RankScope } from "@/lib/rankings/rankLens"

// =============================================================================
// TYPES
// =============================================================================

type RankCard = {
  scope: RankScope
  label: string
  rank: number | null
  total: number | null
  needsSetup?: "COUNTRY" | "CITY" | "TEAM"
  scopeValue?: string | null
}

type HeroRanksResponse = {
  lens: {
    metric: RankMetric
    sportId: string | null
    disciplineId: string | null
  }
  labels: {
    sportName: string
    disciplineName: string | null
  }
  kpis: {
    sportIndex: number
    fitnessScore: number
  }
  ranks: RankCard[]
}

// =============================================================================
// QUERY VALIDATION
// =============================================================================

const QuerySchema = z.object({
  metric: z.enum(["SPORT_INDEX", "FITNESS_SCORE"]).default("SPORT_INDEX"),
  sportId: z.string().nullable().optional(),
  disciplineId: z.string().nullable().optional(),
})

function parseNullable(v: string | null): string | null {
  if (!v) return null
  const t = v.trim()
  return t.length ? t : null
}

// =============================================================================
// FITNESS SCORE COMPUTATION
// =============================================================================

async function computeFitnessScore(userId: string): Promise<number> {
  const since = new Date(Date.now() - 28 * 24 * 3600 * 1000)

  const [acts, streak] = await Promise.all([
    prisma.activity.findMany({
      where: { userId, activityDate: { gte: since } },
      select: { activityDate: true, durationSeconds: true, avgHeartRate: true },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: { currentStreak: true },
    }).catch(() => null),
  ])

  const daysActive = new Set(
    acts.map((a) => a.activityDate.toISOString().slice(0, 10))
  ).size
  const totalMin = acts.reduce((s, a) => s + (a.durationSeconds ?? 0), 0) / 60

  // Frequency: up to 40 pts (10+ active days in 28d caps)
  const freq = Math.min(40, (daysActive / 10) * 40)

  // Volume: up to 35 pts (600 min in 28d caps ~ 2.5h/week)
  const vol = Math.min(35, (totalMin / 600) * 35)

  // Consistency: up to 15 pts
  const currentStreak = (streak as { currentStreak?: number } | null)?.currentStreak ?? 0
  const cons = Math.min(15, (currentStreak / 14) * 15)

  // Intensity: up to 10 pts (avg HR presence; if missing, neutral 5)
  const hrVals = acts
    .map((a) => a.avgHeartRate)
    .filter((x): x is number => typeof x === "number")
  const avgHr = hrVals.length
    ? hrVals.reduce((a, b) => a + b, 0) / hrVals.length
    : null
  const inten =
    avgHr == null ? 5 : Math.min(10, Math.max(0, ((avgHr - 90) / 70) * 10))

  return Math.round(freq + vol + cons + inten)
}

// =============================================================================
// RANK LOOKUP (from existing caches)
// =============================================================================

async function getRankFromSportIndexCache(args: {
  userId: string
  sportId: string | null
  scope: RankScope
  scopeValue: string | null
}): Promise<{ rank: number | null; total: number | null }> {
  try {
    // Prisma requires special handling for nullable unique keys
    const row = await prisma.rankingCache.findFirst({
      where: {
        sportId: args.sportId,
        scope: args.scope,
        scopeValue: args.scopeValue,
        period: "ALL_TIME",
      },
      select: { leaderboard: true, totalUsers: true },
    })

    if (!row) return { rank: null, total: null }

    const leaderboard: Array<{ userId: string; rank?: number }> = JSON.parse(
      row.leaderboard || "[]"
    )
    const idx = leaderboard.findIndex((x) => x.userId === args.userId)
    if (idx === -1) return { rank: null, total: row.totalUsers ?? null }

    const rank = leaderboard[idx].rank ?? idx + 1
    return { rank, total: row.totalUsers ?? null }
  } catch {
    return { rank: null, total: null }
  }
}

async function getRankFromDisciplineCache(args: {
  userId: string
  disciplineId: string
  scope: RankScope
  scopeValue: string | null
}): Promise<{ rank: number | null; total: number | null }> {
  try {
    // Prisma requires special handling for nullable unique keys
    const row = await prisma.disciplineLeaderboardCache.findFirst({
      where: {
        disciplineId: args.disciplineId,
        scope: args.scope,
        scopeValue: args.scopeValue,
      },
      select: { leaderboard: true, totalUsers: true },
    })

    if (!row) return { rank: null, total: null }

    const leaderboard: Array<{ userId: string; rank?: number }> = JSON.parse(
      row.leaderboard || "[]"
    )
    const idx = leaderboard.findIndex((x) => x.userId === args.userId)
    if (idx === -1) return { rank: null, total: row.totalUsers ?? null }

    const rank = leaderboard[idx].rank ?? idx + 1
    return { rank, total: row.totalUsers ?? null }
  } catch {
    return { rank: null, total: null }
  }
}

// =============================================================================
// MAIN API HANDLER
// =============================================================================

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const parsed = QuerySchema.safeParse({
    metric: url.searchParams.get("metric") ?? "SPORT_INDEX",
    sportId: parseNullable(url.searchParams.get("sportId")),
    disciplineId: parseNullable(url.searchParams.get("disciplineId")),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const userId = session.user.id
  const metric = parsed.data.metric as RankMetric
  const sportId = parsed.data.sportId ?? null
  const disciplineId = parsed.data.disciplineId ?? null

  // Fetch user context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      country: true,
      city: true,
      stats: { select: { sportIndex: true } },
      teamMemberships: {
        select: { team: { select: { id: true, name: true } } },
        take: 1,
        orderBy: { joinedAt: "asc" },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Fetch sport/discipline names and fitness score in parallel
  const [sport, discipline, fitnessScore] = await Promise.all([
    sportId
      ? prisma.sport.findUnique({
          where: { id: sportId },
          select: { name: true },
        })
      : null,
    disciplineId
      ? prisma.discipline.findUnique({
          where: { id: disciplineId },
          select: { name: true },
        })
      : null,
    computeFitnessScore(userId),
  ])

  const team = user?.teamMemberships?.[0]?.team ?? null

  // Scope values
  const country = user?.country ?? null
  const city = user?.city ?? null
  const teamId = team?.id ?? null

  // Pull ranks based on metric and lens
  // For discipline-specific, use DisciplineLeaderboardCache
  // For sport index, use RankingCache
  const getRank = disciplineId
    ? (scope: RankScope, scopeValue: string | null) =>
        getRankFromDisciplineCache({ userId, disciplineId, scope, scopeValue })
    : (scope: RankScope, scopeValue: string | null) =>
        getRankFromSportIndexCache({ userId, sportId, scope, scopeValue })

  const [g, c, ci, t] = await Promise.all([
    getRank("GLOBAL", null),
    country ? getRank("COUNTRY", country) : Promise.resolve({ rank: null, total: null }),
    city ? getRank("CITY", city) : Promise.resolve({ rank: null, total: null }),
    teamId ? getRank("TEAM", teamId) : Promise.resolve({ rank: null, total: null }),
  ])

  const ranks: RankCard[] = [
    { scope: "GLOBAL", label: "Global", rank: g.rank, total: g.total },
    {
      scope: "COUNTRY",
      label: "Country",
      rank: c.rank,
      total: c.total,
      needsSetup: country ? undefined : "COUNTRY",
      scopeValue: country,
    },
    {
      scope: "CITY",
      label: "City",
      rank: ci.rank,
      total: ci.total,
      needsSetup: city ? undefined : "CITY",
      scopeValue: city,
    },
    {
      scope: "TEAM",
      label: "Team",
      rank: t.rank,
      total: t.total,
      needsSetup: teamId ? undefined : "TEAM",
      scopeValue: team?.name ?? null,
    },
  ]

  const response: HeroRanksResponse = {
    lens: { metric, sportId, disciplineId },
    labels: {
      sportName: sport?.name ?? (sportId ? "Sport" : "Overall"),
      disciplineName: discipline?.name ?? null,
    },
    kpis: {
      sportIndex: user?.stats?.sportIndex ?? 0,
      fitnessScore,
    },
    ranks,
  }

  return NextResponse.json(response)
}
