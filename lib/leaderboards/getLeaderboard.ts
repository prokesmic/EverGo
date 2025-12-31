import { prisma } from "@/lib/db"
import { resolveScopeWhere, type ScopeInput } from "./scope"
import { getMetricMeta, type MetricKey, type MetricMeta } from "./metrics"

export type LeaderboardRow = {
  userId: string
  displayName: string
  avatarUrl: string | null
  value: number
  formattedValue: string
  rank: number
}

export type LeaderboardResult = {
  meta: MetricMeta
  top: LeaderboardRow[]
  me: LeaderboardRow | null
  delta: number | null // positive = improved, negative = dropped
  total: number
  scopeLabel: string
}

type UserWithValue = {
  userId: string
  displayName: string
  avatarUrl: string | null
  value: number
}

/**
 * Load metric values for users based on metricKey
 * Maps metricKey to the appropriate data source
 */
async function loadMetricValues(
  metricKey: MetricKey,
  whereUser: Record<string, unknown>
): Promise<UserWithValue[]> {
  const meta = getMetricMeta(metricKey)

  // Activity Score (Sport Index) - from UserStats
  if (metricKey === "activity:score") {
    const users = await prisma.user.findMany({
      where: {
        ...whereUser,
        privacyLevel: { not: "PRIVATE" },
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        stats: {
          select: { sportIndex: true },
        },
      },
      take: 5000,
    })

    return users
      .filter((u) => u.stats?.sportIndex && u.stats.sportIndex > 0)
      .map((u) => ({
        userId: u.id,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        value: u.stats?.sportIndex ?? 0,
      }))
  }

  // Activity Effort Score (30-day) - from UserActivityScore
  if (metricKey === "activity:effort") {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const scores = await prisma.userActivityScore.findMany({
      where: {
        asOfDate: { gte: thirtyDaysAgo },
        user: {
          ...whereUser,
          privacyLevel: { not: "PRIVATE" },
        },
      },
      select: {
        userId: true,
        activityScore: true,
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { asOfDate: "desc" },
      take: 5000,
    })

    // Dedupe by user (take latest)
    const byUser = new Map<string, UserWithValue>()
    for (const s of scores) {
      if (!byUser.has(s.userId) && s.activityScore > 0) {
        byUser.set(s.userId, {
          userId: s.userId,
          displayName: s.user.displayName,
          avatarUrl: s.user.avatarUrl,
          value: s.activityScore,
        })
      }
    }

    return Array.from(byUser.values())
  }

  // Benchmark-based metrics - from UserBenchmarkBest
  // Extract sport and benchmark from metricKey (e.g., "running:5k_time")
  const [sport, benchmark] = metricKey.split(":")
  if (sport && benchmark) {
    // Find matching benchmark definition
    const benchmarkDef = await prisma.benchmarkDefinition.findFirst({
      where: {
        slug: benchmark,
        sport: { slug: sport },
        isActive: true,
      },
    })

    if (benchmarkDef) {
      const bests = await prisma.userBenchmarkBest.findMany({
        where: {
          benchmarkId: benchmarkDef.id,
          user: {
            ...whereUser,
            privacyLevel: { not: "PRIVATE" },
          },
        },
        select: {
          userId: true,
          value: true,
          user: {
            select: {
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        take: 5000,
      })

      return bests
        .filter((b) => b.value > 0)
        .map((b) => ({
          userId: b.userId,
          displayName: b.user.displayName,
          avatarUrl: b.user.avatarUrl,
          value: b.value,
        }))
    }
  }

  // Fallback: No data for unknown metric
  return []
}

/**
 * Main leaderboard query function
 * Returns top N users + viewer's rank + delta
 */
export async function getLeaderboard(params: {
  viewerId: string
  metricKey: MetricKey
  scope: ScopeInput
  limit?: number
}): Promise<LeaderboardResult> {
  const { viewerId, metricKey, scope, limit = 20 } = params
  const meta = getMetricMeta(metricKey)

  // Resolve scope to user filter
  const { whereUser, scopeKey, scopeLabel } = await resolveScopeWhere(
    viewerId,
    scope
  )

  // Load raw values
  const values = await loadMetricValues(metricKey, whereUser)

  // Sort by metric (ASC for time-based, DESC for score-based)
  values.sort((a, b) =>
    meta.order === "ASC" ? a.value - b.value : b.value - a.value
  )

  // Assign ranks (dense ranking - ties share same rank)
  const rows: LeaderboardRow[] = []
  let rank = 0
  let lastVal: number | null = null

  for (const v of values) {
    if (lastVal === null || v.value !== lastVal) {
      rank += 1
      lastVal = v.value
    }
    rows.push({
      ...v,
      formattedValue: meta.formatValue(v.value),
      rank,
    })
  }

  // Get top N
  const top = rows.slice(0, limit)

  // Find viewer's rank
  const me = rows.find((r) => r.userId === viewerId) ?? null

  // Calculate delta from last known rank
  let delta: number | null = null

  if (me) {
    try {
      const prev = await prisma.userRankState.findUnique({
        where: {
          userId_metricKey_scopeKey: {
            userId: viewerId,
            metricKey,
            scopeKey,
          },
        },
        select: { lastRank: true },
      })

      if (prev?.lastRank) {
        delta = prev.lastRank - me.rank // positive = improved
      }

      // Update stored rank
      await prisma.userRankState.upsert({
        where: {
          userId_metricKey_scopeKey: {
            userId: viewerId,
            metricKey,
            scopeKey,
          },
        },
        create: {
          userId: viewerId,
          metricKey,
          scopeKey,
          lastRank: me.rank,
        },
        update: {
          lastRank: me.rank,
        },
      })
    } catch (error) {
      // Ignore errors with rank state - non-critical
      console.warn("Failed to update rank state:", error)
    }
  }

  return {
    meta,
    top,
    me,
    delta,
    total: rows.length,
    scopeLabel,
  }
}
