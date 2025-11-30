import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params

    try {
        const streak = await prisma.userStreak.findUnique({
            where: { userId }
        })

        if (!streak) {
            // Return default empty streak
            return NextResponse.json({
                currentStreak: 0,
                longestStreak: 0,
                lastActivityDate: null,
                weeklyProgress: 0,
                weeklyGoal: 3,
                streakAtRisk: false
            })
        }

        // Calculate if streak is at risk (no activity today)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let streakAtRisk = false
        if (streak.lastActivityDate) {
            const lastDate = new Date(streak.lastActivityDate)
            lastDate.setHours(0, 0, 0, 0)

            // If last activity was yesterday, streak is at risk today
            const diffTime = Math.abs(today.getTime() - lastDate.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays === 1) {
                streakAtRisk = true
            }
        }

        return NextResponse.json({
            ...streak,
            streakAtRisk
        })
    } catch (error) {
        console.error("Error fetching streak:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
