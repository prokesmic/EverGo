import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { AnimatedLeaderboard } from "@/components/rankings/animated-leaderboard"

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  // Get current user
  let currentUser = null
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        streak: true
      }
    })
  }

  // Get top users by sport index with streak data
  const userStats = await prisma.userStats.findMany({
    where: {
      sportIndex: {
        gt: 0,
      },
    },
    orderBy: {
      sportIndex: "desc",
    },
    take: 50,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          city: true,
          country: true,
          createdAt: true,
          streak: {
            select: {
              currentStreak: true
            }
          }
        },
      },
    },
  })

  // Get all sports for filter
  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  })

  // Calculate if user is "new" (joined in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const leaderboardEntries = userStats.map((stats, index) => ({
    rank: index + 1,
    userId: stats.userId,
    username: stats.user.username,
    displayName: stats.user.displayName,
    avatarUrl: stats.user.avatarUrl,
    score: stats.sportIndex,
    previousScore: stats.sportIndexBest !== stats.sportIndex ? stats.sportIndexBest : undefined,
    trend: (stats.globalRank && index + 1 < stats.globalRank)
      ? "up" as const
      : (stats.globalRank && index + 1 > stats.globalRank)
        ? "down" as const
        : "same" as const,
    trendAmount: stats.globalRank ? Math.abs((index + 1) - stats.globalRank) : 0,
    location: stats.city || stats.country || undefined,
    streak: stats.user.streak?.currentStreak || 0,
    isNew: stats.user.createdAt > sevenDaysAgo
  }))

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <AnimatedLeaderboard
          initialEntries={leaderboardEntries}
          sports={sports}
          currentUserId={currentUser?.id}
          showFilters={true}
          title="Global Leaderboard"
          showStats={true}
        />
      </div>
    </div>
  )
}
