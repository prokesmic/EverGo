/**
 * Next Tier Ghost
 *
 * Computes threshold values for tier advancement.
 * Shows users what they need to reach the next tier (Top 10%, Top 5%, etc.)
 */

import { prisma } from "@/lib/db"
import type { LeaderboardMode, RankingScope } from "./types"
import { isFlagEnabled } from "@/lib/flags"

// Tier thresholds as percentiles
const TIER_THRESHOLDS = [50, 25, 10, 5, 1] as const
type TierThreshold = (typeof TIER_THRESHOLDS)[number]

export interface NextTierGhost {
  targetTierPct: TierThreshold
  targetValue: number
  currentValue: number
  deltaToTarget: number // Positive = need to improve, negative = already there
  friendlyMessage: string
  isAchieved: boolean
}

export interface NextTierResult {
  ghost: NextTierGhost | null
  reason?: "not_enough_users" | "already_top" | "no_pb" | "disabled"
}

/**
 * Get the next tier ghost for a user's benchmark
 */
export async function getNextTierGhost(params: {
  userId: string
  benchmarkId: string
  scope?: RankingScope
  mode?: LeaderboardMode
}): Promise<NextTierResult> {
  const { userId, benchmarkId, scope = "global", mode = "COMMUNITY" } = params

  // Check feature flag
  if (!isFlagEnabled("enableNextTierGhost")) {
    return { ghost: null, reason: "disabled" }
  }

  // Get user's current PB
  const userBest = await prisma.userBenchmarkBest.findUnique({
    where: {
      userId_benchmarkId: { userId, benchmarkId },
    },
    include: {
      benchmark: true,
    },
  })

  if (!userBest) {
    return { ghost: null, reason: "no_pb" }
  }

  // Get benchmark definition
  const benchmark = userBest.benchmark
  const higherIsBetter = benchmark.higherIsBetter

  // Build eligibility filter
  const eligibilityFilter: Record<string, unknown> = {}
  if (mode === "VERIFIED") {
    eligibilityFilter.source = { not: "MANUAL" }
  }

  // Add scope-specific eligibility
  const eligibilityField = getEligibilityField(scope)
  eligibilityFilter[eligibilityField] = true

  // Count total eligible users
  const totalEligible = await prisma.userBenchmarkBest.count({
    where: {
      benchmarkId,
      ...eligibilityFilter,
      user: {
        privacyLevel: { not: "PRIVATE" },
      },
    },
  })

  // Need at least 30 users for meaningful tiers
  if (totalEligible < 30) {
    return { ghost: null, reason: "not_enough_users" }
  }

  // Get user's current rank
  const betterThan = higherIsBetter
    ? { gt: userBest.value }
    : { lt: userBest.value }

  const betterCount = await prisma.userBenchmarkBest.count({
    where: {
      benchmarkId,
      value: betterThan,
      ...eligibilityFilter,
      user: {
        privacyLevel: { not: "PRIVATE" },
      },
    },
  })

  const currentRank = betterCount + 1
  const currentPercentile = ((totalEligible - currentRank + 1) / totalEligible) * 100

  // Find the next tier to target
  const nextTier = TIER_THRESHOLDS.find((tier) => currentPercentile < tier)

  if (!nextTier) {
    // User is already in top 1%
    return { ghost: null, reason: "already_top" }
  }

  // Calculate what position the user needs to reach
  const targetPosition = Math.ceil(totalEligible * (1 - nextTier / 100))

  // Get the value at that position
  const targetEntry = await prisma.userBenchmarkBest.findFirst({
    where: {
      benchmarkId,
      ...eligibilityFilter,
      user: {
        privacyLevel: { not: "PRIVATE" },
      },
    },
    orderBy: {
      value: higherIsBetter ? "desc" : "asc",
    },
    skip: targetPosition - 1,
    take: 1,
  })

  if (!targetEntry) {
    return { ghost: null }
  }

  const targetValue = targetEntry.value
  const currentValue = userBest.value
  const deltaToTarget = higherIsBetter
    ? targetValue - currentValue
    : currentValue - targetValue

  // Format friendly message
  const friendlyMessage = formatGhostMessage(
    benchmark.measurementType,
    benchmark.unit,
    deltaToTarget,
    nextTier,
    higherIsBetter
  )

  return {
    ghost: {
      targetTierPct: nextTier,
      targetValue,
      currentValue,
      deltaToTarget,
      friendlyMessage,
      isAchieved: deltaToTarget <= 0,
    },
  }
}

function getEligibilityField(scope: RankingScope): string {
  switch (scope) {
    case "global":
      return "isEligibleGlobal"
    case "country":
      return "isEligibleCountry"
    case "city":
      return "isEligibleCity"
    case "team":
      return "isEligibleTeam"
    default:
      return "isEligibleGlobal"
  }
}

function formatGhostMessage(
  measurementType: string,
  unit: string,
  delta: number,
  targetTier: number,
  higherIsBetter: boolean
): string {
  if (delta <= 0) {
    return `You're in the Top ${targetTier}%!`
  }

  const absDelta = Math.abs(delta)
  let deltaStr: string

  switch (measurementType) {
    case "TIME":
      // Format as time
      if (absDelta >= 60) {
        const mins = Math.floor(absDelta / 60)
        const secs = Math.round(absDelta % 60)
        deltaStr = secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
      } else {
        deltaStr = `${Math.round(absDelta)}s`
      }
      break

    case "POWER_WKG":
    case "SPEED_KMH":
      deltaStr = `${absDelta.toFixed(1)} ${unit}`
      break

    case "DISTANCE_METERS":
      if (absDelta >= 1000) {
        deltaStr = `${(absDelta / 1000).toFixed(1)} km`
      } else {
        deltaStr = `${Math.round(absDelta)} m`
      }
      break

    default:
      deltaStr = `${Math.round(absDelta)} ${unit}`
  }

  const direction = higherIsBetter ? "+" : "-"
  return `${direction}${deltaStr} to reach Top ${targetTier}%`
}

/**
 * Get multiple tier ghosts for display
 */
export async function getAllTierGhosts(params: {
  userId: string
  benchmarkId: string
  scope?: RankingScope
  mode?: LeaderboardMode
}): Promise<NextTierGhost[]> {
  const result = await getNextTierGhost(params)

  if (!result.ghost) {
    return []
  }

  // For now, just return the next tier
  // Could be extended to show multiple upcoming tiers
  return [result.ghost]
}
