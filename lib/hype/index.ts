/**
 * Hype System (V12)
 *
 * Non-monetary spectator mechanic for rivalries and gauntlets.
 * Users can "hype" a participant, backing them to win.
 * Winners split the pot proportionally.
 *
 * Rules:
 * - Starting balance: 1000 hype points
 * - Minimum bet: 10 points
 * - Maximum per rivalry: 500 points
 * - Must hype before rivalry starts (or lock time)
 * - Settlement happens when rivalry completes
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"
import type { HypeStatus } from "@prisma/client"

// =============================================================================
// CONFIGURATION
// =============================================================================

export const HYPE_CONFIG = {
  /** Starting balance for new users */
  startingBalance: 1000,
  /** Minimum hype amount */
  minAmount: 10,
  /** Maximum hype per rivalry/gauntlet */
  maxPerCompetition: 500,
  /** Daily bonus for checking in (future feature) */
  dailyBonus: 50,
  /** Bonus for win streak */
  winStreakBonus: 25,
}

// =============================================================================
// TYPES
// =============================================================================

export interface HypeResult {
  success: boolean
  error?: string
  hypeId?: string
  newBalance?: number
}

export interface SettlementResult {
  totalPool: number
  winningPicks: number
  payoutPerPoint: number
  settlements: Array<{
    hypeId: string
    bettorUserId: string
    amount: number
    payout: number
    status: HypeStatus
  }>
}

export interface HypeTotals {
  rivalryId?: string
  gauntletId?: string
  participants: Array<{
    userId: string
    totalHype: number
    hypeCount: number
    percentage: number
  }>
  totalPool: number
  totalHypes: number
}

// =============================================================================
// WALLET MANAGEMENT
// =============================================================================

/**
 * Get or create user wallet
 */
export async function getOrCreateWallet(userId: string) {
  const existing = await prisma.userWallet.findUnique({
    where: { userId },
  })

  if (existing) return existing

  return prisma.userWallet.create({
    data: {
      userId,
      balance: HYPE_CONFIG.startingBalance,
      lifetimeEarned: HYPE_CONFIG.startingBalance,
    },
  })
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(userId: string): Promise<number> {
  const wallet = await getOrCreateWallet(userId)
  return wallet.balance
}

// =============================================================================
// HYPE PLACEMENT
// =============================================================================

/**
 * Place a hype on a rivalry participant
 */
export async function placeRivalryHype(
  bettorUserId: string,
  rivalryId: string,
  pickUserId: string,
  amount: number
): Promise<HypeResult> {
  if (!isFlagEnabled("HYPE_V1")) {
    return { success: false, error: "Hype system is not enabled" }
  }

  // Validate amount
  if (amount < HYPE_CONFIG.minAmount) {
    return { success: false, error: `Minimum hype is ${HYPE_CONFIG.minAmount} points` }
  }

  // Check rivalry status
  const rivalry = await prisma.rivalry.findUnique({
    where: { id: rivalryId },
    select: {
      status: true,
      windowStart: true,
      participants: {
        select: { userId: true },
      },
    },
  })

  if (!rivalry) {
    return { success: false, error: "Rivalry not found" }
  }

  if (rivalry.status !== "PENDING" && rivalry.status !== "ACTIVE") {
    return { success: false, error: "Rivalry is no longer accepting hypes" }
  }

  // Cannot hype yourself
  if (pickUserId === bettorUserId) {
    return { success: false, error: "Cannot hype yourself" }
  }

  // Validate pick is a participant
  const isValidPick = rivalry.participants.some((p) => p.userId === pickUserId)
  if (!isValidPick) {
    return { success: false, error: "Invalid participant selection" }
  }

  // Check existing hypes on this rivalry
  const existingTotal = await prisma.hype.aggregate({
    where: {
      bettorUserId,
      rivalryId,
      status: "PENDING",
    },
    _sum: { amount: true },
  })

  const currentTotal = existingTotal._sum.amount ?? 0
  if (currentTotal + amount > HYPE_CONFIG.maxPerCompetition) {
    return {
      success: false,
      error: `Maximum ${HYPE_CONFIG.maxPerCompetition} points per rivalry (you have ${currentTotal})`,
    }
  }

  // Get wallet and check balance
  const wallet = await getOrCreateWallet(bettorUserId)
  if (wallet.balance < amount) {
    return { success: false, error: "Insufficient hype points" }
  }

  // Create hype and deduct balance in transaction
  const [hype] = await prisma.$transaction([
    prisma.hype.create({
      data: {
        walletId: wallet.id,
        bettorUserId,
        rivalryId,
        pickUserId,
        amount,
        status: "PENDING",
      },
    }),
    prisma.userWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        lifetimeSpent: { increment: amount },
      },
    }),
  ])

  const newBalance = wallet.balance - amount

  return {
    success: true,
    hypeId: hype.id,
    newBalance,
  }
}

/**
 * Place a hype on a gauntlet participant
 */
