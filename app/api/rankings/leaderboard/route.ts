import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport")
    const scope = searchParams.get("scope") || "global"
    const scopeValue = searchParams.get("scopeValue")
    const period = searchParams.get("period") || "all_time"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    try {
        let whereClause: any = {}

        if (scope === "country" && scopeValue) whereClause.country = scopeValue
        if (scope === "city" && scopeValue) whereClause.city = scopeValue
        // Friends/Team scope implementation omitted for brevity

        let orderBy: any = { sportIndex: 'desc' }

        // If specific sport, query UserSportStats instead
        if (sport && sport !== "all") {
            const sportRecord = await prisma.sport.findUnique({ where: { slug: sport } })
            if (!sportRecord) return NextResponse.json({ error: "Sport not found" }, { status: 404 })

            const leaderboard = await prisma.userSportStats.findMany({
                where: {
                    sportId: sportRecord.id,
                    // Add scope filtering here if UserSportStats had location data, 
                    // otherwise we need to join with User/UserStats. 
                    // For now, let's assume global for sport specific or simple join.
                    user: {
                        ...(scope === "country" && scopeValue ? { country: scopeValue } : {}),
                        ...(scope === "city" && scopeValue ? { city: scopeValue } : {}),
                    }
                },
                orderBy: { performanceScore: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { user: true }
            })

            const total = await prisma.userSportStats.count({
                where: {
                    sportId: sportRecord.id,
                    user: {
                        ...(scope === "country" && scopeValue ? { country: scopeValue } : {}),
                        ...(scope === "city" && scopeValue ? { city: scopeValue } : {}),
                    }
                }
            })

            return NextResponse.json({
                leaderboard: leaderboard.map((entry, index) => ({
                    rank: (page - 1) * limit + index + 1,
                    userId: entry.userId,
                    username: entry.user.username,
                    displayName: entry.user.displayName,
                    avatarUrl: entry.user.avatarUrl,
                    score: entry.performanceScore,
                    trend: 'same', // Placeholder
                    trendAmount: 0,
                    location: entry.user.city || entry.user.country
                })),
                meta: { total, page, limit, scope, period }
            })
        }

        // Overall Sport Index Leaderboard
        const leaderboard = await prisma.userStats.findMany({
            where: whereClause,
            orderBy: orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: { user: true }
        })

        const total = await prisma.userStats.count({ where: whereClause })

        return NextResponse.json({
            leaderboard: leaderboard.map((entry, index) => ({
                rank: (page - 1) * limit + index + 1,
                userId: entry.userId,
                username: entry.user.username,
                displayName: entry.user.displayName,
                avatarUrl: entry.user.avatarUrl,
                score: entry.sportIndex,
                trend: 'same', // Placeholder
                trendAmount: 0,
                location: entry.city || entry.country
            })),
            meta: { total, page, limit, scope, period }
        })

    } catch (error) {
        console.error("Error fetching leaderboard:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
