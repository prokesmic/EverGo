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
            return NextResponse.json({ error: "User stats not found" }, { status: 404 })
        }

        const sportStats = await prisma.userSportStats.findMany({
            where: { userId },
            include: { sport: true }
        })

        // Calculate percentiles (mocked for now, ideally precomputed)
        const totalUsers = await prisma.userStats.count()
        const globalRank = userStats.globalRank || totalUsers // Fallback
        const percentile = Math.round(((totalUsers - globalRank) / totalUsers) * 100)

        const response = {
            sportIndex: {
                score: userStats.sportIndex,
                bestScore: userStats.sportIndexBest,
                global: {
                    rank: userStats.globalRank || 0,
                    total: totalUsers,
                    percentile
                },
                country: {
                    rank: userStats.countryRank || 0,
                    total: await prisma.userStats.count({ where: { country: userStats.country } }),
                    percentile: 0, // Todo
                    name: userStats.country || "Unknown"
                },
                city: {
                    rank: userStats.cityRank || 0,
                    total: await prisma.userStats.count({ where: { city: userStats.city } }),
                    percentile: 0, // Todo
                    name: userStats.city || "Unknown"
                },
            },
            sports: sportStats.reduce((acc, stat) => {
                acc[stat.sport.slug] = {
                    score: stat.performanceScore,
                    global: { rank: stat.globalRank || 0, total: 0 }, // Todo: get totals
                    country: { rank: stat.countryRank || 0, total: 0 },
                    city: { rank: stat.cityRank || 0, total: 0 },
                    friends: { rank: stat.friendsRank || 0, total: 0 },
                }
                return acc
            }, {} as Record<string, any>)
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error fetching user rankings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