export async function placeGauntletHype(
  bettorUserId: string,
  gauntletId: string,
  pickUserId: string,
  amount: number
): Promise<HypeResult> {
  if (!isFlagEnabled("HYPE_V1")) {
    return { success: false, error: "Hype system is not enabled" }
  }

  // Validate amount
  if (amount < HYPE_CONFIG.minAmount) {
    return { success: false, error: `Minimum hype is ${HYPE_CONFIG.minAmount} points` }
  }

  // Check gauntlet status
  const gauntlet = await prisma.gauntlet.findUnique({
    where: { id: gauntletId },
    select: {
      status: true,
      challengerId: true,
      opponentId: true,
    },
  })

  if (!gauntlet) {
    return { success: false, error: "Gauntlet not found" }
  }

  if (gauntlet.status !== "PENDING" && gauntlet.status !== "ACTIVE") {
    return { success: false, error: "Gauntlet is no longer accepting hypes" }
  }

  // Cannot hype yourself
  if (pickUserId === bettorUserId) {
    return { success: false, error: "Cannot hype yourself" }
  }

  // Validate pick is a participant
  const validPicks = [gauntlet.challengerId, gauntlet.opponentId]
  if (!validPicks.includes(pickUserId)) {
    return { success: false, error: "Invalid participant selection" }
  }

  // Check existing hypes
  const existingTotal = await prisma.hype.aggregate({
    where: {
      bettorUserId,
      gauntletId,
      status: "PENDING",
    },
    _sum: { amount: true },
  })

  const currentTotal = existingTotal._sum.amount ?? 0
  if (currentTotal + amount > HYPE_CONFIG.maxPerCompetition) {
    return {
      success: false,
      error: `Maximum ${HYPE_CONFIG.maxPerCompetition} points per gauntlet`,
    }
  }

  // Get wallet and check balance
  const wallet = await getOrCreateWallet(bettorUserId)
  if (wallet.balance < amount) {
    return { success: false, error: "Insufficient hype points" }
  }

  // Create hype and deduct balance
  const [hype] = await prisma.$transaction([
    prisma.hype.create({
      data: {
        walletId: wallet.id,
        bettorUserId,
        gauntletId,
        pickUserId,
        amount,
        status: "PENDING",
      },
    }),
    prisma.userWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        lifetimeSpent: { increment: amount },
      },
    }),
  ])

  return {
    success: true,
    hypeId: hype.id,
    newBalance: wallet.balance - amount,
  }
}

// =============================================================================
// SETTLEMENT
// =============================================================================

/**
 * Settle hypes for a completed rivalry
 */
export async function settleRivalryHypes(
  rivalryId: string,
  winnerId: string | null
): Promise<SettlementResult> {
  const pendingHypes = await prisma.hype.findMany({
    where: {
      rivalryId,
      status: "PENDING",
    },
    include: {
      wallet: true,
    },
  })

  if (pendingHypes.length === 0) {
    return {
      totalPool: 0,
      winningPicks: 0,
      payoutPerPoint: 0,
      settlements: [],
    }
  }

  const now = new Date()
  const settlements: SettlementResult["settlements"] = []

  // If no winner (tie), refund everyone
  if (!winnerId) {
    for (const hype of pendingHypes) {
      await prisma.$transaction([
        prisma.hype.update({
          where: { id: hype.id },
          data: {
            status: "REFUNDED",
            settledAt: now,
            payout: hype.amount,
          },
        }),
        prisma.userWallet.update({
          where: { id: hype.walletId },
          data: {
            balance: { increment: hype.amount },
            lifetimeEarned: { increment: hype.amount },
          },
        }),
      ])

      settlements.push({
        hypeId: hype.id,
        bettorUserId: hype.bettorUserId,
        amount: hype.amount,
        payout: hype.amount,
        status: "REFUNDED",
      })
    }

    return {
      totalPool: pendingHypes.reduce((sum, h) => sum + h.amount, 0),
      winningPicks: 0,
      payoutPerPoint: 1,
      settlements,
    }
  }

  // Calculate pool and winning picks
  const totalPool = pendingHypes.reduce((sum, h) => sum + h.amount, 0)
  const winningHypes = pendingHypes.filter((h) => h.pickUserId === winnerId)
  const winningPool = winningHypes.reduce((sum, h) => sum + h.amount, 0)

  // Calculate payout per winning point
  const payoutPerPoint = winningPool > 0 ? totalPool / winningPool : 0

  // Settle each hype
  for (const hype of pendingHypes) {
    const isWinner = hype.pickUserId === winnerId
    const payout = isWinner ? Math.floor(hype.amount * payoutPerPoint) : 0
    const status: HypeStatus = isWinner ? "WON" : "LOST"

    await prisma.hype.update({
      where: { id: hype.id },
      data: {
        status,
        settledAt: now,
        payout,
      },
    })

    if (isWinner && payout > 0) {
      await prisma.userWallet.update({
        where: { id: hype.walletId },
        data: {
          balance: { increment: payout },
          lifetimeEarned: { increment: payout },
        },
      })
    }

    settlements.push({
      hypeId: hype.id,
      bettorUserId: hype.bettorUserId,
      amount: hype.amount,
      payout,
      status,
    })
  }

  return {
    totalPool,
    winningPicks: winningHypes.length,
    payoutPerPoint,
    settlements,
  }
}

