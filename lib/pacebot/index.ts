/**
 * PaceBot Rivalry System
 *
 * Creates and manages pseudo-rivalries for users without real rivals.
 * PaceBots provide competition for users ranked below #50 or in sparse leaderboards.
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"
import type { PaceBotRivalry as PrismaPaceBotRivalry, PaceBot, BenchmarkDefinition } from "@prisma/client"
import {
  type PaceBotPersona,
  type PaceBotRivalryCard,
  PACEBOT_PERSONAS,
} from "./types"

type PaceBotRivalryWithRelations = PrismaPaceBotRivalry & {
  paceBot: PaceBot
  benchmark: BenchmarkDefinition
}

// Minimum rank to be eligible for PaceBot (users ranked higher don't need it)
const _MIN_RANK_FOR_PACEBOT = 50

/**
 * Check if user needs a PaceBot rivalry
 */
export async function needsPaceBot(
  userId: string,
  benchmarkId: string
): Promise<boolean> {
  if (!isFlagEnabled("enablePaceBot")) {
    return false
  }

  // Check if user already has an active PaceBot rivalry for this benchmark
  const existingRivalry = await prisma.paceBotRivalry.findFirst({
    where: {
      userId,
      benchmarkId,
      status: "ACTIVE",
    },
  })

  if (existingRivalry) {
    return false
  }

  // Check if user has a benchmark best
  const userBest = await prisma.userBenchmarkBest.findUnique({
    where: {
      userId_benchmarkId: { userId, benchmarkId },
    },
  })

  if (!userBest) {
    return false // No PB yet, can't create rivalry
  }

  // Check user's rank for this benchmark
  // For now, always return true if they have a PB (can add rank check later)
  return true
}

/**
 * Get or create a PaceBot rivalry for a user
 */
export async function getOrCreatePaceBotRivalry(
  userId: string,
  benchmarkId: string
): Promise<PaceBotRivalryCard | null> {
  if (!isFlagEnabled("enablePaceBot")) {
    return null
  }

  // Check for existing active rivalry
  const existingRivalry = await prisma.paceBotRivalry.findFirst({
    where: {
      userId,
      benchmarkId,
      status: "ACTIVE",
    },
    include: {
      paceBot: true,
      benchmark: true,
    },
  })

  if (existingRivalry) {
    return formatRivalryCard({
      id: existingRivalry.id,
      userId: existingRivalry.userId,
      userValue: existingRivalry.userValue,
      paceBotValue: existingRivalry.paceBotValue,
      status: existingRivalry.status,
      createdAt: existingRivalry.createdAt,
      resolvedAt: existingRivalry.resolvedAt,
      paceBot: {
        id: existingRivalry.paceBot.id,
        label: existingRivalry.paceBot.label,
        avatarUrl: existingRivalry.paceBot.avatarUrl,
        difficulty: existingRivalry.paceBot.difficulty,
      },
      benchmark: {
        id: existingRivalry.benchmark.id,
        name: existingRivalry.benchmark.name,
        unit: existingRivalry.benchmark.unit,
        higherIsBetter: existingRivalry.benchmark.higherIsBetter,
        measurementType: existingRivalry.benchmark.measurementType,
      },
    })
  }

  // Get user's current PB
  const userBest = await prisma.userBenchmarkBest.findUnique({
    where: {
      userId_benchmarkId: { userId, benchmarkId },
    },
    include: {
      benchmark: true,
    },
  })

  if (!userBest) {
    return null
  }

  // Select a random PaceBot or create one
  let paceBot = await prisma.paceBot.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!paceBot) {
    // Create default PaceBots
    const personas: Array<keyof typeof PACEBOT_PERSONAS> = ["STEADY", "AGGRESSIVE", "COMEBACK", "RANDOM"]
    for (const persona of personas) {
      const config = PACEBOT_PERSONAS[persona]
      await prisma.paceBot.create({
        data: {
          label: config.name,
          persona: persona,
          difficulty: "NORMAL",
        },
      })
    }
    paceBot = await prisma.paceBot.findFirst()
    if (!paceBot) {
      return null
    }
  }

  // Calculate PaceBot target value based on persona
  const personaConfig = PACEBOT_PERSONAS[paceBot.persona as PaceBotPersona]
  const [minOffset, maxOffset] = personaConfig.pbOffsetRange
  const offset = minOffset + Math.random() * (maxOffset - minOffset)

  const benchmark = userBest.benchmark
  const userValue = userBest.value
  let paceBotValue: number

  if (benchmark.higherIsBetter) {
    // For "higher is better" (distance, points), PaceBot target is slightly higher
    paceBotValue = userValue * (1 - offset) // offset is negative for challenging
  } else {
    // For "lower is better" (time), PaceBot target is slightly lower
    paceBotValue = userValue * (1 + offset) // offset is negative for challenging
  }

  // Create the rivalry
  const rivalry = await prisma.paceBotRivalry.create({
    data: {
      userId,
      paceBotId: paceBot.id,
      benchmarkId,
      userValue,
      paceBotValue,
      status: "ACTIVE",
    },
    include: {
      paceBot: true,
      benchmark: true,
    },
  })

  return formatRivalryCard({
    id: rivalry.id,
    userId: rivalry.userId,
    userValue: rivalry.userValue,
    paceBotValue: rivalry.paceBotValue,
    status: rivalry.status,
    createdAt: rivalry.createdAt,
    resolvedAt: rivalry.resolvedAt,
    paceBot: {
      id: rivalry.paceBot.id,
      label: rivalry.paceBot.label,
      avatarUrl: rivalry.paceBot.avatarUrl,
      difficulty: rivalry.paceBot.difficulty,
    },
    benchmark: {
      id: rivalry.benchmark.id,
      name: rivalry.benchmark.name,
      unit: rivalry.benchmark.unit,
      higherIsBetter: rivalry.benchmark.higherIsBetter,
      measurementType: rivalry.benchmark.measurementType,
    },
  })
}

