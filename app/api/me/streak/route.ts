import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { streak: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Return streak data or defaults
        const streakData = user.streak || {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            weeklyStreak: 0,
            weeklyGoal: 3,
            weeklyProgress: 0
        }

        return NextResponse.json({
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            lastActivityDate: streakData.lastActivityDate,
            weeklyStreak: streakData.weeklyStreak,
            weeklyGoal: streakData.weeklyGoal,
            weeklyProgress: streakData.weeklyProgress
        })
    } catch (error) {
        console.error("Error fetching streak:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
