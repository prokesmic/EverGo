import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params

    try {
        const userStats = await prisma.userStats.findUnique({
            where: { userId }
        })

        if (!userStats) {
            return NextResponse.json({ insights: [] })
        }

        const insights = []

        // Example insights logic
        if (userStats.globalRank && userStats.globalRank <= 1000) {
            insights.push({
                type: 'rank_up',
                message: `You are in the top 1000 globally! Current rank: #${userStats.globalRank}`,
                priority: 10
            })
        }

        if (userStats.sportIndex > 500) {
            insights.push({
                type: 'improvement',
                message: "Your Sport Index is impressive! Keep pushing to reach 600.",
                priority: 5
            })
        }

        // Add more dynamic insights here based on recent activity, friends, etc.

        return NextResponse.json({ insights })
    } catch (error) {
        console.error("Error fetching insights:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
