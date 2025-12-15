import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ friends: [] })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ friends: [] })
    }

    // Get users that the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: {
        following: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            activities: {
              orderBy: { activityDate: "desc" },
              take: 1,
              include: {
                discipline: {
                  include: { sport: true },
                },
              },
            },
          },
        },
      },
    })

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

    const friends = following.map((f) => {
      const lastActivity = f.following.activities[0]
      const isActive = lastActivity
        ? new Date(lastActivity.activityDate) > thirtyMinutesAgo
        : false

      // Get sport emoji
      const sportName = lastActivity?.discipline?.sport?.name?.toLowerCase() || ""
      let sportEmoji = "🏃"
      if (sportName.includes("cycling") || sportName.includes("bike")) sportEmoji = "🚴"
      else if (sportName.includes("swim")) sportEmoji = "🏊"
      else if (sportName.includes("tennis")) sportEmoji = "🎾"
      else if (sportName.includes("golf")) sportEmoji = "⛳"
      else if (sportName.includes("basketball")) sportEmoji = "🏀"
      else if (sportName.includes("football") || sportName.includes("soccer")) sportEmoji = "⚽"
      else if (sportName.includes("fitness") || sportName.includes("gym")) sportEmoji = "🏋️"
      else if (sportName.includes("yoga")) sportEmoji = "🧘"
      else if (sportName.includes("climb")) sportEmoji = "🧗"

      return {
        id: f.following.id,
        userId: f.following.id,
        displayName: f.following.displayName || "User",
        avatarUrl: f.following.avatarUrl,
        isActive,
        lastActivityTime: lastActivity?.activityDate.toISOString() || null,
        sportEmoji,
      }
    })

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Error fetching friend activities:", error)
    return NextResponse.json({ friends: [] })
  }
}
