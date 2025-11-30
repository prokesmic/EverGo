import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            sportId,
            disciplineId,
            title,
            description,
            activityDate,
            durationSeconds,
            distanceMeters,
            elevationGain,
            caloriesBurned,
            avgHeartRate,
            photos,
            visibility = "PUBLIC"
        } = body

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Create Activity
        const activity = await prisma.activity.create({
            data: {
                userId: user.id,
                sportId,
                disciplineId: disciplineId || "unknown", // Fallback if not provided, though schema requires it. Ideally we fetch default discipline for sport.
                title,
                description,
                activityDate: new Date(activityDate),
                durationSeconds,
                distanceMeters,
                elevationGain,
                caloriesBurned,
                avgHeartRate,
                photos: photos ? JSON.stringify(photos) : "[]",
                visibility,
                primaryValue: distanceMeters || durationSeconds || 0 // Simple fallback
            }
        })

        // Handle Gear Assignment
        if (body.gearIds && Array.isArray(body.gearIds)) {
            await prisma.activityGear.createMany({
                data: body.gearIds.map((gearId: string) => ({
                    activityId: activity.id,
                    gearId
                }))
            })
        }

        // Create associated Post
        const post = await prisma.post.create({
            data: {
                userId: user.id,
                postType: "ACTIVITY",
                content: description, // Use description as post content? Or keep separate? Spec says content is for status. Let's use description.
                activityId: activity.id,
                photos: photos ? JSON.stringify(photos) : "[]",
                visibility
            }
        })

        // Trigger Gamification & Monetization Logic (Async)
        try {
            const { updateStreakOnActivity, updateChallengeProgress, checkBadgeCriteria } = await import("@/lib/gamification")
            const { updateGearUsage } = await import("@/lib/monetization")

            await Promise.all([
                updateStreakOnActivity(user.id, new Date(activityDate)),
                updateChallengeProgress(user.id, activity),
                checkBadgeCriteria(user.id),
                updateGearUsage(activity.id)
            ])
        } catch (e) {
            console.error("Gamification/Monetization error:", e)
            // Don't fail the request if background tasks fail
        }

        return NextResponse.json({ activity, post })

    } catch (error) {
        console.error("Error creating activity:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
