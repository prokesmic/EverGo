import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    try {
        // Get the current user's stats
        const userStats = await prisma.userStats.findUnique({
            where: { userId }
        })

        if (!userStats || !userStats.sportIndex) {
            return NextResponse.json({ rival: null, delta: 0 })
        }

        // Find a rival: someone close in Sport Index (within +/- 50 points)
        // who is slightly ahead of the user to create motivation
        const rivals = await prisma.userStats.findMany({
            where: {
                userId: { not: userId },
                sportIndex: {
                    gte: userStats.sportIndex - 30,
                    lte: userStats.sportIndex + 100
                }
            },
            orderBy: {
                sportIndex: 'desc'
            },
            take: 10,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        })

        // Find the best rival (someone slightly ahead if possible)
        let rival = rivals.find(r => r.sportIndex > userStats.sportIndex)

        // If no one ahead, pick closest one behind
        if (!rival && rivals.length > 0) {
            rival = rivals[0]
        }

        if (!rival) {
            return NextResponse.json({ rival: null, delta: 0 })
        }

        const delta = userStats.sportIndex - rival.sportIndex

        return NextResponse.json({
            rival: {
                id: rival.userId,
                displayName: rival.user.displayName || rival.user.username,
                avatarUrl: rival.user.avatarUrl,
                globalRank: rival.globalRank,
                sportIndex: rival.sportIndex,
                city: rival.city
            },
            delta
        })
    } catch (error) {
        console.error("Error fetching rival:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
