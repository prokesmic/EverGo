/**
 * Tale of the Tape - Head-to-Head Comparison System
 *
 * Provides detailed comparison data between two athletes.
 * Used for rivalry matchups, gauntlet previews, and social comparison.
 *
 * Includes:
 * - Head-to-head record (wins/losses/ties)
 * - Power comparison
 * - Recent form (last 7 days activity)
 * - Streak information
 * - Sport-specific stats
 */

import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek, subDays } from "date-fns"
import { getHeadToHead } from "@/lib/head-to-head"

// =============================================================================
// TYPES
// =============================================================================

export interface TaleOfTapeData {
  user: FighterStats
  opponent: FighterStats
  headToHead: HeadToHeadSummary
  comparison: ComparisonMetrics
}

export interface FighterStats {
  id: string
  displayName: string
  username: string | null
  avatarUrl: string | null
  sportIndex: number
  dayStreak: number
  totalActivities: number
  weekActivities: number
  weekDistance: number // km
  weekDuration: number // minutes
  weekPower: number
  recentForm: FormIndicator[] // Last 7 days
}

export interface HeadToHeadSummary {
  totalMatches: number
  userWins: number
  opponentWins: number
  ties: number
  userWinRate: number
  currentStreak: number
  isUserLeading: boolean
  streakHolder: "user" | "opponent" | "none"
  lastMatchDate: Date | null
  lastWinner: "user" | "opponent" | "tie" | null
}

export interface ComparisonMetrics {
  // Who's ahead in each category
  sportIndex: "user" | "opponent" | "tie"
  dayStreak: "user" | "opponent" | "tie"
  weekActivities: "user" | "opponent" | "tie"
  weekDistance: "user" | "opponent" | "tie"
  weekDuration: "user" | "opponent" | "tie"
  weekPower: "user" | "opponent" | "tie"
  headToHead: "user" | "opponent" | "tie"
}

export interface FormIndicator {
  date: string // ISO date
  hasActivity: boolean
  power: number
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Get Tale of the Tape data for two users
 */
export async function getTaleOfTape(
  userId: string,
  opponentId: string
): Promise<TaleOfTapeData> {
  // Fetch both users' data in parallel
  const [userData, opponentData, h2hResult] = await Promise.all([
    getFighterStats(userId),
    getFighterStats(opponentId),
    getHeadToHead(userId, opponentId),
  ])

  // Default values if no H2H record exists
  const h2h = h2hResult ?? {
    totalMatches: 0,
    userWins: 0,
    opponentWins: 0,
    ties: 0,
    currentStreak: 0,
    isLeading: false,
    isOnStreak: false,
    lastMatchDate: null,
    lastWinnerId: null,
    userTotalPower: 0,
    opponentTotalPower: 0,
    userBestStreak: 0,
    opponentBestStreak: 0,
    lastMatchType: null,
  }

  // Build head-to-head summary
  const headToHead: HeadToHeadSummary = {
    totalMatches: h2h.totalMatches,
    userWins: h2h.userWins,
    opponentWins: h2h.opponentWins,
    ties: h2h.ties,
    userWinRate: h2h.totalMatches > 0
      ? Math.round((h2h.userWins / h2h.totalMatches) * 100)
      : 0,
    currentStreak: h2h.currentStreak,
    isUserLeading: h2h.isLeading,
    streakHolder: h2h.currentStreak === 0
      ? "none"
      : h2h.isOnStreak
        ? "user"
        : "opponent",
    lastMatchDate: h2h.lastMatchDate,
    lastWinner: h2h.lastWinnerId === userId
      ? "user"
      : h2h.lastWinnerId === opponentId
        ? "opponent"
        : h2h.lastWinnerId
          ? "tie"
          : null,
  }

  // Build comparison metrics
  const comparison: ComparisonMetrics = {
    sportIndex: compareValues(userData.sportIndex, opponentData.sportIndex),
    dayStreak: compareValues(userData.dayStreak, opponentData.dayStreak),
    weekActivities: compareValues(userData.weekActivities, opponentData.weekActivities),
    weekDistance: compareValues(userData.weekDistance, opponentData.weekDistance),
    weekDuration: compareValues(userData.weekDuration, opponentData.weekDuration),
    weekPower: compareValues(userData.weekPower, opponentData.weekPower),
    headToHead: h2h.userWins > h2h.opponentWins
      ? "user"
      : h2h.userWins < h2h.opponentWins
        ? "opponent"
        : "tie",
  }

  return {
    user: userData,
    opponent: opponentData,
    headToHead,
    comparison,
  }
}

// =============================================================================
// HELPERS
// =============================================================================

async function getFighterStats(userId: string): Promise<FighterStats> {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const sevenDaysAgo = subDays(now, 7)

  // Fetch user with stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      avatarUrl: true,
      stats: {
        select: {
          sportIndex: true,
        },
      },
      _count: {
        select: { activities: true },
      },
    },
  })

  if (!user) {
    throw new Error(`User not found: ${userId}`)
  }

  // Fetch streak
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
    select: { currentStreak: true },
  })

  // Fetch this week's activities
  const weekActivities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: { gte: weekStart, lte: weekEnd },
    },
    select: {
      distanceMeters: true,
      durationSeconds: true,
      power: true,
      activityDate: true,
    },
  })

  // Fetch last 7 days for form indicator
  const last7DaysActivities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: { gte: sevenDaysAgo },
    },
    select: {
      activityDate: true,
      power: true,
    },
    orderBy: { activityDate: "asc" },
  })

  // Build form indicators
  const recentForm = buildFormIndicators(last7DaysActivities, sevenDaysAgo)

  // Calculate weekly totals
  const weekDistance = weekActivities.reduce(
    (sum, a) => sum + (a.distanceMeters ?? 0) / 1000,
    0
  )
  const weekDuration = weekActivities.reduce(
    (sum, a) => sum + (a.durationSeconds ?? 0) / 60,
    0
  )
  const weekPower = weekActivities.reduce(
    (sum, a) => sum + (a.power ?? 0),
    0
  )

  return {
    id: user.id,
    displayName: user.displayName ?? user.username ?? "User",
    username: user.username,
    avatarUrl: user.avatarUrl,
    sportIndex: user.stats?.sportIndex ?? 0,
    dayStreak: streak?.currentStreak ?? 0,
    totalActivities: user._count.activities,
    weekActivities: weekActivities.length,
    weekDistance: Math.round(weekDistance * 10) / 10,
    weekDuration: Math.round(weekDuration),
    weekPower: Math.round(weekPower),
    recentForm,
  }
}

function buildFormIndicators(
  activities: Array<{ activityDate: Date; power: number | null }>,
  startDate: Date
): FormIndicator[] {
  const form: FormIndicator[] = []
  const activityByDate = new Map<string, number>()

  // Group activities by date
  for (const activity of activities) {
    const dateStr = activity.activityDate.toISOString().split("T")[0]
    const existing = activityByDate.get(dateStr) ?? 0
    activityByDate.set(dateStr, existing + (activity.power ?? 0))
  }

  // Build 7-day form array
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]
    const power = activityByDate.get(dateStr) ?? 0

    form.push({
      date: dateStr,
      hasActivity: power > 0,
      power,
    })
  }

  return form
}

function compareValues(
  userValue: number,
  opponentValue: number
): "user" | "opponent" | "tie" {
  if (userValue > opponentValue) return "user"
  if (userValue < opponentValue) return "opponent"
  return "tie"
}