/**
 * Settle hypes for a completed gauntlet
 */
export async function settleGauntletHypes(
  gauntletId: string,
  winnerId: string | null
): Promise<SettlementResult> {
  // Same logic as rivalry settlement
  const pendingHypes = await prisma.hype.findMany({
    where: {
      gauntletId,
      status: "PENDING",
    },
    include: {
      wallet: true,
    },
  })

  if (pendingHypes.length === 0) {
    return {
      totalPool: 0,
      winningPicks: 0,
      payoutPerPoint: 0,
      settlements: [],
    }
  }

  const now = new Date()
  const settlements: SettlementResult["settlements"] = []

  // If no winner (tie), refund everyone
  if (!winnerId) {
    for (const hype of pendingHypes) {
      await prisma.$transaction([
        prisma.hype.update({
          where: { id: hype.id },
          data: {
            status: "REFUNDED",
            settledAt: now,
            payout: hype.amount,
          },
        }),
        prisma.userWallet.update({
          where: { id: hype.walletId },
          data: {
            balance: { increment: hype.amount },
          },
        }),
      ])

      settlements.push({
        hypeId: hype.id,
        bettorUserId: hype.bettorUserId,
        amount: hype.amount,
        payout: hype.amount,
        status: "REFUNDED",
      })
    }

    return {
      totalPool: pendingHypes.reduce((sum, h) => sum + h.amount, 0),
      winningPicks: 0,
      payoutPerPoint: 1,
      settlements,
    }
  }

  const totalPool = pendingHypes.reduce((sum, h) => sum + h.amount, 0)
  const winningHypes = pendingHypes.filter((h) => h.pickUserId === winnerId)
  const winningPool = winningHypes.reduce((sum, h) => sum + h.amount, 0)
  const payoutPerPoint = winningPool > 0 ? totalPool / winningPool : 0

  for (const hype of pendingHypes) {
    const isWinner = hype.pickUserId === winnerId
    const payout = isWinner ? Math.floor(hype.amount * payoutPerPoint) : 0
    const status: HypeStatus = isWinner ? "WON" : "LOST"

    await prisma.hype.update({
      where: { id: hype.id },
      data: { status, settledAt: now, payout },
    })

    if (isWinner && payout > 0) {
      await prisma.userWallet.update({
        where: { id: hype.walletId },
        data: {
          balance: { increment: payout },
          lifetimeEarned: { increment: payout },
        },
      })
    }

    settlements.push({
      hypeId: hype.id,
      bettorUserId: hype.bettorUserId,
      amount: hype.amount,
      payout,
      status,
    })
  }

  return { totalPool, winningPicks: winningHypes.length, payoutPerPoint, settlements }
}

// =============================================================================
// QUERIES
// =============================================================================

/**
 * Get hype totals for a rivalry
 */
export async function getRivalryHypeTotals(rivalryId: string): Promise<HypeTotals> {
  const hypes = await prisma.hype.findMany({
    where: { rivalryId, status: "PENDING" },
    select: {
      pickUserId: true,
      amount: true,
    },
  })

  const byUser = new Map<string, { total: number; count: number }>()
  let totalPool = 0

  for (const hype of hypes) {
    const existing = byUser.get(hype.pickUserId) ?? { total: 0, count: 0 }
    existing.total += hype.amount
    existing.count += 1
    byUser.set(hype.pickUserId, existing)
    totalPool += hype.amount
  }

  const participants = Array.from(byUser.entries()).map(([userId, data]) => ({
    userId,
    totalHype: data.total,
    hypeCount: data.count,
    percentage: totalPool > 0 ? Math.round((data.total / totalPool) * 100) : 0,
  }))

  return {
    rivalryId,
    participants,
    totalPool,
    totalHypes: hypes.length,
  }
}

/**
 * Get user's hype history
 */
export async function getUserHypeHistory(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  return prisma.hype.findMany({
    where: { bettorUserId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

/**
 * Get user's hype stats
 */
export async function getUserHypeStats(userId: string) {
  const wallet = await getOrCreateWallet(userId)

  const [totalWins, totalLosses, pendingCount] = await Promise.all([
    prisma.hype.count({ where: { bettorUserId: userId, status: "WON" } }),
    prisma.hype.count({ where: { bettorUserId: userId, status: "LOST" } }),
    prisma.hype.count({ where: { bettorUserId: userId, status: "PENDING" } }),
  ])

  return {
    balance: wallet.balance,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeSpent: wallet.lifetimeSpent,
    totalWins,
    totalLosses,
    pendingCount,
    winRate: totalWins + totalLosses > 0
      ? Math.round((totalWins / (totalWins + totalLosses)) * 100)
      : 0,
  }
}
