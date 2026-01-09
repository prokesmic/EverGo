import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { getSeasonLeaderboard, getUserSeasonRank } from "@/lib/season"
import { SeasonHeader } from "@/components/season/SeasonHeader"
import { SeasonLeaderboard } from "@/components/season/SeasonLeaderboard"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

/**
 * V6 Season Detail Page
 */
export default async function SeasonDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id
  const { id } = await params

  // Get season by id with participant count
  const season = await prisma.season.findUnique({
    where: { id },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  })

  if (!season) {
    notFound()
  }

  // Get leaderboard and user stats
  const [leaderboard, userStats] = await Promise.all([
    getSeasonLeaderboard(season.id, "global", undefined, 100),
    getUserSeasonRank(userId, season.id),
  ])

  // Transform leaderboard data to match component expectations
  const transformedLeaderboard = leaderboard.map((entry) => ({
    userId: entry.userId,
    displayName: entry.user.displayName,
    username: entry.user.username,
    avatarUrl: entry.user.avatarUrl,
    totalPower: entry.totalPower,
    activityCount: entry.activityCount,
    rank: entry.rank,
  }))

  // Transform season data
  const seasonData = {
    id: season.id,
    name: season.name,
    slug: season.id, // Use id as slug
    isActive: season.status === "ACTIVE",
    status: season.status,
    startDate: season.startDate,
    endDate: season.endDate,
    participantCount: season._count.participants,
    badgeIcon: season.badgeIcon,
    badgeColor: season.badgeColor,
  }

  // Transform user stats
  const transformedUserStats = userStats
    ? {
        totalPower: userStats.totalPower,
        globalRank: userStats.rank,
        cityRank: null,
        activityCount: userStats.activityCount,
      }
    : null

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <SeasonHeader season={seasonData} userStats={transformedUserStats} />

        <div className="mt-6">
          <SeasonLeaderboard entries={transformedLeaderboard} currentUserId={userId} />
        </div>
      </div>
    </main>
  )
}
