export type CompeteItem =
  | {
      kind: "rivalry"
      id: string
      endsAt?: string | null
      opponentName: string
      opponentAvatarUrl?: string | null
      sportSlug?: string | null
      delta?: number | null
      myScore?: number | null
      theirScore?: number | null
      status?: "WINNING" | "LOSING" | "TIED" | "UNKNOWN"
    }
  | {
      kind: "challenge"
      id: string
      endsAt?: string | null
      title: string
      sportSlug?: string | null
      progress?: number | null
    }
  | {
      kind: "teamBattle"
      id: string
      endsAt?: string | null
      title: string
      teamName?: string | null
      progress?: number | null
    }
  | { kind: "teaser"; id: "teaser-start-rivalry" }

function hoursUntil(endsAt?: string | null, now = new Date()) {
  if (!endsAt) return Number.POSITIVE_INFINITY
  const t = new Date(endsAt).getTime()
  return (t - now.getTime()) / 36e5
}

/**
 * Prioritize compete items for the Home page deck.
 *
 * Priority order:
 * 1. Rivalry ending soon (<=72h) - highest priority
 * 2. Active rivalry
 * 3. Challenge ending soon
 * 4. Team battle ending soon
 * 5. Challenge
 * 6. Team battle
 * 7. Teaser (lowest)
 *
 * Within same priority: sort by kind, then by id for determinism.
 */
export function prioritizeCompeteItems(items: CompeteItem[], now = new Date()): CompeteItem[] {
  const endingSoon = (x: CompeteItem) => {
    if (x.kind === "teaser") return false
    return hoursUntil(x.endsAt, now) <= 72
  }

  const score = (x: CompeteItem): number => {
    // higher score = higher priority
    if (x.kind === "rivalry" && endingSoon(x)) return 1000
    if (x.kind === "rivalry") return 900
    if (x.kind === "challenge" && endingSoon(x)) return 800
    if (x.kind === "teamBattle" && endingSoon(x)) return 700
    if (x.kind === "challenge") return 600
    if (x.kind === "teamBattle") return 500
    return 0 // teaser
  }

  // Stable deterministic order: score desc, then kind, then id
  return [...items].sort((a, b) => {
    const d = score(b) - score(a)
    if (d !== 0) return d
    const k = a.kind.localeCompare(b.kind)
    if (k !== 0) return k
    return a.id.localeCompare(b.id)
  })
}

/**
 * Get the top N compete items, ensuring we always have at least the teaser if nothing else.
 */
export function getTopCompeteItems(items: CompeteItem[], count = 3): CompeteItem[] {
  const sorted = prioritizeCompeteItems(items)
  return sorted.slice(0, count)
}
