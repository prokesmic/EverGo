import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        following: {
          select: {
            followingId: true,
          },
        },
      },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get list of users the current user is already following
    const followingIds = currentUser.following.map(f => f.followingId)

    // Get current user's sports from their activities
    const userActivities = await prisma.activity.findMany({
      where: { userId: currentUser.id },
      include: {
        discipline: {
          include: {
            sport: true,
          },
        },
      },
      take: 50,
    })

    const userSportIds = [...new Set(userActivities.map(a => a.discipline.sport.id))]

    // Find suggested athletes based on:
    // 1. Same city
    // 2. Same sport (from activities)
    // 3. Mutual follows
    // 4. Not already following

    // First, find users in the same city
    const sameCityUsers = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.id,
          notIn: followingIds,
        },
        city: currentUser.city,
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
      take: 20,
    })

    // Find users with activities in the same sports
    const sameSportUsers = await prisma.user.findMany({
      where: {
        id: {
          not: currentUser.id,
          notIn: followingIds,
        },
        activities: {
          some: {
            discipline: {
              sportId: {
                in: userSportIds,
              },
            },
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        _count: {
          select: {
            activities: true,
          },
        },
      },
      take: 20,
    })

    // Combine and deduplicate users
    const allSuggestedUsers = [...sameCityUsers, ...sameSportUsers]
    const uniqueUsers = Array.from(
      new Map(allSuggestedUsers.map(user => [user.id, user])).values()
    )

    // For each user, calculate mutual follows and get primary sport
    const suggestions = await Promise.all(
      uniqueUsers.map(async (user) => {
        // Get mutual follows count
        const mutualFollows = await prisma.follow.count({
          where: {
            followerId: user.id,
            followingId: {
              in: followingIds,
            },
          },
        })

        // Get user's most recent activity to determine primary sport
        const recentActivity = await prisma.activity.findFirst({
          where: { userId: user.id },
          include: {
            discipline: {
              include: {
                sport: true,
              },
            },
          },
          orderBy: {
            activityDate: "desc",
          },
        })

        const primarySport = recentActivity?.discipline.sport.name || null

        return {
          id: user.id,
          displayName: user.displayName || "Athlete",
          avatarUrl: user.avatarUrl,
          city: user.city,
          primarySport,
          mutualFollows,
          totalActivities: user._count.activities,
          isFollowing: false,
        }
      })
    )

    // Sort by relevance score:
    // Same city: +3 points
    // Same sport: +2 points (if primary sport matches user's sports)
    // Mutual follows: +1 point per mutual follow
    const scoredSuggestions = suggestions.map(s => {
      let score = 0
      if (s.city === currentUser.city) score += 3
      if (s.primarySport && userActivities.some(a => a.discipline.sport.name === s.primarySport)) score += 2
      score += s.mutualFollows
      return { ...s, score }
    })

    // Sort by score (descending) and return top 10
    const topSuggestions = scoredSuggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    return NextResponse.json({ suggestions: topSuggestions })
  } catch (error) {
    console.error("Error fetching follow suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}
