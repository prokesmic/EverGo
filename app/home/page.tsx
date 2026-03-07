import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Suspense } from "react"

// V6 Components - Using photo-based hero (same as Profile)
import { HomeHeroBanner } from "@/components/hero/HomeHeroBanner"
import { HeroRibbon } from "@/components/hero/HeroRibbon"
import { HomeDashboardBody } from "@/components/home/HomeDashboardBody"

// Loading skeletons
import { Skeleton } from "@/components/ui/skeleton"

// V6 Data fetching
import { getUserGauntlets, getPendingInvitations } from "@/lib/gauntlet"
import { getUserRivalries } from "@/lib/rivalry"
import { getCurrentSeason, getUserSeasonRank } from "@/lib/season"
import { getActiveCrewWar } from "@/lib/crew-wars"
import { getCityLadder } from "@/lib/rankings/ladders"

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
        lastActivityDate: true,
        weeklyGoal: true,
        weeklyProgress: true,
      },
    }),
  ])

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

  return (
    <main className="min-h-screen bg-background">
      {/* Home Hero - Full width photo banner with docked ribbon */}
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
          sportIndex={userStats?.sportIndex ?? 0}
          bottomDock={
            <Suspense fallback={<RibbonSkeleton />}>
              <HeroRibbon defaultRange="week" context="home" variant="docked" />
            </Suspense>
          }
        />
      </div>

      {/* Main Content - Feed-Centric Dashboard */}
      <HomeDashboardBody
        userId={userId}
        userCity={user.city}
        teamId={teamId}
        activeGauntlets={activeGauntlets}
        crewWar={crewWar}
        rivalries={rivalries}
        activeSeason={activeSeason}
        seasonStats={seasonStats}
        friends={friends}
        cityLadder={cityLadder}
        streak={{
          currentStreak: userStreak?.currentStreak ?? 0,
          lastActivityDate: userStreak?.lastActivityDate ?? null,
          weeklyGoal: userStreak?.weeklyGoal ?? 3,
          weeklyProgress: userStreak?.weeklyProgress ?? 0,
        }}
      />
    </main>
  )
}

function RibbonSkeleton() {
  return (
    <div className="rounded-b-3xl border-t border-white/10 bg-black/50 backdrop-blur-md px-3 py-2 md:px-4 md:py-2.5">
      <div className="flex justify-center gap-2 mb-2">
        <Skeleton className="h-6 w-48 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Skeleton className="h-16 w-full bg-white/10" />
        <Skeleton className="h-16 w-full bg-white/10" />
        <Skeleton className="h-16 w-full bg-white/10" />
        <Skeleton className="h-16 w-full bg-white/10" />
        <Skeleton className="h-16 w-full bg-white/10" />
      </div>
    </div>
  )
}
