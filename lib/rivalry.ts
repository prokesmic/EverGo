/**
 * Rivalry Helpers (V6)
 *
 * Wrapper around head-to-head for home page components
 */

import { getUserRivals, getUserRivalryStats } from "./head-to-head"

const INTENSE_THRESHOLD = 5 // 5+ matches = intense rivalry

export interface RivalryData {
  rivalryId: string
  opponent: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
  }
  wins: number
  losses: number
  ties: number
  isIntense: boolean
}

/**
 * Get user rivalries formatted for home page display
 */
export async function getUserRivalries(
  userId: string,
  limit: number = 10
): Promise<RivalryData[]> {
  const rivals = await getUserRivals(userId, limit)

  return rivals
    .filter((r) => r.opponent) // Filter out any with missing opponent data
    .map((r) => ({
      rivalryId: `${userId}-${r.opponent!.id}`,
      opponent: {
        id: r.opponent!.id,
        displayName: r.opponent!.displayName,
        username: r.opponent!.username,
        avatarUrl: r.opponent!.avatarUrl,
      },
      wins: r.userWins,
      losses: r.opponentWins,
      ties: r.ties,
      isIntense: r.totalMatches >= INTENSE_THRESHOLD,
    }))
}

/**
 * Re-export rivalry stats
 */
export { getUserRivalryStats }
