import { prisma } from './db'
import { startOfWeek, endOfWeek, addDays } from 'date-fns'
import { createNotification } from './notifications'

export async function matchRankBattles(): Promise<number> {
  /**
   * Weekly matching algorithm:
   * 1. Find all users with activity in last 2 weeks
   * 2. Group by city (prefer local battles)
   * 3. Match users within ±3 rank positions
   * 4. Create battle records
   */

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const twoWeeksAgo = addDays(weekStart, -14)

  // Check if already matched this week
  const existingBattles = await prisma.rankBattle.count({
    where: { weekStart }
  })

  if (existingBattles > 0) {
    console.log('Battles already matched for this week')
    return 0
  }

  // Get active users with recent power scores
  const recentScores = await prisma.weeklyPower.findMany({
    where: {
      weekStart: { gte: twoWeeksAgo }
    },
    include: {
      user: {
        select: {
          id: true,
          city: true,
          country: true,
          displayName: true
        }
      }
    },
    orderBy: { totalPower: 'desc' }
  })

  // Group by city
  const cityGroups = new Map<string, typeof recentScores>()
  const noCity: typeof recentScores = []

  for (const score of recentScores) {
    if (score.user.city) {
      const existing = cityGroups.get(score.user.city) ?? []
      existing.push(score)
      cityGroups.set(score.user.city, existing)
    } else {
      noCity.push(score)
    }
  }

  const battlesToCreate: Array<{
    challengerId: string
    opponentId: string
    scope: string
    scopeValue: string | null
    challengerStartRank: number
    opponentStartRank: number
  }> = []

  const matchedUsers = new Set<string>()

  // Match within cities first
  for (const [city, users] of cityGroups) {
    if (users.length < 2) continue

    // Sort by power for ranking
    const sorted = [...users].sort((a, b) => b.totalPower - a.totalPower)

    for (let i = 0; i < sorted.length; i++) {
      const user = sorted[i]
      if (matchedUsers.has(user.userId)) continue

      // Find opponent within ±3 ranks who isn't matched
      for (let j = Math.max(0, i - 3); j <= Math.min(sorted.length - 1, i + 3); j++) {
        if (i === j) continue
        const opponent = sorted[j]
        if (matchedUsers.has(opponent.userId)) continue

        battlesToCreate.push({
          challengerId: user.userId,
          opponentId: opponent.userId,
          scope: 'city',
          scopeValue: city,
          challengerStartRank: i + 1,
          opponentStartRank: j + 1
        })

        matchedUsers.add(user.userId)
        matchedUsers.add(opponent.userId)
        break
      }
    }
  }

  // Match remaining users globally
  const unmatchedGlobal = noCity
    .concat([...cityGroups.values()].flat())
    .filter(u => !matchedUsers.has(u.userId))
    .sort((a, b) => b.totalPower - a.totalPower)

  for (let i = 0; i < unmatchedGlobal.length - 1; i += 2) {
    const user1 = unmatchedGlobal[i]
    const user2 = unmatchedGlobal[i + 1]

    battlesToCreate.push({
      challengerId: user1.userId,
      opponentId: user2.userId,
      scope: 'global',
      scopeValue: null,
      challengerStartRank: i + 1,
      opponentStartRank: i + 2
    })
  }

  // Create battles
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  for (const battle of battlesToCreate) {
    await prisma.rankBattle.create({
      data: {
        weekStart,
        weekEnd,
        ...battle,
        status: 'ACTIVE'
      }
    })

    // Notify both users
    await Promise.all([
      createNotification({
        userId: battle.challengerId,
        type: 'RANK_BATTLE_STARTED',
        title: 'New Rank Battle!',
        message: `You've been matched for this week's Rank Battle!`,
        actionUrl: '/rank-battles'
      }),
      createNotification({
        userId: battle.opponentId,
        type: 'RANK_BATTLE_STARTED',
        title: 'New Rank Battle!',
        message: `You've been matched for this week's Rank Battle!`,
        actionUrl: '/rank-battles'
      })
    ])
  }

  return battlesToCreate.length
}

export async function updateBattleScores(userId: string): Promise<void> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  // Find user's active battle
  const battle = await prisma.rankBattle.findFirst({
    where: {
      weekStart,
      status: 'ACTIVE',
      OR: [
        { challengerId: userId },
        { opponentId: userId }
      ]
    }
  })

  if (!battle) return

  // Get both users' current week power scores
  const [challengerPower, opponentPower] = await Promise.all([
    prisma.weeklyPower.findUnique({
      where: { userId_weekStart: { userId: battle.challengerId, weekStart } }
    }),
    prisma.weeklyPower.findUnique({
      where: { userId_weekStart: { userId: battle.opponentId, weekStart } }
    })
  ])

  await prisma.rankBattle.update({
    where: { id: battle.id },
    data: {
      challengerScore: challengerPower?.totalPower ?? 0,
      opponentScore: opponentPower?.totalPower ?? 0
    }
  })
}

export async function finalizeBattles(): Promise<void> {
  const now = new Date()

  // Find all active battles that have ended
  const expiredBattles = await prisma.rankBattle.findMany({
    where: {
      status: 'ACTIVE',
      weekEnd: { lt: now }
    }
  })

  for (const battle of expiredBattles) {
    let status: 'CHALLENGER_WON' | 'OPPONENT_WON' | 'TIE' | 'EXPIRED'
    let winnerId: string | null = null

    if (battle.challengerScore === 0 && battle.opponentScore === 0) {
      status = 'EXPIRED'
    } else if (battle.challengerScore > battle.opponentScore) {
      status = 'CHALLENGER_WON'
      winnerId = battle.challengerId
    } else if (battle.opponentScore > battle.challengerScore) {
      status = 'OPPONENT_WON'
      winnerId = battle.opponentId
    } else {
      status = 'TIE'
    }

    await prisma.rankBattle.update({
      where: { id: battle.id },
      data: { status, winnerId }
    })

    // Notify users of result
    if (winnerId) {
      const loserId = winnerId === battle.challengerId ? battle.opponentId : battle.challengerId

      await Promise.all([
        createNotification({
          userId: winnerId,
          type: 'RANK_BATTLE_WON',
          title: 'You Won!',
          message: `You won this week's Rank Battle!`,
          actionUrl: '/rank-battles'
        }),
        createNotification({
          userId: loserId,
          type: 'RANK_BATTLE_LOST',
          title: 'Battle Complete',
          message: `Your Rank Battle has ended. Keep pushing next week!`,
          actionUrl: '/rank-battles'
        })
      ])
    }
  }
}

export async function getUserActiveBattle(userId: string) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  return prisma.rankBattle.findFirst({
    where: {
      weekStart,
      OR: [
        { challengerId: userId },
        { opponentId: userId }
      ]
    },
    include: {
      challenger: {
        select: { id: true, displayName: true, username: true, avatarUrl: true }
      },
      opponent: {
        select: { id: true, displayName: true, username: true, avatarUrl: true }
      }
    }
  })
}

/**
 * Get user's battle history
 */
export async function getUserBattleHistory(userId: string, limit: number = 10) {
  return prisma.rankBattle.findMany({
    where: {
      OR: [
        { challengerId: userId },
        { opponentId: userId }
      ],
      status: { not: 'ACTIVE' }
    },
    orderBy: { weekStart: 'desc' },
    take: limit,
    include: {
      challenger: {
        select: { id: true, displayName: true, username: true, avatarUrl: true }
      },
      opponent: {
        select: { id: true, displayName: true, username: true, avatarUrl: true }
      }
    }
  })
}
