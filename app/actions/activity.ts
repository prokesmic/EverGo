"use server"

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const createActivitySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    sportId: z.string().min(1, "Sport is required"),
    disciplineId: z.string().min(1, "Discipline is required"),
    activityDate: z.string(), // ISO string
    durationSeconds: z.number().min(0).optional(),
    distanceMeters: z.number().min(0).optional(),
    caloriesBurned: z.number().min(0).optional(),
    visibility: z.enum(["PUBLIC", "FOLLOWERS_ONLY", "PRIVATE"]),
})

export async function createActivity(formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        throw new Error("Unauthorized")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        throw new Error("User not found")
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        sportId: formData.get("sportId"),
        disciplineId: formData.get("disciplineId"),
        activityDate: formData.get("activityDate"),
        durationSeconds: Number(formData.get("durationSeconds")) || undefined,
        distanceMeters: Number(formData.get("distanceMeters")) || undefined,
        caloriesBurned: Number(formData.get("caloriesBurned")) || undefined,
        visibility: formData.get("visibility"),
    }

    const validatedData = createActivitySchema.parse(rawData)

    // Calculate primary value (simplistic logic for now)
    // For distance sports, it's distance. For others, it's duration or score.
    // We'll default to distance if present, else duration.
    const primaryValue = validatedData.distanceMeters || validatedData.durationSeconds || 0

    await prisma.activity.create({
        data: {
            userId: user.id,
            disciplineId: validatedData.disciplineId,
            title: validatedData.title,
            description: validatedData.description,
            activityDate: new Date(validatedData.activityDate),
            durationSeconds: validatedData.durationSeconds,
            distanceMeters: validatedData.distanceMeters,
            caloriesBurned: validatedData.caloriesBurned,
            visibility: validatedData.visibility as any,
            primaryValue: primaryValue,
            photos: "", // Placeholder
            source: "MANUAL",
        },
    })

    revalidatePath("/home")
    revalidatePath(`/profile/${user.username}`)
    redirect(`/profile/${user.username}`)
}
