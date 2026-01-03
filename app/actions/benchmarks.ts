"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { computePbStatus } from "@/lib/benchmarks/validity"
import { isBetter } from "@/lib/benchmarks/pbCompare"
import {
  evaluateActivityBenchmarks,
  type ActivityForEvaluation,
  type BenchmarkDefForEvaluation,
} from "@/lib/benchmarks/evaluateActivityBenchmarks"

async function getCurrentUserId(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user.id
}

export interface UpsertPbParams {
  benchmarkId: string
  value: number
  achievedAtISO: string
  evidenceUrl?: string
}

/**
 * Create or update a user's personal best for a benchmark
 * value must be canonical numeric (TIME sec, DISTANCE m, SPEED kmh, etc.)
 */
export async function upsertUserPb(params: UpsertPbParams) {
  const userId = await getCurrentUserId()

  const benchmark = await prisma.benchmarkDefinition.findUnique({
    where: { id: params.benchmarkId },
  })

  if (!benchmark) {
    throw new Error("Benchmark not found")
  }

  const achievedAt = new Date(params.achievedAtISO)
  const status = computePbStatus({
    achievedAt,
    validityMonths: benchmark.validityMonths,
    decayAfterMonths: benchmark.decayAfterMonths,
  })

  await prisma.userBenchmarkBest.upsert({
    where: {
      userId_benchmarkId: {
        userId,
        benchmarkId: params.benchmarkId,
      },
    },
    update: {
      value: params.value,
      achievedAt,
      source: "MANUAL",
      verificationStatus: "UNVERIFIED",
      evidenceUrl: params.evidenceUrl,
      isLegacy: status.isLegacy,
    },
    create: {
      userId,
      benchmarkId: params.benchmarkId,
      value: params.value,
      achievedAt,
      source: "MANUAL",
      verificationStatus: "UNVERIFIED",
      evidenceUrl: params.evidenceUrl,
      isLegacy: status.isLegacy,
    },
  })

  revalidatePath("/onboarding/benchmarks")
  revalidatePath("/profile")
  revalidatePath("/rankings")
  revalidatePath("/settings/personal-bests")

  return { ok: true }
}

/**
 * Delete a user's personal best for a benchmark
 */
export async function deleteUserPb(benchmarkId: string) {
  const userId = await getCurrentUserId()

  await prisma.userBenchmarkBest.delete({
    where: {
      userId_benchmarkId: {
        userId,
        benchmarkId,
      },
    },
  })

  revalidatePath("/profile")
  revalidatePath("/rankings")
  revalidatePath("/settings/personal-bests")

  return { ok: true }
}

/**
 * Get all benchmarks for a sport with user's PBs
 */
export async function getBenchmarksForSport(sportId: string) {
  const userId = await getCurrentUserId()

  const benchmarks = await prisma.benchmarkDefinition.findMany({
    where: {
      sportId,
      isActive: true,
    },
    orderBy: [{ rankWeight: "desc" }, { name: "asc" }],
    take: 5,
  })

  const userPbs = await prisma.userBenchmarkBest.findMany({
    where: {
      userId,
      benchmarkId: { in: benchmarks.map((b) => b.id) },
    },
  })

  const pbsByBenchmarkId = new Map(userPbs.map((pb) => [pb.benchmarkId, pb]))

  return benchmarks.map((benchmark) => ({
    ...benchmark,
    userPb: pbsByBenchmarkId.get(benchmark.id) ?? null,
  }))
}

/**
 * Get user's primary sport benchmarks for onboarding
 */
export async function getPrimarySportBenchmarks() {
  const userId = await getCurrentUserId()

  // Find user's primary sport
  const primarySport = await prisma.userSport.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      priority: 0,
    },
    include: { sport: true },
  })

  if (!primarySport) {
    return null
  }

  const benchmarks = await getBenchmarksForSport(primarySport.sportId)

  return {
    sport: primarySport.sport,
    benchmarks,
  }
}

/**
 * Get all user's PBs across all sports
 */
