import { prisma } from './db'

/**
 * Head-to-Head Records (V6)
 *
 * Tracks persistent head-to-head records between users across:
 * - Gauntlets
 * - Rivalries
 * - Rank Battles
 */

type MatchType = 'GAUNTLET' | 'RIVALRY' | 'RANK_BATTLE'

/**
 * Ensure user IDs are in consistent order for lookups
 */
function normalizeUserPair(userA: string, userB: string): [string, string] {
  return userA < userB ? [userA, userB] : [userB, userA]
}

/**
 * Record a match result between two users
 */
export async function recordMatchResult(
  winnerUserId: string | null,
  loserUserId: string | null,
  matchType: MatchType,
  winnerPower?: number,
  loserPower?: number
): Promise<void> {
  // Determine the two users involved
  const userA = winnerUserId || loserUserId
  const userB = loserUserId || winnerUserId

  if (!userA || !userB || userA === userB) {
    console.warn('[HeadToHead] Invalid user pair, skipping record')
    return
  }

  const [user1Id, user2Id] = normalizeUserPair(userA, userB)
  const isTie = !winnerUserId

  // Determine which user is user1 for record keeping
  const isUser1Winner = !isTie && winnerUserId === user1Id
  const isUser2Winner = !isTie && winnerUserId === user2Id

  // Calculate power for each user based on who won
  let user1Power = 0
  let user2Power = 0

  if (winnerUserId === user1Id) {
    user1Power = winnerPower || 0
    user2Power = loserPower || 0
  } else if (winnerUserId === user2Id) {
    user1Power = loserPower || 0
    user2Power = winnerPower || 0
  } else {
    // Tie - split power evenly or use provided values
    user1Power = (winnerPower || 0) / 2
    user2Power = (loserPower || 0) / 2
  }

  // Upsert the head-to-head record
  const existing = await prisma.headToHead.findUnique({
    where: {
      user1Id_user2Id: { user1Id, user2Id },
    },
  })

  if (existing) {
    // Calculate new streak
    let newStreak = existing.currentStreak
    if (isTie) {
      newStreak = 0
    } else if (isUser1Winner) {
      newStreak = newStreak > 0 ? newStreak + 1 : 1
    } else {
      newStreak = newStreak < 0 ? newStreak - 1 : -1
    }

    // Update best streaks
    const user1BestStreak = isUser1Winner
      ? Math.max(existing.user1BestStreak, newStreak)
      : existing.user1BestStreak
    const user2BestStreak = isUser2Winner
      ? Math.max(existing.user2BestStreak, Math.abs(newStreak))
      : existing.user2BestStreak

    await prisma.headToHead.update({
      where: { id: existing.id },
      data: {
        user1Wins: isUser1Winner ? { increment: 1 } : undefined,
        user2Wins: isUser2Winner ? { increment: 1 } : undefined,
        ties: isTie ? { increment: 1 } : undefined,
        totalMatches: { increment: 1 },
        user1TotalPower: { increment: user1Power },
        user2TotalPower: { increment: user2Power },
        currentStreak: newStreak,
        user1BestStreak,
        user2BestStreak,
        lastMatchDate: new Date(),
        lastMatchType: matchType,
        lastWinnerId: winnerUserId,
      },
    })
  } else {
    // Create new record
    await prisma.headToHead.create({
      data: {
        user1Id,
        user2Id,
        user1Wins: isUser1Winner ? 1 : 0,
        user2Wins: isUser2Winner ? 1 : 0,
        ties: isTie ? 1 : 0,
        totalMatches: 1,
        user1TotalPower: user1Power,
        user2TotalPower: user2Power,
        currentStreak: isTie ? 0 : isUser1Winner ? 1 : -1,
        user1BestStreak: isUser1Winner ? 1 : 0,
        user2BestStreak: isUser2Winner ? 1 : 0,
        lastMatchDate: new Date(),
        lastMatchType: matchType,
        lastWinnerId: winnerUserId,
      },
    })
  }
}

/**
 * Get head-to-head record between two users
 */
