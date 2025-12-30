import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

/**
 * GET /api/rivalries/suggested
 *
 * Returns suggested rivals for the current user based on:
 * 1. Mutual follows (friends)
 * 2. Similar sport index (within 100 points)
 * 3. Same city
 * 4. Recent activity (active in last 14 days)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        stats: true,
        following: { select: { followingId: true } },
        followers: { select: { followerId: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const followingIds = user.following.map((f) => f.followingId)
    const followerIds = user.followers.map((f) => f.followerId)

    // Find mutual follows
    const mutualFollowIds = followingIds.filter((id) => followerIds.includes(id))

    // Get users who are:
    // 1. Mutual follows (highest priority)
    // 2. Following you (medium priority)
    // 3. Same city with similar sport index (lower priority)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const userSportIndex = user.stats?.sportIndex || 0

    // Query potential rivals
    const potentialRivals = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        OR: [
          // Mutual follows
          { id: { in: mutualFollowIds } },
          // Followers (they follow user)
          { id: { in: followerIds } },
          // Same city with similar sport index
          {
            city: user.city || undefined,
            stats: {
              sportIndex: {
                gte: userSportIndex - 100,
                lte: userSportIndex + 100,
              },
            },
          },
        ],
        // Has been active recently
        activities: {
          some: {
            activityDate: { gte: fourteenDaysAgo },
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        stats: {
          select: { sportIndex: true },
        },
      },
      take: 20,
    })

    // Score and sort rivals
    const scoredRivals = potentialRivals.map((rival) => {
      let score = 0

      // Mutual follow = highest priority
      if (mutualFollowIds.includes(rival.id)) {
        score += 100
      } else if (followerIds.includes(rival.id)) {
        // They follow user
        score += 50
      }

      // Similar sport index = bonus
      const rivalIndex = rival.stats?.sportIndex || 0
      const indexDiff = Math.abs(rivalIndex - userSportIndex)
      if (indexDiff <= 50) {
        score += 30
      } else if (indexDiff <= 100) {
        score += 15
      }

      return {
        id: rival.id,
        displayName: rival.displayName,
        username: rival.username,
        avatarUrl: rival.avatarUrl,
        sportIndex: rival.stats?.sportIndex,
        mutualFollows: mutualFollowIds.includes(rival.id),
        score,
      }
    })

    // Sort by score descending and take top 10
    const sortedRivals = scoredRivals
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...rival }) => rival) // Remove internal score

    return NextResponse.json({ rivals: sortedRivals })
  } catch (error) {
    console.error("Error fetching suggested rivals:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggested rivals" },
      { status: 500 }
    )
  }
}
