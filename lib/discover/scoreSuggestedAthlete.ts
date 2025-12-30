/**
 * Unified scoring function for athlete suggestions
 * Deterministic scoring with explainability
 */

export type SuggestCandidate = {
  id: string
  displayName?: string | null
  avatarUrl?: string | null
  primarySport?: string | null
  sports?: string[] | null
  city?: string | null
  country?: string | null
  mutualCount?: number | null
  activities7d?: number | null
  activities30d?: number | null
  lastActivityAt?: Date | string | null
  sportIndex?: number | null
  hasAvatar?: boolean | null
  hasBio?: boolean | null
  hasPB?: boolean | null
  hasVerified?: boolean | null
  createdAt?: Date | string | null
}

export type UserProfile = {
  primarySport?: string | null
  sports?: string[] | null
  city?: string | null
  country?: string | null
  sportIndex?: number | null
}

export type ScoreContext = {
  topSportCounts: Record<string, number>
  topCityCounts: Record<string, number>
}

export type ScoringResult = {
  score: number
  reason: string
  breakdown: {
    sport: number
    mutual: number
    location: number
    activity: number
    similarity: number
    quality: number
    newUserBoost: number
    diversityPenalty: number
  }
}

function daysSince(d?: Date | string | null): number {
  if (!d) return 999
  const dt = typeof d === "string" ? new Date(d) : d
  const diff = Date.now() - dt.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Score a candidate athlete for recommendation
 *
 * Scoring breakdown:
 * - Sport match: 0-35 points (same primary = 35, overlap = 10-25)
 * - Mutual connections: 0-30 points (log curve)
 * - Location proximity: 0-15 points (same city = 15, same country = 6)
 * - Activity recency + volume: 0-20 points
 * - Similar level/competitiveness: 0-15 points
 * - Quality signals: 0-10 points (avatar, bio, PB, verified)
 * - New user boost: 0-6 points
 * - Diversity penalty: 0 to -25 points
 */
export function scoreSuggestedAthlete(
  me: UserProfile,
  u: SuggestCandidate,
  ctx: ScoreContext
): ScoringResult {
  // 1) Sport match (0-35)
  let sport = 0
  const mePrimary = me.primarySport ?? null
  const uPrimary = u.primarySport ?? null
  const meSports = new Set((me.sports ?? []).filter(Boolean) as string[])
  const uSports = (u.sports ?? []).filter(Boolean) as string[]
  const overlapCount = uSports.filter(s => meSports.has(s)).length

  if (mePrimary && uPrimary && mePrimary.toLowerCase() === uPrimary.toLowerCase()) {
    sport = 35
  } else if (overlapCount > 0) {
    sport = 10 + Math.min(15, overlapCount * 5)
  }

  // 2) Mutual graph (0-30) using log curve
  const m = u.mutualCount ?? 0
  const mutual = Math.min(30, 8 * Math.log2(1 + m))

  // 3) Location proximity (0-15)
  let location = 0
  if (me.city && u.city && me.city.toLowerCase() === u.city.toLowerCase()) {
    location = 15
  } else if (me.country && u.country && me.country.toLowerCase() === u.country.toLowerCase()) {
    location = 6
  }

  // 4) Activity recency + volume (0-20)
  const a30 = u.activities30d ?? 0
  const lastDays = Math.min(30, daysSince(u.lastActivityAt))
  const volume = Math.min(12, a30 * 1.5)
  const recency = Math.max(0, 8 - Math.floor(lastDays / 4))
  const activity = volume + recency

  // 5) Similar level / competitiveness (0-15)
  let similarity = 0
  if (me.sportIndex != null && u.sportIndex != null) {
    const d = Math.abs((u.sportIndex ?? 0) - (me.sportIndex ?? 0))
    similarity = 15 * Math.exp(-d / 180)
  }

  // 6) Quality signals (0-10)
  const quality =
    (u.hasAvatar || u.avatarUrl ? 2 : 0) +
    (u.hasBio ? 1 : 0) +
    (u.hasPB ? 3 : 0) +
    (u.hasVerified ? 4 : 0)

  // 7) Diversity penalty (0 to -25) to avoid repetition
  const sportDup = uPrimary ? (ctx.topSportCounts[uPrimary.toLowerCase()] ?? 0) : 0
  const cityDup = u.city ? (ctx.topCityCounts[u.city.toLowerCase()] ?? 0) : 0
  const diversityPenalty = Math.min(10, sportDup * 2) + Math.min(15, cityDup * 3)

  // 8) New user boost (0-6)
  const createdDays = daysSince(u.createdAt)
  const newUserBoost = createdDays <= 7 ? 6 : 0

  const score = sport + mutual + location + activity + similarity + quality + newUserBoost - diversityPenalty

  // Explainability
  const reason = buildReason(me, u, { sport, mutual, location, activity, similarity })

  return {
    score,
    reason,
    breakdown: {
      sport,
      mutual: Math.round(mutual * 10) / 10,
      location,
      activity: Math.round(activity * 10) / 10,
      similarity: Math.round(similarity * 10) / 10,
      quality,
      newUserBoost,
      diversityPenalty,
    },
  }
}

function buildReason(
  me: UserProfile,
  u: SuggestCandidate,
  parts: { sport: number; mutual: number; location: number; activity: number; similarity: number }
): string {
  const reasons: string[] = []

  // Sport match reason
  if (me.primarySport && u.primarySport && me.primarySport.toLowerCase() === u.primarySport.toLowerCase()) {
    reasons.push(`Same sport: ${u.primarySport}`)
  } else {
    const meSports = new Set((me.sports ?? []).filter(Boolean).map(s => s.toLowerCase()))
    const uSports = (u.sports ?? []).filter(Boolean) as string[]
    const overlap = uSports.filter(s => meSports.has(s.toLowerCase()))
    if (overlap.length > 0) {
      reasons.push(`Both do: ${overlap.slice(0, 2).join(", ")}`)
    }
  }

  // Mutual connections reason
  if ((u.mutualCount ?? 0) >= 2) {
    reasons.push(`${u.mutualCount} mutuals`)
  } else if ((u.mutualCount ?? 0) === 1) {
    reasons.push(`1 mutual`)
  }

  // Location reason
  if (me.city && u.city && me.city.toLowerCase() === u.city.toLowerCase()) {
    reasons.push(`Near you: ${u.city}`)
  } else if (me.country && u.country && me.country.toLowerCase() === u.country.toLowerCase()) {
    reasons.push(`Same country`)
  }

  // Activity reason (if nothing else)
  if (reasons.length === 0 && (u.activities30d ?? 0) > 0) {
    reasons.push(`${u.activities30d} activities`)
  }

  // Fallback
  if (reasons.length === 0) {
    reasons.push(`Suggested`)
  }

  return reasons.slice(0, 2).join(" \u2022 ")
}

/**
 * Create initial score context for diversity tracking
 */
export function createScoreContext(): ScoreContext {
  return {
    topSportCounts: {},
    topCityCounts: {},
  }
}

/**
 * Update score context after selecting a candidate
 */
export function updateScoreContext(ctx: ScoreContext, candidate: SuggestCandidate): void {
  if (candidate.primarySport) {
    const sport = candidate.primarySport.toLowerCase()
    ctx.topSportCounts[sport] = (ctx.topSportCounts[sport] ?? 0) + 1
  }
  if (candidate.city) {
    const city = candidate.city.toLowerCase()
    ctx.topCityCounts[city] = (ctx.topCityCounts[city] ?? 0) + 1
  }
}
