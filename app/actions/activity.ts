"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ActionResult, ok, fail, classifyPrismaError } from "@/lib/actions/result"
import { updateGauntletScores } from "@/lib/gauntlet"
import { calculatePower } from "@/lib/power"
import { updateSeasonScore } from "@/lib/season"
import { updateCrewWarScores } from "@/lib/crew-wars"

// Achievement input schema - value must be numeric
const AchievementInput = z.object({
    benchmarkId: z.string().min(1),
    value: z.coerce.number().finite().positive(),
    note: z.string().max(200).optional(),
})

// Main activity creation schema with coercion
const CreateActivityInput = z.object({
    sportId: z.string().min(1, "Sport is required"),
    disciplineId: z.string().optional(),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(2000).optional().nullable(),
    activityDate: z.coerce.date(),
    durationSeconds: z.coerce.number().int().nonnegative().optional().nullable(),
    distanceMeters: z.coerce.number().nonnegative().optional().nullable(),
    elevationGain: z.coerce.number().nonnegative().optional().nullable(),
    caloriesBurned: z.coerce.number().int().nonnegative().optional().nullable(),
    avgHeartRate: z.coerce.number().int().nonnegative().optional().nullable(),
    visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]).default("PUBLIC"),
    achievements: z.array(AchievementInput).optional().default([]),
    rpe: z.coerce.number().int().min(1).max(10).optional().nullable(),
})

export type CreateActivityInput = z.infer<typeof CreateActivityInput>

/**
 * Robust activity creation with proper error classification
 * - Returns ActionResult with typed errors
 * - Achievements are best-effort (never block base activity)
 * - Post-create hooks are resilient
 */
export async function createActivityAction(
    raw: unknown
): Promise<ActionResult<{ id: string; username: string }>> {
    try {
        // Auth check
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return fail("UNAUTHORIZED", "Please log in to create an activity.")
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, username: true },
        })

        if (!user) {
            return fail("UNAUTHORIZED", "User account not found. Please log in again.")
        }

        // Parse and validate input
        const parsed = CreateActivityInput.safeParse(raw)
        if (!parsed.success) {
            return fail("VALIDATION_ERROR", "Please fix the highlighted fields.", {
                fieldErrors: parsed.error.flatten().fieldErrors,
                formErrors: parsed.error.flatten().formErrors,
            })
        }

        const input = parsed.data

        // Validate sport exists
        const sport = await prisma.sport.findUnique({
            where: { id: input.sportId },
            select: { id: true },
        })

        if (!sport) {
            return fail("VALIDATION_ERROR", "Selected sport does not exist.")
        }

        // Validate discipline belongs to sport (if provided)
        let disciplineId = input.disciplineId || null
        if (input.disciplineId) {
            const discipline = await prisma.discipline.findFirst({
                where: { id: input.disciplineId, sportId: input.sportId },
                select: { id: true },
            })
            if (!discipline) {
                // Log warning but don't fail - just ignore invalid discipline
                console.warn(
                    `[createActivity] Discipline ${input.disciplineId} does not belong to sport ${input.sportId}, ignoring`
                )
                disciplineId = null
            }
        }

        // If no valid disciplineId, try to get a default discipline for the sport
        if (!disciplineId) {
            const defaultDiscipline = await prisma.discipline.findFirst({
                where: { sportId: input.sportId },
                select: { id: true },
            })
            disciplineId = defaultDiscipline?.id || null
        }

        // Benchmarks/achievements removed in V6

        // Calculate primary value
        const primaryValue = input.distanceMeters || input.durationSeconds || 0

        // Create activity in transaction
        const activity = await prisma.$transaction(async (tx) => {
            // Create base activity - this MUST succeed
            const created = await tx.activity.create({
                data: {
                    userId: user.id,
                    sportId: input.sportId,
                    disciplineId: disciplineId!,
                    title: input.title,
                    description: input.description ?? null,
                    activityDate: input.activityDate,
                    durationSeconds: input.durationSeconds ?? null,
                    distanceMeters: input.distanceMeters ?? null,
                    elevationGain: input.elevationGain ?? null,
                    caloriesBurned: input.caloriesBurned ?? null,
                    avgHeartRate: input.avgHeartRate ?? null,
                    visibility: input.visibility,
                    primaryValue: primaryValue,
                    photos: "[]",
                    source: "MANUAL",
                },
                select: { id: true },
            })

            // Benchmark results removed in V6

            return created
        })

        // Post-create hooks - each wrapped in try/catch so they never block success
        try {
            await updateUserStats(user.id)
        } catch (e) {
            console.error("[createActivity] updateUserStats failed", e)
        }

        try {
            await updateStreak(user.id)
        } catch (e) {
            console.error("[createActivity] updateStreak failed", e)
        }

        try {
            await checkBadgeEligibility(user.id)
        } catch (e) {
            console.error("[createActivity] checkBadgeEligibility failed", e)
        }

        try {
            if (input.visibility === "PUBLIC") {
                await createActivityFeedPost({ activityId: activity.id })
            }
        } catch (e) {
            console.error("[createActivity] createActivityFeedPost failed", e)
        }

        // Update gauntlet, season, and crew war scores
        try {
            const durationSeconds = input.durationSeconds ?? 0
            const rpe = input.rpe ?? 5
            const { power: activityPower } = calculatePower(durationSeconds, rpe, false)
            if (activityPower > 0) {
                await Promise.all([
                    updateGauntletScores(user.id, activityPower),
                    updateSeasonScore(user.id, activityPower),
                    updateCrewWarScores(user.id, activityPower),
                ])
            }
        } catch (e) {
            console.error("[createActivity] competition scores update failed", e)
        }

        // Revalidate paths
        revalidatePath("/home")
        revalidatePath(`/profile/${user.username}`)

        return ok({ id: activity.id, username: user.username || "me" })
    } catch (e: unknown) {
        console.error("[createActivity] unexpected error:", e)
        const classified = classifyPrismaError(e)
        return fail(classified.code, classified.message, classified.details)
    }
}