export async function getAllUserPbs() {
  const userId = await getCurrentUserId()

  const pbs = await prisma.userBenchmarkBest.findMany({
    where: { userId },
    include: {
      benchmark: {
        include: { sport: true },
      },
    },
    orderBy: { achievedAt: "desc" },
  })

  return pbs
}

/**
 * Achievement draft from activity form
 */
export interface AchievementDraft {
  benchmarkId: string
  value: number
  source: "USER_ENTERED"
  meta?: Record<string, unknown>
}

/**
 * Process and save activity benchmark results
 * Combines auto-derived benchmarks + user-entered achievements
 * Updates personal bests if applicable
 */
export async function processActivityBenchmarks(params: {
  activityId: string
  sportId: string
  userId: string
  activityDate: Date
  durationSeconds: number | null
  distanceMeters: number | null
  avgSpeed: number | null
  elevationGain: number | null
  avgPace: number | null
  userAchievements?: AchievementDraft[]
}): Promise<{ newPbs: string[] }> {
  const {
    activityId,
    sportId,
    userId,
    activityDate,
    durationSeconds,
    distanceMeters,
    avgSpeed,
    elevationGain,
    avgPace,
    userAchievements = [],
  } = params

  // Get benchmark definitions for this sport
  const benchmarkDefs = await prisma.benchmarkDefinition.findMany({
    where: { sportId, isActive: true },
  })

  if (benchmarkDefs.length === 0) {
    return { newPbs: [] }
  }

  // Prepare activity for auto-evaluation
  const activity: ActivityForEvaluation = {
    id: activityId,
    userId,
    sportId,
    activityDate,
    durationSeconds,
    distanceMeters,
    avgSpeed,
    elevationGain,
    avgPace,
  }

  // Get auto-derived benchmarks
  const autoResults = evaluateActivityBenchmarks(
    activity,
    benchmarkDefs as BenchmarkDefForEvaluation[]
  )

  // Merge with user-entered achievements (user entries take priority)
  const userBenchmarkIds = new Set(userAchievements.map((a) => a.benchmarkId))
  const mergedResults = [
    ...userAchievements.map((a) => ({
      benchmarkId: a.benchmarkId,
      value: a.value,
      source: "USER_ENTERED" as const,
    })),
    ...autoResults.filter((r) => !userBenchmarkIds.has(r.benchmarkId)),
  ]

  // Get user's current PBs for these benchmarks
  const currentPbs = await prisma.userBenchmarkBest.findMany({
    where: {
      userId,
      benchmarkId: { in: mergedResults.map((r) => r.benchmarkId) },
    },
  })
  const pbsByBenchmarkId = new Map(currentPbs.map((pb) => [pb.benchmarkId, pb]))

  const newPbs: string[] = []

  // Process each result
  for (const result of mergedResults) {
    const benchmark = benchmarkDefs.find((b) => b.id === result.benchmarkId)
    if (!benchmark) continue

    const currentPb = pbsByBenchmarkId.get(result.benchmarkId)
    const isNewPb = isBetter(result.value, currentPb?.value ?? null, benchmark.higherIsBetter)

    // Upsert ActivityBenchmarkResult
    await prisma.activityBenchmarkResult.upsert({
      where: {
        activityId_benchmarkId: {
          activityId,
          benchmarkId: result.benchmarkId,
        },
      },
      update: {
        value: result.value,
        source: result.source,
        isPersonalBest: isNewPb,
        countsForRanking: true,
        computedAt: new Date(),
      },
      create: {
        activityId,
        benchmarkId: result.benchmarkId,
        value: result.value,
        source: result.source,
        isPersonalBest: isNewPb,
        countsForRanking: true,
      },
    })

    // Update UserBenchmarkBest if it's a new PB
    if (isNewPb) {
      const status = computePbStatus({
        achievedAt: activityDate,
        validityMonths: benchmark.validityMonths,
        decayAfterMonths: benchmark.decayAfterMonths,
      })

      await prisma.userBenchmarkBest.upsert({
        where: {
          userId_benchmarkId: {
            userId,
            benchmarkId: result.benchmarkId,
          },
        },
        update: {
          value: result.value,
          achievedAt: activityDate,
          source: "ACTIVITY_DERIVED",
          verificationStatus: "VERIFIED_LINKED_ACTIVITY",
          isLegacy: status.isLegacy,
        },
        create: {
          userId,
          benchmarkId: result.benchmarkId,
          value: result.value,
          achievedAt: activityDate,
          source: "ACTIVITY_DERIVED",
          verificationStatus: "VERIFIED_LINKED_ACTIVITY",
          isLegacy: status.isLegacy,
        },
      })

      newPbs.push(benchmark.name)
    }
  }

  if (newPbs.length > 0) {
    revalidatePath("/profile")
    revalidatePath("/rankings")
  }

  return { newPbs }
}

