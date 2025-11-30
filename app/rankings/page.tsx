import { prisma } from "@/lib/db"
import { RankingFilters } from "@/components/rankings/ranking-filters"
import { Leaderboard, RankingEntry } from "@/components/rankings/leaderboard"
import { startOfWeek, startOfMonth, startOfYear, subYears } from "date-fns"
import { Suspense } from "react"

interface RankingsPageProps {
    searchParams: {
        sportId?: string
        period?: string
    }
}

export default async function RankingsPage({ searchParams }: RankingsPageProps) {
    const sportId = searchParams.sportId
    const period = searchParams.period || "weekly"

    // Fetch sports for filter
    const sports = await prisma.sport.findMany({
        orderBy: { name: "asc" },
    })

    // Determine date range
    const now = new Date()
    let startDate = startOfWeek(now)

    switch (period) {
        case "monthly":
            startDate = startOfMonth(now)
            break
        case "yearly":
            startDate = startOfYear(now)
            break
        case "all_time":
            startDate = subYears(now, 100) // Effectively all time
            break
    }

    // Build query filter
    const whereClause: any = {
        activityDate: {
            gte: startDate,
        },
        visibility: "PUBLIC", // Only rank public activities
    }

    if (sportId && sportId !== "all") {
        whereClause.discipline = {
            sportId: sportId,
        }
    }

    // Fetch activities
    // Note: In a real app with large data, we'd use raw SQL or aggregate queries on the DB side.
    // For MVP with Prisma and SQLite, fetching and aggregating in JS is acceptable for small scale.
    const activities = await prisma.activity.findMany({
        where: whereClause,
        include: {
            user: true,
            discipline: {
                include: {
                    sport: true,
                },
            },
        },
    })

    // Aggregate data
    const userStats = new Map<string, {
        user: typeof activities[0]["user"]
        totalValue: number
        unit: string
    }>()

    for (const activity of activities) {
        const userId = activity.userId
        const current = userStats.get(userId) || {
            user: activity.user,
            totalValue: 0,
            unit: "km", // Default unit
        }

        // Determine metric (distance vs duration) based on sport type
        // This is a simplification. Ideally, Sport model would have a 'primaryMetric' field.
        // We'll use distance if available, else duration.
        let value = 0
        let unit = "min"

        if (activity.distanceMeters && activity.distanceMeters > 0) {
            value = activity.distanceMeters / 1000 // Convert to km
            unit = "km"
        } else if (activity.durationSeconds) {
            value = activity.durationSeconds / 60 // Convert to min
            unit = "min"
        }

        // If mixing sports (All Sports view), this aggregation is tricky as units differ.
        // For MVP, if "All Sports" is selected, we might just sum duration as a common denominator?
        // Or just sum "points" if we had them.
        // Let's stick to: if specific sport selected, use its metric. If "All", use duration.

        if (!sportId || sportId === "all") {
            // Fallback to duration for mixed sports
            value = (activity.durationSeconds || 0) / 60
            unit = "min"
        }

        current.totalValue += value
        current.unit = unit
        userStats.set(userId, current)
    }

    // Convert to array and sort
    const rankings: RankingEntry[] = Array.from(userStats.values())
        .sort((a, b) => b.totalValue - a.totalValue)
        .map((stat, index) => ({
            userId: stat.user.id,
            displayName: stat.user.displayName,
            username: stat.user.username,
            avatarUrl: stat.user.avatarUrl,
            value: stat.totalValue,
            unit: stat.unit,
            rank: index + 1,
        }))

    const metricLabel = (!sportId || sportId === "all") ? "Duration" : "Distance/Duration"

    return (
        <div className="container max-w-4xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Rankings</h1>
                <p className="text-muted-foreground">
                    See who's topping the leaderboards this {period}.
                </p>
            </div>

            <Suspense fallback={<div>Loading filters...</div>}>
                <RankingFilters sports={sports} />
            </Suspense>

            <Leaderboard entries={rankings} metricLabel={metricLabel} />
        </div>
    )
}