/**
 * Legacy wrapper for FormData-based calls
 * Converts FormData to object and calls createActivityAction
 */
export async function createActivity(formData: FormData) {
    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        sportId: formData.get("sportId"),
        disciplineId: formData.get("disciplineId"),
        activityDate: formData.get("activityDate"),
        durationSeconds: formData.get("durationSeconds") || undefined,
        distanceMeters: formData.get("distanceMeters") || undefined,
        caloriesBurned: formData.get("caloriesBurned") || undefined,
        visibility: formData.get("visibility"),
        achievements: [], // FormData doesn't support nested arrays easily
    }

    const result = await createActivityAction(rawData)

    if (!result.ok) {
        // Throw for legacy compatibility - old callers expect throws
        throw new Error(result.error.message)
    }

    // Legacy behavior: redirect after success
    const { redirect } = await import("next/navigation")
    redirect(`/profile/${result.data.username}`)
}

// Stub implementations for post-create hooks
// These should be replaced with actual implementations

async function updateUserStats(userId: string) {
    // Update user's activity stats (total activities, total distance, etc.)
    // Implementation depends on your UserStats model
    try {
        const stats = await prisma.activity.aggregate({
            where: { userId },
            _count: { id: true },
            _sum: { distanceMeters: true, durationSeconds: true, caloriesBurned: true },
        })
        // Store in UserStats if you have such a model
        // await prisma.userStats.upsert(...)
    } catch {
        // Non-critical - log and continue
    }
}

async function updateStreak(userId: string) {
    // Update user's activity streak
    // Implementation depends on your streak tracking approach
    try {
        // Get recent activities and calculate streak
        // await prisma.userStreak.upsert(...)
    } catch {
        // Non-critical
    }
}

async function checkBadgeEligibility(userId: string) {
    // Check if user qualifies for any new badges
    // Implementation depends on your badge system
    try {
        // Check badge criteria
        // await prisma.userBadge.createMany(...)
    } catch {
        // Non-critical
    }
}

async function createActivityFeedPost(params: { activityId: string }) {
    // Create a feed post for the activity
    // Implementation depends on your feed system
    try {
        // If you have a FeedItem or Post model
        // await prisma.feedItem.create(...)
    } catch {
        // Non-critical
    }
}