export async function getHeadToHead(userA: string, userB: string) {
  const [user1Id, user2Id] = normalizeUserPair(userA, userB)

  const record = await prisma.headToHead.findUnique({
    where: {
      user1Id_user2Id: { user1Id, user2Id },
    },
  })

  if (!record) {
    return null
  }

  // Return record from userA's perspective
  const isUserAFirst = userA === user1Id

  return {
    totalMatches: record.totalMatches,
    userWins: isUserAFirst ? record.user1Wins : record.user2Wins,
    opponentWins: isUserAFirst ? record.user2Wins : record.user1Wins,
    ties: record.ties,
    userTotalPower: isUserAFirst ? record.user1TotalPower : record.user2TotalPower,
    opponentTotalPower: isUserAFirst ? record.user2TotalPower : record.user1TotalPower,
    currentStreak: isUserAFirst ? record.currentStreak : -record.currentStreak,
    userBestStreak: isUserAFirst ? record.user1BestStreak : record.user2BestStreak,
    opponentBestStreak: isUserAFirst ? record.user2BestStreak : record.user1BestStreak,
    lastMatchDate: record.lastMatchDate,
    lastMatchType: record.lastMatchType,
    lastWinnerId: record.lastWinnerId,
    isLeading: isUserAFirst
      ? record.user1Wins > record.user2Wins
      : record.user2Wins > record.user1Wins,
    isOnStreak: isUserAFirst
      ? record.currentStreak > 0
      : record.currentStreak < 0,
  }
}

/**
 * Get all rivalries for a user (people they've competed against)
 */
export async function getUserRivals(userId: string, limit: number = 20) {
  // Find all head-to-head records where user is involved
  const records = await prisma.headToHead.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    orderBy: { totalMatches: 'desc' },
    take: limit,
  })

  // Get opponent IDs
  const opponentIds = records.map((r) =>
    r.user1Id === userId ? r.user2Id : r.user1Id
  )

  // Fetch opponent details
  const opponents = await prisma.user.findMany({
    where: { id: { in: opponentIds } },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  })

  const opponentMap = new Map(opponents.map((o) => [o.id, o]))

  // Build rivalry list from user's perspective
  return records.map((record) => {
    const isUserFirst = record.user1Id === userId
    const opponentId = isUserFirst ? record.user2Id : record.user1Id
    const opponent = opponentMap.get(opponentId)

    return {
      opponent,
      totalMatches: record.totalMatches,
      userWins: isUserFirst ? record.user1Wins : record.user2Wins,
      opponentWins: isUserFirst ? record.user2Wins : record.user1Wins,
      ties: record.ties,
      currentStreak: isUserFirst ? record.currentStreak : -record.currentStreak,
      lastMatchDate: record.lastMatchDate,
      isLeading: isUserFirst
        ? record.user1Wins > record.user2Wins
        : record.user2Wins > record.user1Wins,
    }
  })
}

/**
 * Get user's rivalry stats summary
 */
export async function getUserRivalryStats(userId: string) {
  const records = await prisma.headToHead.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  })

  let totalWins = 0
  let totalLosses = 0
  let totalTies = 0
  let totalMatches = 0
  let longestWinStreak = 0
  let currentWinStreak = 0
  let rivalCount = records.length

  for (const record of records) {
    const isUserFirst = record.user1Id === userId
    const userWins = isUserFirst ? record.user1Wins : record.user2Wins
    const opponentWins = isUserFirst ? record.user2Wins : record.user1Wins
    const userBestStreak = isUserFirst ? record.user1BestStreak : record.user2BestStreak
    const streak = isUserFirst ? record.currentStreak : -record.currentStreak

    totalWins += userWins
    totalLosses += opponentWins
    totalTies += record.ties
    totalMatches += record.totalMatches
    longestWinStreak = Math.max(longestWinStreak, userBestStreak)

    if (streak > 0) {
      currentWinStreak = Math.max(currentWinStreak, streak)
    }
  }

  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0

  return {
    totalMatches,
    totalWins,
    totalLosses,
    totalTies,
    winRate: Math.round(winRate * 10) / 10,
    rivalCount,
    longestWinStreak,
    currentWinStreak,
  }
}

/**
 * Get leaderboard of most active rivalries
 */
export async function getTopRivalries(limit: number = 10) {
  const records = await prisma.headToHead.findMany({
    orderBy: { totalMatches: 'desc' },
    take: limit,
  })

  // Get all user IDs
  const userIds = new Set<string>()
  records.forEach((r) => {
    userIds.add(r.user1Id)
    userIds.add(r.user2Id)
  })

  // Fetch user details
  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))

  return records.map((record) => ({
    user1: userMap.get(record.user1Id),
    user2: userMap.get(record.user2Id),
    totalMatches: record.totalMatches,
    user1Wins: record.user1Wins,
    user2Wins: record.user2Wins,
    ties: record.ties,
    currentStreak: record.currentStreak,
    lastMatchDate: record.lastMatchDate,
  }))
}