/**
 * Get benchmark leaderboard for a specific benchmark
 */
export async function getBenchmarkLeaderboard(params: {
  benchmarkId: string
  limit?: number
}) {
  const { benchmarkId, limit = 50 } = params

  const benchmark = await prisma.benchmarkDefinition.findUnique({
    where: { id: benchmarkId },
    include: { sport: true },
  })

  if (!benchmark) {
    throw new Error("Benchmark not found")
  }

  // Get non-legacy PBs, ordered by value
  const rows = await prisma.userBenchmarkBest.findMany({
    where: {
      benchmarkId,
      isLegacy: false,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          city: true,
          country: true,
        },
      },
    },
    orderBy: [
      { value: benchmark.higherIsBetter ? "desc" : "asc" },
      { achievedAt: "desc" },
    ],
    take: limit,
  })

  return {
    benchmark,
    rows: rows.map((row, index) => ({
      rank: index + 1,
      userId: row.userId,
      user: row.user,
      value: row.value,
      achievedAt: row.achievedAt,
      source: row.source,
      verificationStatus: row.verificationStatus,
    })),
  }
}

/**
 * Get all benchmarks for a sport (for leaderboard picker)
 */
export async function getSportBenchmarks(sportId: string) {
  const benchmarks = await prisma.benchmarkDefinition.findMany({
    where: { sportId, isActive: true },
    orderBy: [{ rankWeight: "desc" }, { name: "asc" }],
  })

  return benchmarks
}

/**
 * Get all benchmarks grouped by sport for user's active sports
 * Used for the Personal Bests settings page
 */
export async function getUserSportsBenchmarks() {
  const userId = await getCurrentUserId()

  // Get user's active sports
  const userSports = await prisma.userSport.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      sport: true,
    },
    orderBy: { priority: "asc" },
  })

  if (userSports.length === 0) {
    return []
  }

  const sportIds = userSports.map((us) => us.sportId)

  // Get all benchmarks for these sports
  const benchmarks = await prisma.benchmarkDefinition.findMany({
    where: {
      sportId: { in: sportIds },
      isActive: true,
    },
    orderBy: [{ rankWeight: "desc" }, { name: "asc" }],
  })

  // Get user's PBs for all these benchmarks
  const userPbs = await prisma.userBenchmarkBest.findMany({
    where: {
      userId,
      benchmarkId: { in: benchmarks.map((b) => b.id) },
    },
  })

  const pbsByBenchmarkId = new Map(userPbs.map((pb) => [pb.benchmarkId, pb]))

  // Group by sport
  return userSports.map((userSport, index) => {
    const sportBenchmarks = benchmarks
      .filter((b) => b.sportId === userSport.sportId)
      .map((benchmark) => ({
        ...benchmark,
        userPb: pbsByBenchmarkId.get(benchmark.id) ?? null,
      }))

    // Split into primary (top 5 by rankWeight) and secondary
    const primaryBenchmarks = sportBenchmarks.slice(0, 5)
    const secondaryBenchmarks = sportBenchmarks.slice(5)

    return {
      sport: userSport.sport,
      isPrimary: index === 0,
      priority: userSport.priority,
      primaryBenchmarks,
      secondaryBenchmarks,
    }
  })
}
