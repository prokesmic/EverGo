/**
 * Highlight scoring for Home feed
 * Prioritizes high-signal activities over noise
 */

export type HighlightCandidate = {
  kind: "activity" | "pb" | "rivalry"
  id: string
  createdAt: Date
  userId: string
  sportSlug?: string | null
  durationSec?: number | null
  distanceM?: number | null
  hasMedia?: boolean
  hasRoute?: boolean
  sportIndexDelta?: number | null
  isPersonalBest?: boolean
  rivalryImpact?: boolean
}

/**
 * Compute a highlight score for an activity/event
 * Higher scores = more worthy of Home feed placement
 *
 * Scoring logic:
 * - Personal bests: +100
 * - Rivalry outcomes: +80
 * - Sport index changes: up to +70 (based on delta magnitude)
 * - Media (photos): +25
 * - GPS route: +10
 * - Duration bonuses: +20 (60m+), +12 (30m+), +6 (15m+), -10 (tiny sessions)
 * - Distance bonus: +8 (5km+)
 */
export function computeHighlightScore(x: HighlightCandidate): number {
  let s = 0

  // Most important signals
  if (x.isPersonalBest) s += 100
  if (x.rivalryImpact) s += 80
  if (typeof x.sportIndexDelta === "number") {
    s += Math.min(70, Math.abs(x.sportIndexDelta) * 3)
  }

  // Media/route boost
  if (x.hasMedia) s += 25
  if (x.hasRoute) s += 10

  // Effort proxies (duration-based scoring)
  if (typeof x.durationSec === "number") {
    if (x.durationSec >= 3600) s += 20      // 60m+
    else if (x.durationSec >= 1800) s += 12 // 30m+
    else if (x.durationSec >= 900) s += 6   // 15m+
    else s -= 10                            // tiny session penalty
  }

  // If distance exists, modest bonus
  if (typeof x.distanceM === "number" && x.distanceM >= 5000) s += 8

  return s
}
