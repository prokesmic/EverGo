import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Suspense } from "react"
import { startOfWeek, endOfWeek } from "date-fns"

// V6 Components - Using photo-based hero (same as Profile)
import { HomeHeroBanner } from "@/components/hero/HomeHeroBanner"
import { HomeHeroRibbon } from "@/components/home/HomeHeroRibbon"
import { FriendsStrip } from "@/components/home/FollowingStrip"
import { ActiveCompetitions } from "@/components/home/ActiveCompetitions"
import { RivalriesStrip } from "@/components/home/RivalriesStrip"
import { CityLadder } from "@/components/home/CityLadder"
import { QuickActions } from "@/components/home/QuickActions"
import { HomeFeed } from "@/components/home/HomeFeedV6"
import { SeasonCard } from "@/components/season/SeasonCard"

// Loading skeletons
import { Skeleton } from "@/components/ui/skeleton"

// V6 Data fetching
import { getUserGauntlets, getPendingInvitations } from "@/lib/gauntlet"
import { getUserRivalries } from "@/lib/rivalry"
import { getCurrentSeason, getUserSeasonRank } from "@/lib/season"
import { getActiveCrewWar } from "@/lib/crew-wars"
import { getCityLadder } from "@/lib/rankings/ladders"
import { isFeatureEnabled } from "@/lib/features"

export const dynamic = "force-dynamic"

/**
 * V6 Home Dashboard Page - Competition Platform
 *
 * Profile-style hero with full cover photo and stats:
 * - WelcomeHero: Cover photo, avatar, stats strip, metric cards
 * - Main Column: Active Competitions, Rivalries Strip, Feed
 * - Sidebar: Season Card, City Ladder, Quick Actions
 */
export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  // Fetch user with full profile data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      avatarUrl: true,
      coverPhotoUrl: true,
      city: true,
      country: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          activities: true,
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  const userId = user.id

  // Fetch primary sport
  const primarySportRecord = await prisma.userSport.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { priority: "asc" },
    include: {
      sport: { select: { name: true, slug: true } },
    },
  })

  // Fetch user stats and streak
  const [userStats, userStreak] = await Promise.all([
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        sportIndex: true,
        sportIndexDelta7d: true,
      },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
      },
    }),
  ])

  // Fetch this week's activities for metrics
  const weekActivities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: { gte: weekStart, lte: weekEnd },
    },
    select: {
      distanceMeters: true,
      durationSeconds: true,
    },
  })

  // Calculate week metrics
  const thisWeekKm = weekActivities.reduce((sum, a) => sum + (a.distanceMeters ?? 0), 0) / 1000
  const activeTimeMinutes = Math.round(
    weekActivities.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0) / 60
  )

  // Get user's team membership
  const teamMembership = await prisma.teamMember.findFirst({
    where: { userId, role: { not: "BANNED" } },
    select: {
      teamId: true,
      team: { select: { name: true, slug: true } },
    },
  })
  const teamId = teamMembership?.teamId

  // Fetch users the current user is following (for FriendsStrip)
  const followingUsers = await prisma.follow.findMany({
    where: { followerId: userId },
    take: 12,
    orderBy: { createdAt: "desc" },
    select: {
      following: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  })

  const friends = followingUsers.map((f) => f.following)

  // Parallel data fetching with error handling
  const [
    gauntletsResult,
    pendingGauntletsResult,
    rivalriesResult,
    seasonResult,
    crewWarResult,
    cityLadderResult,
  ] = await Promise.allSettled([
    getUserGauntlets(userId, 10),
    getPendingInvitations(userId),
    getUserRivalries(userId, 6),
    getCurrentSeason(),
    teamId ? getActiveCrewWar(teamId) : Promise.resolve(null),
    user.city ? getCityLadder(user.city, userId, 10) : Promise.resolve([]),
  ])

  // Extract results with fallbacks
  const allGauntlets =
    gauntletsResult.status === "fulfilled" ? gauntletsResult.value : []

  const pendingGauntlets =
    pendingGauntletsResult.status === "fulfilled"
      ? pendingGauntletsResult.value
      : []

  // Combine gauntlets and filter for active/pending
  const activeGauntlets = [
    ...allGauntlets.filter((g) => g.status === "PENDING" || g.status === "ACTIVE"),
    ...pendingGauntlets,
  ].slice(0, 3)

  const rivalries =
    rivalriesResult.status === "fulfilled" ? rivalriesResult.value : []

  const activeSeason =
    seasonResult.status === "fulfilled" ? seasonResult.value : null

  const crewWar =
    crewWarResult.status === "fulfilled" ? crewWarResult.value : null

  const cityLadder =
    cityLadderResult.status === "fulfilled" ? cityLadderResult.value : []

  // Get user's season stats if season is active
  let seasonStats = null
  if (activeSeason) {
    try {
      const rankData = await getUserSeasonRank(userId, activeSeason.id)
      seasonStats = rankData
    } catch {
      // Ignore errors
    }
  }

  // Metrics for ribbon
  const metrics = {
    sportIndex: userStats?.sportIndex ?? 0,
    sportIndexDelta: userStats?.sportIndexDelta7d ?? 0,
    dayStreak: userStreak?.currentStreak ?? 0,
    thisWeekKm,
    activeTimeMinutes,
    weekActivities: weekActivities.length,
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Home Hero - Full width photo banner */}
      <div className="px-4 md:px-6 pt-4">
        <HomeHeroBanner
          user={{
            id: user.id,
            displayName: user.displayName,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            coverPhotoUrl: user.coverPhotoUrl,
            city: user.city,
            country: user.country,
            bio: user.bio,
            createdAt: user.createdAt,
          }}
          primarySport={
            primarySportRecord
              ? {
                  name: primarySportRecord.sport.name,
                  slug: primarySportRecord.sport.slug,
                }
              : null
          }
          stats={{
            activities: user._count.activities,
            followers: user._count.followers,
            following: user._count.following,
          }}
        />
      </div>

      {/* Premium Ribbon - overlaps hero bottom */}
      <HomeHeroRibbon metrics={metrics} />

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Competitions */}
            {isFeatureEnabled("gauntlet") && (
              <ActiveCompetitions
                gauntlets={activeGauntlets}
                crewWar={crewWar}
                teamId={teamId}
                userId={userId}
              />
            )}

            {/* Rivalries Strip */}
            {isFeatureEnabled("rivalry") && rivalries.length > 0 && (
              <RivalriesStrip rivalries={rivalries.slice(0, 4)} />
            )}

            {/* Feed */}
            <Suspense fallback={<FeedSkeleton />}>
              <HomeFeed userId={userId} />
            </Suspense>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            {/* Friends Strip - clickable avatars */}
            <FriendsStrip friends={friends} />

            {/* Season Card */}
            {isFeatureEnabled("season") && activeSeason && (
              <SeasonCard
                season={activeSeason}
                userStats={
                  seasonStats
                    ? {
                        totalPower: seasonStats.totalPower,
                        rank: seasonStats.rank,
                        total: seasonStats.total,
                        activityCount: seasonStats.activityCount,
                      }
                    : undefined
                }
              />
            )}

            {/* City Ladder */}
            {user.city && cityLadder.length > 0 && (
              <CityLadder
                city={user.city}
                entries={cityLadder}
                currentUserId={userId}
              />
            )}

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>
    </main>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
