import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Scope = "following" | "me"

export interface HighlightEvent {
  id: string
  type: "RANK_DELTA" | "PERSONAL_BEST" | "RIVALRY_SWING" | "TEAM_WIN" | "BIG_WEEK_DELTA"
  createdAt: Date
  actor: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
  title: string
  context: string
  chip: string
  sportSlug: string | null
  disciplineName: string | null
}

/**
 * GET /api/feed/highlights
 *
 * Rankings-first highlights feed showing:
 * - RankChange: User moved up/down in leaderboard
 * - PB: Personal best achieved
 * - RivalrySwing: Rivalry score changed
 * - TeamSwing: Team competition update
 * - BigWeekDelta: Significant weekly progress
 *
 * Query params:
 * - scope: "following" | "me" (default: "following")
 * - limit: number (default: 10, max: 50)
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
    const scope = (url.searchParams.get("scope") as Scope) || "following"
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 50)

    // Determine which users to include
    let userIds: string[] = [currentUser.id]

    if (scope === "following") {
      const follows = await prisma.follow.findMany({
        where: { followerId: currentUser.id },
        select: { followingId: true },
      })
      userIds = [...userIds, ...follows.map((f) => f.followingId)]
    }

    // Fetch recent FeedItems for rankings-first events
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const feedItems = await prisma.feedItem.findMany({
      where: {
        actorUserId: { in: userIds },
        createdAt: { gte: sevenDaysAgo },
        type: {
          in: [
            "RANK_DELTA",
            "PERSONAL_BEST",
            "RIVALRY_SWING",
            "RIVALRY_COMPLETED",
            "TEAM_WIN",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        discipline: {
          select: {
            name: true,
            slug: true,
            sport: { select: { slug: true, name: true } },
          },
        },
      },
    })

    // Get user info for all actors
    const actorIds = [...new Set(feedItems.map((f) => f.actorUserId))]
    const users = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, displayName: true, avatarUrl: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    // Transform to HighlightEvent format
    const highlights: HighlightEvent[] = feedItems.map((item) => {
      const actor = userMap.get(item.actorUserId) || {
        id: item.actorUserId,
        displayName: "Unknown",
        avatarUrl: null,
      }

      const { title, context, chip } = formatHighlight(item)

      return {
        id: item.id,
        type: item.type as HighlightEvent["type"],
        createdAt: item.createdAt,
        actor,
        title,
        context,
        chip,
        sportSlug: item.discipline?.sport?.slug ?? null,
        disciplineName: item.discipline?.name ?? null,
      }
    })

    return NextResponse.json({
      highlights,
      hasMore: feedItems.length === limit,
    })
  } catch (error) {
    console.error("Error fetching highlights:", error)
    return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 })
  }
}

function formatHighlight(item: {
  type: string
  deltaRank?: number | null
  deltaValue?: number | null
  newValue?: number | null
  newRank?: number | null
  discipline?: { name: string; slug: string; sport?: { name: string; slug: string } | null } | null
}): { title: string; context: string; chip: string } {
  const disciplineName = item.discipline?.name ?? "Sport Index"
  const sportName = item.discipline?.sport?.name ?? ""

  switch (item.type) {
    case "RANK_DELTA": {
      const delta = item.deltaRank ?? 0
      const newRank = item.newRank ?? 0
      const direction = delta > 0 ? "up" : "down"
      return {
        title: `Moved ${direction} in ${disciplineName}`,
        context: sportName ? `${sportName} leaderboard` : "Leaderboard",
        chip: delta > 0 ? `↑${Math.abs(delta)}` : `↓${Math.abs(delta)}`,
      }
    }

    case "PERSONAL_BEST": {
      return {
        title: `New PB in ${disciplineName}`,
        context: sportName || "Personal record",
        chip: "PB",
      }
    }

    case "RIVALRY_SWING": {
      const delta = item.deltaValue ?? 0
      return {
        title: "Rivalry score changed",
        context: disciplineName,
        chip: delta > 0 ? `+${delta.toFixed(0)}` : `${delta.toFixed(0)}`,
      }
    }

    case "RIVALRY_COMPLETED": {
      return {
        title: "Rivalry completed!",
        context: disciplineName,
        chip: "Win",
      }
    }

    case "TEAM_WIN": {
      return {
        title: "Team victory",
        context: disciplineName,
        chip: "🏆",
      }
    }

    default:
      return {
        title: "Activity update",
        context: disciplineName,
        chip: "•",
      }
  }
}