/**
 * Update rivalry status when user beats their PB
 */
export async function checkPaceBotRivalryStatus(
  userId: string,
  benchmarkId: string,
  newValue: number
): Promise<void> {
  if (!isFlagEnabled("enablePaceBot")) {
    return
  }

  const rivalry = await prisma.paceBotRivalry.findFirst({
    where: {
      userId,
      benchmarkId,
      status: "ACTIVE",
    },
    include: {
      benchmark: true,
    },
  })

  if (!rivalry) {
    return
  }

  const { higherIsBetter } = rivalry.benchmark
  const userWins = higherIsBetter
    ? newValue > rivalry.paceBotValue
    : newValue < rivalry.paceBotValue

  if (userWins) {
    await prisma.paceBotRivalry.update({
      where: { id: rivalry.id },
      data: {
        status: "WON",
        resolvedAt: new Date(),
        userValue: newValue,
      },
    })
  } else {
    // Update user's current value but keep rivalry active
    await prisma.paceBotRivalry.update({
      where: { id: rivalry.id },
      data: { userValue: newValue },
    })
  }
}

/**
 * Get active PaceBot rivalries for a user
 */
export async function getUserPaceBotRivalries(
  userId: string
): Promise<PaceBotRivalryCard[]> {
  if (!isFlagEnabled("enablePaceBot")) {
    return []
  }

  const rivalries = await prisma.paceBotRivalry.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      paceBot: true,
      benchmark: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return rivalries.map((rivalry: PaceBotRivalryWithRelations) =>
    formatRivalryCard({
      id: rivalry.id,
      userId: rivalry.userId,
      userValue: rivalry.userValue,
      paceBotValue: rivalry.paceBotValue,
      status: rivalry.status,
      createdAt: rivalry.createdAt,
      resolvedAt: rivalry.resolvedAt,
      paceBot: {
        id: rivalry.paceBot.id,
        label: rivalry.paceBot.label,
        avatarUrl: rivalry.paceBot.avatarUrl,
        difficulty: rivalry.paceBot.difficulty,
      },
      benchmark: {
        id: rivalry.benchmark.id,
        name: rivalry.benchmark.name,
        unit: rivalry.benchmark.unit,
        higherIsBetter: rivalry.benchmark.higherIsBetter,
        measurementType: rivalry.benchmark.measurementType,
      },
    })
  )
}

/**
 * Format rivalry into display card
 */
export function formatRivalryCard(rivalry: {
  id: string
  userId: string
  userValue: number
  paceBotValue: number
  status: string
  createdAt: Date
  resolvedAt: Date | null
  paceBot: {
    id: string
    label: string
    avatarUrl: string | null
    difficulty: string
  }
  benchmark: {
    id: string
    name: string
    unit: string
    higherIsBetter: boolean
    measurementType: string
  }
}): PaceBotRivalryCard {
  const { benchmark, paceBot } = rivalry
  const higherIsBetter = benchmark.higherIsBetter

  // Calculate delta (positive = user ahead)
  const delta = higherIsBetter
    ? rivalry.userValue - rivalry.paceBotValue
    : rivalry.paceBotValue - rivalry.userValue

  // Format friendly message
  const absDelta = Math.abs(delta)
  let deltaStr: string

  switch (benchmark.measurementType) {
    case "TIME":
      if (absDelta >= 60) {
        const mins = Math.floor(absDelta / 60)
        const secs = Math.round(absDelta % 60)
        deltaStr = secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
      } else {
        deltaStr = `${Math.round(absDelta)}s`
      }
      break

    case "POWER_WKG":
    case "SPEED_KMH":
      deltaStr = `${absDelta.toFixed(1)} ${benchmark.unit}`
      break

    case "DISTANCE_METERS":
      if (absDelta >= 1000) {
        deltaStr = `${(absDelta / 1000).toFixed(1)} km`
      } else {
        deltaStr = `${Math.round(absDelta)} m`
      }
      break

    default:
      deltaStr = `${Math.round(absDelta)} ${benchmark.unit}`
  }

  const friendlyMessage =
    delta >= 0
      ? `You're ahead by ${deltaStr}`
      : `${paceBot.label} leads by ${deltaStr}`

  return {
    rivalry: {
      id: rivalry.id,
      userId: rivalry.userId,
      paceBot: {
        id: paceBot.id,
        name: paceBot.label,
        avatarUrl: paceBot.avatarUrl,
        persona: "STEADY" as PaceBotPersona, // Default, would need to fetch
        pbOffset: 0,
      },
      benchmarkId: benchmark.id,
      userValue: rivalry.userValue,
      paceBotValue: rivalry.paceBotValue,
      status: rivalry.status as "ACTIVE" | "WON" | "LOST",
      createdAt: rivalry.createdAt,
      resolvedAt: rivalry.resolvedAt,
    },
    benchmark: {
      id: benchmark.id,
      name: benchmark.name,
      unit: benchmark.unit,
      higherIsBetter: benchmark.higherIsBetter,
    },
    delta,
    friendlyMessage,
  }
}

export * from "./types"
