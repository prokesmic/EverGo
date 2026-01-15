/**
 * Redis Leaderboards (V12)
 *
 * Uses Upstash Redis sorted sets for instant leaderboard queries.
 * Provides incremental updates on activity log instead of batch cron.
 *
 * Key Format:
 * lb:{sportSlug}:{metricKey}:{range}:{scope}:{scopeValue?}
 *
 * Example Keys:
 * - lb:running:pace_5k:all_time:global
 * - lb:cycling:power_ftp:all_time:country:US
 * - lb:all:sport_index:weekly:city:Prague
 */

import { Redis } from "@upstash/redis"
import { isFlagEnabled } from "@/lib/flags"
import { prisma } from "@/lib/db"

// =============================================================================
// CONFIGURATION
// =============================================================================

// Initialize Redis client (lazy)
let redisClient: Redis | null = null

function getRedis(): Redis | null {
  if (!isFlagEnabled("REDIS_LEADERBOARDS_V1")) {
    return null
  }

  if (redisClient) return redisClient

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    console.warn("[Redis] UPSTASH_REDIS_REST_URL or TOKEN not configured")
    return null
  }

  redisClient = new Redis({ url, token })
  return redisClient
}

// Key configuration
export const REDIS_CONFIG = {
  /** Key prefix for all leaderboards */
  prefix: "lb",
  /** TTL for cached entries (7 days) */
  ttlSeconds: 7 * 24 * 60 * 60,
  /** Maximum entries to keep per leaderboard */
  maxEntries: 10000,
}

// =============================================================================
// TYPES
// =============================================================================

export type LeaderboardScope = "global" | "country" | "city" | "friends" | "team"
export type LeaderboardRange = "all_time" | "weekly" | "monthly" | "yearly"

export interface LeaderboardEntry {
  userId: string
  score: number
  rank: number
}

export interface LeaderboardKey {
  sportSlug: string
  metricKey: string
  range: LeaderboardRange
  scope: LeaderboardScope
  scopeValue?: string
}

// =============================================================================
// KEY UTILITIES
// =============================================================================

/**
 * Build Redis key from components
 */
export function buildKey(params: LeaderboardKey): string {
  const parts = [
    REDIS_CONFIG.prefix,
    params.sportSlug,
    params.metricKey,
    params.range,
    params.scope,
  ]
  if (params.scopeValue) {
    parts.push(params.scopeValue.toLowerCase().replace(/\s+/g, "_"))
  }
  return parts.join(":")
}

/**
 * Parse key back to components
 */
export function parseKey(key: string): LeaderboardKey | null {
  const parts = key.split(":")
  if (parts.length < 5) return null

  return {
    sportSlug: parts[1],
    metricKey: parts[2],
    range: parts[3] as LeaderboardRange,
    scope: parts[4] as LeaderboardScope,
    scopeValue: parts[5],
  }
}

// =============================================================================
// CORE OPERATIONS
// =============================================================================

/**
 * Set a user's score in a leaderboard
 */
export async function setScore(
  params: LeaderboardKey,
  userId: string,
  score: number
): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    const key = buildKey(params)
    await redis.zadd(key, { score, member: userId })
    await redis.expire(key, REDIS_CONFIG.ttlSeconds)
    return true
  } catch (error) {
    console.error("[Redis] setScore error:", error)
    return false
  }
}

/**
 * Get a user's rank in a leaderboard
 */
export async function getRank(
  params: LeaderboardKey,
  userId: string
): Promise<number | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const key = buildKey(params)
    // ZREVRANK gives 0-indexed rank (highest score = rank 0)
    const rank = await redis.zrevrank(key, userId)
    return rank !== null ? rank + 1 : null // Convert to 1-indexed
  } catch (error) {
    console.error("[Redis] getRank error:", error)
    return null
  }
}

/**
 * Get a user's score in a leaderboard
 */
export async function getScore(
  params: LeaderboardKey,
  userId: string
): Promise<number | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const key = buildKey(params)
    const score = await redis.zscore(key, userId)
    return score
  } catch (error) {
    console.error("[Redis] getScore error:", error)
    return null
  }
}

/**
 * Get entries around a user (±N positions)
 */
export async function getAround(
  params: LeaderboardKey,
  userId: string,
  range: number = 2
): Promise<LeaderboardEntry[]> {
  const redis = getRedis()
  if (!redis) return []

  try {
    const key = buildKey(params)
    const rank = await redis.zrevrank(key, userId)

    if (rank === null) return []

    const start = Math.max(0, rank - range)
    const stop = rank + range

    // Get entries in range (Upstash uses ZRANGE with REV option)
    const results = await redis.zrange(key, start, stop, { rev: true, withScores: true })

    const entries: LeaderboardEntry[] = []
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        userId: results[i] as string,
        score: results[i + 1] as number,
        rank: start + (i / 2) + 1,
      })
    }

    return entries
  } catch (error) {
    console.error("[Redis] getAround error:", error)
    return []
  }
}

/**
 * Get top N entries
 */
export async function getTop(
  params: LeaderboardKey,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  const redis = getRedis()
  if (!redis) return []

  try {
    const key = buildKey(params)
    const results = await redis.zrange(key, 0, limit - 1, { rev: true, withScores: true })

    const entries: LeaderboardEntry[] = []
    for (let i = 0; i < results.length; i += 2) {
      entries.push({
        userId: results[i] as string,
        score: results[i + 1] as number,
        rank: (i / 2) + 1,
      })
    }

    return entries
  } catch (error) {
    console.error("[Redis] getTop error:", error)
    return []
  }
}

