import { prisma } from './db'
import { createNotification } from './notifications'
import { startOfWeek } from 'date-fns'

/**
 * "Almost There" Notifications
 *
 * Triggers encouraging notifications when users are close to:
 * - Ranking up (within X points of next rank)
 * - Weekly power goal
 * - Winning their rank battle
 * - First week milestones
 */

const RANK_UP_THRESHOLD_POINTS = 10 // Notify when within 10 points of ranking up
const BATTLE_CLOSE_THRESHOLD = 15 // Notify when battle within 15 points
const WEEKLY_GOAL_THRESHOLD = 20 // Notify when within 20 points of weekly goal

interface AlmostThereCheck {
  type: 'ALMOST_RANK_UP' | 'ALMOST_BATTLE_WIN' | 'ALMOST_WEEKLY_GOAL' | 'ALMOST_MILESTONE'
  userId: string
  triggered: boolean
  data?: Record<string, unknown>
}

export async function checkAlmostThere(userId: string): Promise<AlmostThereCheck[]> {
  const checks: AlmostThereCheck[] = []
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  // Get user's current week power score
  const weeklyScore = await prisma.weeklyPower.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
  })

  const currentScore = weeklyScore?.totalPower ?? 0

  // Check 1: Almost ranking up (check against user above in leaderboard)
  const userAbove = await prisma.weeklyPower.findFirst({
    where: {
      weekStart,
      totalPower: { gt: currentScore },
    },
    orderBy: { totalPower: 'asc' },
    select: {
      totalPower: true,
      user: { select: { displayName: true } },
    },
  })

  if (userAbove) {
    const pointsNeeded = userAbove.totalPower - currentScore
    if (pointsNeeded <= RANK_UP_THRESHOLD_POINTS && pointsNeeded > 0) {
      checks.push({
        type: 'ALMOST_RANK_UP',
        userId,
        triggered: true,
        data: {
          pointsNeeded: Math.round(pointsNeeded),
          userAbove: userAbove.user.displayName ?? 'the next rank',
        },
      })
    }
  }

  // Check 2: Almost winning rank battle
  const activeBattle = await prisma.rankBattle.findFirst({
    where: {
      weekStart,
      status: 'ACTIVE',
      OR: [{ challengerId: userId }, { opponentId: userId }],
    },
    include: {
      challenger: { select: { displayName: true } },
      opponent: { select: { displayName: true } },
    },
  })

  if (activeBattle) {
    const isChallenger = activeBattle.challengerId === userId
    const userScore = isChallenger ? activeBattle.challengerScore : activeBattle.opponentScore
    const opponentScore = isChallenger ? activeBattle.opponentScore : activeBattle.challengerScore
    const opponent = isChallenger ? activeBattle.opponent : activeBattle.challenger
    const scoreDiff = opponentScore - userScore

    if (scoreDiff > 0 && scoreDiff <= BATTLE_CLOSE_THRESHOLD) {
      checks.push({
        type: 'ALMOST_BATTLE_WIN',
        userId,
        triggered: true,
        data: {
          pointsNeeded: Math.round(scoreDiff),
          opponentName: opponent.displayName ?? 'your opponent',
        },
      })
    }
  }

  // Check 3: Almost reaching weekly goal (100 points)
  const weeklyGoal = 100
  const pointsToGoal = weeklyGoal - currentScore
  if (pointsToGoal > 0 && pointsToGoal <= WEEKLY_GOAL_THRESHOLD) {
    checks.push({
      type: 'ALMOST_WEEKLY_GOAL',
      userId,
      triggered: true,
      data: {
        pointsNeeded: Math.round(pointsToGoal),
        currentScore: Math.round(currentScore),
      },
    })
  }

  return checks
}

/**
 * Send "Almost There" notifications based on current state.
 * Call this after activity logging or at scheduled intervals.
 */
export async function sendAlmostThereNotifications(userId: string): Promise<void> {
  const checks = await checkAlmostThere(userId)

  // Track which notifications were recently sent to avoid spamming
  const recentNotifications = await prisma.notification.findMany({
    where: {
      userId,
      type: { in: ['ALMOST_RANK_UP', 'ALMOST_BATTLE_WIN', 'ALMOST_WEEKLY_GOAL'] as any[] },
      createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // Last 6 hours
    },
    select: { type: true },
  })

  const recentTypes = new Set(recentNotifications.map(n => n.type))

  for (const check of checks) {
    if (!check.triggered) continue
    if (recentTypes.has(check.type)) continue // Skip if recently sent

    switch (check.type) {
      case 'ALMOST_RANK_UP':
        await createNotification({
          userId,
          type: 'ALMOST_RANK_UP' as any,
          title: 'Almost There!',
          message: `Just ${check.data?.pointsNeeded} more points to pass ${check.data?.userAbove}!`,
          data: check.data,
        })
        break

      case 'ALMOST_BATTLE_WIN':
        await createNotification({
          userId,
          type: 'ALMOST_BATTLE_WIN' as any,
          title: 'Battle Within Reach!',
          message: `Only ${check.data?.pointsNeeded} points behind ${check.data?.opponentName} in your Rank Battle!`,
          data: check.data,
        })
        break

      case 'ALMOST_WEEKLY_GOAL':
        await createNotification({
          userId,
          type: 'ALMOST_WEEKLY_GOAL' as any,
          title: 'Weekly Goal In Sight!',
          message: `Just ${check.data?.pointsNeeded} more points to hit your weekly goal!`,
          data: check.data,
        })
        break
    }
  }
}

/**
 * Generate "Almost There" insights for display in UI
 */
export interface AlmostThereInsight {
  id: string
  type: 'rank_up' | 'battle' | 'weekly_goal'
  title: string
  message: string
  pointsNeeded: number
  urgency: 'low' | 'medium' | 'high'
  actionLabel: string
  actionUrl: string
}

export async function getAlmostThereInsights(userId: string): Promise<AlmostThereInsight[]> {
  const checks = await checkAlmostThere(userId)
  const insights: AlmostThereInsight[] = []

  for (const check of checks) {
    if (!check.triggered) continue

    const pointsNeeded = (check.data?.pointsNeeded as number) ?? 0
    const urgency = pointsNeeded <= 5 ? 'high' : pointsNeeded <= 10 ? 'medium' : 'low'

    switch (check.type) {
      case 'ALMOST_RANK_UP':
        insights.push({
          id: 'rank-up',
          type: 'rank_up',
          title: 'Rank Up Incoming',
          message: `${pointsNeeded} pts to overtake ${check.data?.userAbove}`,
          pointsNeeded,
          urgency,
          actionLabel: 'Log Activity',
          actionUrl: '/activity/log',
        })
        break

      case 'ALMOST_BATTLE_WIN':
        insights.push({
          id: 'battle',
          type: 'battle',
          title: 'Battle Comeback',
          message: `${pointsNeeded} pts behind ${check.data?.opponentName}`,
          pointsNeeded,
          urgency,
          actionLabel: 'View Battle',
          actionUrl: '/rank-battles',
        })
        break

      case 'ALMOST_WEEKLY_GOAL':
        insights.push({
          id: 'weekly-goal',
          type: 'weekly_goal',
          title: 'Weekly Goal',
          message: `${pointsNeeded} pts to reach 100`,
          pointsNeeded,
          urgency,
          actionLabel: 'Log Activity',
          actionUrl: '/activity/log',
        })
        break
    }
  }

  // Sort by urgency (high first)
  const urgencyOrder = { high: 0, medium: 1, low: 2 }
  return insights.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
}
