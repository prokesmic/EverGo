/**
 * Rivalry Spectator System (V11)
 *
 * Enhances rivalries as a watchable product:
 * - Preview cards with head-to-head history
 * - Hype/betting simulation (watch without participating)
 * - Live score tracking
 * - Commentary generation
 */

import { prisma } from "@/lib/db"
import type { RivalryStatus } from "@prisma/client"

// =============================================================================
// TYPES
// =============================================================================

export interface RivalryPreview {
  rivalryId: string
  status: RivalryStatus
  sportName: string

  // Participants
  challenger: ParticipantPreview
  opponent: ParticipantPreview

  // Head-to-head history
  headToHead: {
    challengerWins: number
    opponentWins: number
    ties: number
    totalMatches: number
  }

  // Current scores (if active)
  currentScores: {
    challengerScore: number
    opponentScore: number
    leaderId: string | null
  } | null

  // Timing
  startsAt: Date | null
  endsAt: Date | null
  timeRemaining: number | null // seconds

  // Spectator stats
  watcherCount: number
  hypeCount: number
}

interface ParticipantPreview {
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  sportIndex: number
  verificationTier: string
  recentForm: "hot" | "warm" | "cold" | "unknown"
}

export interface RivalryCommentary {
  type: "score_update" | "lead_change" | "close_race" | "milestone"
  message: string
  timestamp: Date
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Get rivalry preview for spectators
 */
export async function getRivalryPreview(rivalryId: string): Promise<RivalryPreview | null> {
  const rivalry = await prisma.rivalry.findUnique({
    where: { id: rivalryId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              stats: {
                select: {
                  sportIndex: true,
                  verificationTier: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!rivalry) return null

  const challenger = rivalry.participants.find((p) => p.isCreator)
  const opponent = rivalry.participants.find((p) => !p.isCreator)

  if (!challenger || !opponent) return null

  // Get sport name
  const sport = await prisma.sport.findFirst({
    where: { slug: rivalry.sportSlug },
    select: { name: true },
  })

  // Get head-to-head history
  const h2h = await getHeadToHeadStats(challenger.userId, opponent.userId)

  // Calculate time remaining
  let timeRemaining: number | null = null
  if (rivalry.status === "ACTIVE" && rivalry.windowEnd) {
    timeRemaining = Math.max(0, Math.floor((rivalry.windowEnd.getTime() - Date.now()) / 1000))
  }

  // Get spectator stats (simplified)
  const watcherCount = 0 // TODO: Implement with real-time tracking
  const hypeCount = 0 // TODO: Implement with real-time tracking

  return {
    rivalryId: rivalry.id,
    status: rivalry.status,
    sportName: sport?.name ?? rivalry.sportSlug,

    challenger: {
      userId: challenger.userId,
      username: challenger.user.username,
      displayName: challenger.user.displayName,
      avatarUrl: challenger.user.avatarUrl,
      sportIndex: challenger.user.stats?.sportIndex ?? 0,
      verificationTier: challenger.user.stats?.verificationTier ?? "BRONZE",
      recentForm: await getRecentForm(challenger.userId),
    },

    opponent: {
      userId: opponent.userId,
      username: opponent.user.username,
      displayName: opponent.user.displayName,
      avatarUrl: opponent.user.avatarUrl,
      sportIndex: opponent.user.stats?.sportIndex ?? 0,
      verificationTier: opponent.user.stats?.verificationTier ?? "BRONZE",
      recentForm: await getRecentForm(opponent.userId),
    },

    headToHead: h2h,

    currentScores:
      rivalry.status === "ACTIVE"
        ? {
            challengerScore: challenger.scoreValue ?? 0,
            opponentScore: opponent.scoreValue ?? 0,
            leaderId:
              (challenger.scoreValue ?? 0) > (opponent.scoreValue ?? 0)
                ? challenger.userId
                : (opponent.scoreValue ?? 0) > (challenger.scoreValue ?? 0)
                ? opponent.userId
                : null,
          }
        : null,

    startsAt: rivalry.windowStart,
    endsAt: rivalry.windowEnd,
    timeRemaining,
    watcherCount,
    hypeCount,
  }
}

/**
 * Get head-to-head statistics between two users
 */
async function getHeadToHeadStats(
  user1Id: string,
  user2Id: string
): Promise<RivalryPreview["headToHead"]> {
  // Ensure consistent ordering
  const [id1, id2] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id]

  const h2h = await prisma.headToHead.findFirst({
    where: {
      OR: [
        { user1Id: id1, user2Id: id2 },
        { user1Id: id2, user2Id: id1 },
      ],
    },
  })

  if (!h2h) {
    return {
      challengerWins: 0,
      opponentWins: 0,
      ties: 0,
      totalMatches: 0,
    }
  }

  // Map wins to correct user
  const challengerIsUser1 = user1Id === id1
  return {
    challengerWins: challengerIsUser1 ? h2h.user1Wins : h2h.user2Wins,
    opponentWins: challengerIsUser1 ? h2h.user2Wins : h2h.user1Wins,
    ties: h2h.ties,
    totalMatches: h2h.user1Wins + h2h.user2Wins + h2h.ties,
  }
}

/**
 * Get user's recent form (activity in last 7 days)
 */
async function getRecentForm(userId: string): Promise<ParticipantPreview["recentForm"]> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const recentActivities = await prisma.activity.count({
    where: {
      userId,
      activityDate: { gte: weekAgo },
    },
  })

  if (recentActivities >= 5) return "hot"
  if (recentActivities >= 3) return "warm"
  if (recentActivities >= 1) return "cold"
  return "unknown"
}

/**
 * Generate commentary for a rivalry
 */
export function generateCommentary(
  preview: RivalryPreview,
  previousScores?: { challenger: number; opponent: number }
): RivalryCommentary[] {
  const commentary: RivalryCommentary[] = []
  const now = new Date()

  if (!preview.currentScores) return commentary

  const { challengerScore, opponentScore } = preview.currentScores
  const scoreDiff = Math.abs(challengerScore - opponentScore)
  const totalScore = challengerScore + opponentScore

  // Lead change
  if (previousScores) {
    const wasLeading = previousScores.challenger > previousScores.opponent
    const nowLeading = challengerScore > opponentScore

    if (wasLeading !== nowLeading && challengerScore !== opponentScore) {
      const newLeader = nowLeading ? preview.challenger : preview.opponent
      commentary.push({
        type: "lead_change",
        message: `Lead change! ${newLeader.displayName} takes the lead!`,
        timestamp: now,
      })
    }
  }

  // Close race
  if (totalScore > 0 && scoreDiff / totalScore < 0.1) {
    commentary.push({
      type: "close_race",
      message: "This is a close one! Less than 10% separates them.",
      timestamp: now,
    })
  }

  return commentary
}

/**
 * Get public rivalries for spectating
 */
export async function getPublicRivalries(options: {
  status?: RivalryStatus
  sportSlug?: string
  limit?: number
}): Promise<RivalryPreview[]> {
  const { status = "ACTIVE", sportSlug, limit = 10 } = options

  const rivalries = await prisma.rivalry.findMany({
    where: {
      status,
      visibility: "PUBLIC",
      ...(sportSlug ? { sportSlug } : {}),
    },
    orderBy: { windowStart: "desc" },
    take: limit,
    select: { id: true },
  })

  const previews = await Promise.all(
    rivalries.map((r) => getRivalryPreview(r.id))
  )

  return previews.filter((p): p is RivalryPreview => p !== null)
}
