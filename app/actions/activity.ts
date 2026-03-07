"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { ActionResult, ok, fail, classifyPrismaError } from "@/lib/actions/result"
import { createActivityDomain } from "@/lib/domains/activity/service"

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

        const created = await createActivityDomain({
            userId: user.id,
            sportId: input.sportId,
            disciplineId: input.disciplineId ?? null,
            title: input.title,
            description: input.description ?? null,
            activityDate: input.activityDate,
            durationSeconds: input.durationSeconds ?? null,
            distanceMeters: input.distanceMeters ?? null,
            elevationGain: input.elevationGain ?? null,
            caloriesBurned: input.caloriesBurned ?? null,
            avgHeartRate: input.avgHeartRate ?? null,
            visibility: input.visibility,
            photos: [],
            rpe: input.rpe ?? null,
            createPost: true,
        })

        // Revalidate paths
        revalidatePath("/home")
        revalidatePath(`/profile/${user.username}`)

        return ok({ id: created.activityId, username: user.username || "me" })
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
