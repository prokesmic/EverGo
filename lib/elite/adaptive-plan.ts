import { prisma } from "@/lib/db"
import { getReadinessSnapshot } from "@/lib/elite/readiness"
import { getPersonalizationProfile } from "@/lib/personalization/profile"

export interface AdaptiveWorkoutBlock {
  label: string
  minutes: number
  intent: "WARMUP" | "MAIN" | "RECOVERY" | "COOLDOWN"
  instruction: string
}

export interface AdaptivePlan {
  date: string
  sport: {
    id: string | null
    slug: string | null
    name: string
  }
  objective: string
  readinessScore: number
  recommendedRpe: number
  estimatedLoadPoints: number
  volumeMinutes: number
  rationale: Array<{ label: string; detail: string }>
  coachNotes: string[]
  blocks: AdaptiveWorkoutBlock[]
  fallbackPlan: string[]
  primaryAction: {
    label: string
    href: string
  }
}

export async function buildAdaptivePlan(userId: string, availableMinutes = 45): Promise<AdaptivePlan> {
  const [readiness, primarySport, profile] = await Promise.all([
    getReadinessSnapshot(userId),
    prisma.userSport.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { priority: "asc" },
      include: {
        sport: {
          select: { id: true, slug: true, name: true },
        },
      },
    }),
    getPersonalizationProfile(userId),
  ])

  const baselineMinutes = profile.typicalSessionMinutes || availableMinutes
  const budget = clamp(Math.round((availableMinutes + baselineMinutes) / 2), 20, 120)
  const sport = primarySport?.sport ?? { id: null, slug: null, name: "Training" }

  let objective = "Recovery + movement quality"
  let recommendedRpe = 4
  let split = { warmup: 8, main: 14, recovery: 0, cooldown: 8 }
  const rationale: AdaptivePlan["rationale"] = []
  const coachNotes: string[] = []

  if (readiness.recovery.suggestedIntensity === "QUALITY") {
    objective = "Quality day: threshold and race-specific control"
    recommendedRpe = 7
    split = { warmup: 12, main: 22, recovery: 4, cooldown: 7 }
    rationale.push({
      label: "Readiness supports quality work",
      detail: `Readiness ${readiness.score}% suggests a high-intensity window.`,
    })
    coachNotes.push("Keep intervals controlled; stop 1 rep early if HR lags.")
  } else if (readiness.recovery.suggestedIntensity === "EASY") {
    objective = "Aerobic base with light neuromuscular touches"
    recommendedRpe = 5
    split = { warmup: 10, main: 20, recovery: 3, cooldown: 7 }
    rationale.push({
      label: "Aerobic consistency priority",
      detail: "Maintain base volume without excess fatigue.",
    })
    coachNotes.push("Add 4 x 20s relaxed strides if legs feel light.")
  } else {
    rationale.push({
      label: "Recovery emphasis",
      detail: "Fatigue indicators suggest low intensity.",
    })
    coachNotes.push("Stay conversational throughout; prioritize mobility after.")
  }

  const scale = budget / (split.warmup + split.main + split.recovery + split.cooldown)
  const blocks = buildBlocks(sport.slug, {
    warmup: Math.max(5, Math.round(split.warmup * scale)),
    main: Math.max(10, Math.round(split.main * scale)),
    recovery: Math.max(0, Math.round(split.recovery * scale)),
    cooldown: Math.max(5, Math.round(split.cooldown * scale)),
  }, readiness.recovery.suggestedIntensity)

  const estimatedLoadPoints = Math.round(
    blocks.reduce((sum, block) => sum + block.minutes, 0) * (recommendedRpe / 2)
  )
  const volumeMinutes = blocks.reduce((sum, block) => sum + block.minutes, 0)

  const fallbackPlan =
    readiness.score < 46
      ? [
          "20-30 min easy effort only",
          "Add mobility and breathing reset",
          "Skip high-intensity intervals today",
        ]
      : [
          "If time-crunched, complete warmup + 1 main set",
          "Keep cooldown even on short sessions",
          "Adjust effort if perceived fatigue rises above planned RPE",
        ]

  const primaryAction =
    sport.slug === "running" || sport.slug === "cycling" || sport.slug === "walking"
      ? { label: "Start Guided Session", href: "/activity/track" }
      : { label: "Log Planned Session", href: "/activity/create" }

  return {
    date: new Date().toISOString(),
    sport: {
      id: sport.id,
      slug: sport.slug,
      name: sport.name,
    },
    objective,
    readinessScore: readiness.score,
    recommendedRpe,
    estimatedLoadPoints,
    volumeMinutes,
    rationale,
    coachNotes,
    blocks,
    fallbackPlan,
    primaryAction,
  }
}

function buildBlocks(
  sportSlug: string | null,
  minutes: { warmup: number; main: number; recovery: number; cooldown: number },
  intensity: "RECOVERY" | "EASY" | "QUALITY"
): AdaptiveWorkoutBlock[] {
  const sportCue =
    sportSlug === "running"
      ? "easy jog"
      : sportSlug === "cycling"
        ? "easy spin"
        : "easy effort"

  const mainInstruction =
    intensity === "QUALITY"
      ? `Progressive intervals at controlled threshold with ${sportCue} recoveries`
      : intensity === "EASY"
        ? `Steady aerobic block with cadence focus and ${sportCue}`
        : `Low-intensity ${sportCue}, keep breathing comfortable and conversational`

  const blocks: AdaptiveWorkoutBlock[] = [
    {
      label: "Warm-up",
      minutes: minutes.warmup,
      intent: "WARMUP",
      instruction: "Dynamic mobility, activation, and gradual effort ramp",
    },
    {
      label: "Main set",
      minutes: minutes.main,
      intent: "MAIN",
      instruction: mainInstruction,
    },
  ]

  if (minutes.recovery > 0) {
    blocks.push({
      label: "Recovery set",
      minutes: minutes.recovery,
      intent: "RECOVERY",
      instruction: "Very easy movement to normalize breathing and heart rate",
    })
  }

  blocks.push({
    label: "Cooldown",
    minutes: minutes.cooldown,
    intent: "COOLDOWN",
    instruction: "Easy movement + mobility; finish with nasal breathing",
  })

  return blocks
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
