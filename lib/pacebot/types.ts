/**
 * PaceBot Types
 *
 * Defines the PaceBot rivalry system types for pseudo-rivalries.
 */

export type PaceBotPersona = "STEADY" | "AGGRESSIVE" | "COMEBACK" | "RANDOM"

// Legacy alias for backwards compatibility
export type LegacyPaceBotPersona = "STEADY_CLIMBER"

export interface PaceBotProfile {
  id: string
  name: string
  avatarUrl: string | null
  persona: PaceBotPersona
  // PB values are relative to user's actual PB
  pbOffset: number // e.g., -0.05 means PaceBot is 5% faster
}

export interface PaceBotRivalry {
  id: string
  userId: string
  paceBot: PaceBotProfile
  benchmarkId: string
  userValue: number
  paceBotValue: number
  status: "ACTIVE" | "WON" | "LOST"
  createdAt: Date
  resolvedAt: Date | null
}

export interface PaceBotRivalryCard {
  rivalry: PaceBotRivalry
  benchmark: {
    id: string
    name: string
    unit: string
    higherIsBetter: boolean
  }
  delta: number // Positive = user ahead, negative = user behind
  friendlyMessage: string
}

// PaceBot persona definitions with behavioral traits
export const PACEBOT_PERSONAS: Record<
  PaceBotPersona,
  {
    name: string
    description: string
    avatarSeed: string
    pbOffsetRange: [number, number]
  }
> = {
  STEADY: {
    name: "Steady Sam",
    description: "Consistent performer who rarely surprises",
    avatarSeed: "steady-sam",
    pbOffsetRange: [-0.02, 0.05], // 2% faster to 5% slower
  },
  AGGRESSIVE: {
    name: "Agile Alex",
    description: "Always pushing the pace, slight edge",
    avatarSeed: "agile-alex",
    pbOffsetRange: [-0.08, 0.02], // 8% faster to 2% slower
  },
  COMEBACK: {
    name: "Comeback Casey",
    description: "Starts slow but improves rapidly",
    avatarSeed: "comeback-casey",
    pbOffsetRange: [-0.03, 0.1], // 3% faster to 10% slower initially
  },
  RANDOM: {
    name: "Random Riley",
    description: "Wildcard - could be anywhere",
    avatarSeed: "random-riley",
    pbOffsetRange: [-0.1, 0.15], // Wide range
  },
}
