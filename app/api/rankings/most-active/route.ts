import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type LeaderboardScope = "global" | "country" | "city"

/**
 * GET /api/rankings/most-active
 *
 * Returns the "Most Active" leaderboard based on UserActivityScore.
 * This is a cross-sport ranking based on normalized effort points.
 *
 * Query params:
 * - scope: global|country|city (default: global)
 * - scopeValue: required for country/city scope
 * - windowDays: 7|14|28 (default: 28)
 * - limit: number of entries (default: 50)
 * - offset: pagination offset (default: 0)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const scope = (searchParams.get("scope") || "global") as LeaderboardScope
  const scopeValue = searchParams.get("scopeValue")
  const windowDays = parseInt(searchParams.get("windowDays") || "28")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // Get today's date at midnight UTC for consistent querying
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // Build where clause
    const whereClause: {
      asOfDate: Date
      windowDays: number
      country?: string
      city?: string
    } = {
      asOfDate: today,
      windowDays,
    }

    if (scope === "country" && scopeValue) {
      whereClause.country = scopeValue
    } else if (scope === "city" && scopeValue) {
      whereClause.city = scopeValue
    }

    // Query leaderboard
    const entries = await prisma.userActivityScore.findMany({
      where: whereClause,
      orderBy: { activityScore: "desc" },
      skip: offset,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            city: true,
            country: true,
          },
        },
      },
    })

    // Get total count
    const total = await prisma.userActivityScore.count({
      where: whereClause,
    })

    // Format entries
    const formattedEntries = entries.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.userId,
      username: entry.user.username,
      displayName: entry.user.displayName,
      avatarUrl: entry.user.avatarUrl,
      activityScore: entry.activityScore,
      totalEffort: entry.totalEffort,
      activityCount: entry.activityCount,
      location: entry.user.city || entry.user.country || null,
    }))

    return NextResponse.json({
      entries: formattedEntries,
      meta: {
        total,
        page: Math.floor(offset / limit) + 1,
        limit,
        scope,
        windowDays,
        asOfDate: today.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error fetching most active leaderboard:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