/**
 * Remove a user from a leaderboard
 */
export async function removeUser(
  params: LeaderboardKey,
  userId: string
): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    const key = buildKey(params)
    await redis.zrem(key, userId)
    return true
  } catch (error) {
    console.error("[Redis] removeUser error:", error)
    return false
  }
}

/**
 * Get total count in a leaderboard
 */
export async function getCount(params: LeaderboardKey): Promise<number> {
  const redis = getRedis()
  if (!redis) return 0

  try {
    const key = buildKey(params)
    return await redis.zcard(key)
  } catch (error) {
    console.error("[Redis] getCount error:", error)
    return 0
  }
}

// =============================================================================
// INCREMENTAL UPDATE
// =============================================================================

/**
 * Update leaderboards after an activity is logged
 *
 * Called from activity creation/update handlers.
 */
export async function updateLeaderboardsForActivity(
  userId: string,
  sportSlug: string,
  metrics: Record<string, number>
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  // Get user's location for scoped leaderboards
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { countryCode: true, cityName: true },
  })

  const scopes: Array<{ scope: LeaderboardScope; scopeValue?: string }> = [
    { scope: "global" },
  ]

  if (user?.countryCode) {
    scopes.push({ scope: "country", scopeValue: user.countryCode })
  }
  if (user?.cityName) {
    scopes.push({ scope: "city", scopeValue: user.cityName })
  }

  // Update each metric in each scope
  for (const [metricKey, score] of Object.entries(metrics)) {
    for (const { scope, scopeValue } of scopes) {
      await setScore(
        {
          sportSlug,
          metricKey,
          range: "all_time",
          scope,
          scopeValue,
        },
        userId,
        score
      )
    }
  }
}

/**
 * Refresh user's position across all their relevant leaderboards
 */
export async function refreshUserLeaderboards(userId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  // Get user's stats and sports
  const [userStats, userSports] = await Promise.all([
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        sportIndex: true,
        multisportIndex: true,
        globalRank: true,
      },
    }),
    prisma.userSport.findMany({
      where: { userId, status: "ACTIVE" },
      select: { sport: { select: { slug: true } } },
    }),
  ])

  // Get user location
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { countryCode: true, cityName: true },
  })

  // Update sport index leaderboard
  if (userStats?.sportIndex) {
    const scopes: Array<{ scope: LeaderboardScope; scopeValue?: string }> = [
      { scope: "global" },
    ]
    if (user?.countryCode) scopes.push({ scope: "country", scopeValue: user.countryCode })
    if (user?.cityName) scopes.push({ scope: "city", scopeValue: user.cityName })

    for (const { scope, scopeValue } of scopes) {
      await setScore(
        { sportSlug: "all", metricKey: "sport_index", range: "all_time", scope, scopeValue },
        userId,
        userStats.sportIndex
      )
    }
  }

  // Update multisport index
  if (userStats?.multisportIndex) {
    await setScore(
      { sportSlug: "all", metricKey: "multisport_index", range: "all_time", scope: "global" },
      userId,
      userStats.multisportIndex
    )
  }
}

// =============================================================================
// FALLBACK TO SQL
// =============================================================================

/**
 * Get leaderboard with SQL fallback
 */
export async function getLeaderboardWithFallback(
  params: LeaderboardKey,
  limit: number = 100
): Promise<LeaderboardEntry[]> {
  // Try Redis first
  if (isFlagEnabled("REDIS_LEADERBOARDS_V1")) {
    const redisEntries = await getTop(params, limit)
    if (redisEntries.length > 0) {
      return redisEntries
    }
  }

  // Fallback to SQL (simplified - you'd implement proper SQL queries)
  console.log("[Redis] Falling back to SQL for leaderboard:", buildKey(params))

  // This would be replaced with actual SQL query based on params
  // For now, return empty - the existing ranking system handles this
  return []
}

// =============================================================================
// RECONCILIATION
// =============================================================================

/**
 * Reconcile Redis leaderboard with database
 *
 * Run periodically (e.g., daily) to fix any drift.
 */
export async function reconcileLeaderboard(params: LeaderboardKey): Promise<{
  added: number
  updated: number
  removed: number
}> {
  const redis = getRedis()
  if (!redis) return { added: 0, updated: 0, removed: 0 }

  // This would compare Redis entries with database and fix differences
  // Implementation depends on how metrics are stored in DB

  console.log("[Redis] Reconciliation for:", buildKey(params))

  return { added: 0, updated: 0, removed: 0 }
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * Check if Redis is available and working
 */
export async function healthCheck(): Promise<{
  available: boolean
  latencyMs: number
  error?: string
}> {
  const redis = getRedis()
  if (!redis) {
    return {
      available: false,
      latencyMs: 0,
      error: "Redis not configured or REDIS_LEADERBOARDS_V1 flag disabled",
    }
  }

  const start = Date.now()
  try {
    await redis.ping()
    return {
      available: true,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    return {
      available: false,
      latencyMs: Date.now() - start,
      error: String(error),
    }
  }
}
