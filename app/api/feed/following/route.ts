import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

/**
 * GET /api/feed/following
 *
 * Paginated feed of activities from users the current user follows
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 50)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10))
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    // Get who the user follows
    const follows = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    })

    const followingIds = follows.map((f) => f.followingId)
    const followingCount = followingIds.length

    // If not following anyone, return empty
    if (followingCount === 0) {
      return NextResponse.json({
        activities: [],
        followingCount: 0,
        hasMore: false,
        page,
      })
    }

    // Include self in the feed
    const audienceIds = [currentUser.id, ...followingIds]

    // Fetch activities
    const activities = await prisma.activity.findMany({
      where: {
        userId: { in: audienceIds },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit + 1, // Fetch one extra to check if there's more
      select: {
        id: true,
        title: true,
        description: true,
        distanceMeters: true,
        durationSeconds: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        discipline: {
          select: {
            sport: {
              select: { name: true },
            },
          },
        },
      },
    })

    const hasMore = activities.length > limit
    const trimmedActivities = hasMore ? activities.slice(0, limit) : activities

    return NextResponse.json({
      activities: trimmedActivities,
      followingCount,
      hasMore,
      page,
    })
  } catch (error) {
    console.error("Error fetching following feed:", error)
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    )
  }
}
