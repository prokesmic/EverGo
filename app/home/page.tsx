import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Suspense } from "react"

// V6 Components
import { HomeHeader } from "@/components/home/HomeHeader"
import { ActiveCompetitions } from "@/components/home/ActiveCompetitions"
import { RivalriesStrip } from "@/components/home/RivalriesStrip"
import { CityLadder } from "@/components/home/CityLadder"
import { QuickActions } from "@/components/home/QuickActions"
import { HomeFeed } from "@/components/home/HomeFeedV6"
import { PowerCard } from "@/components/power/PowerCard"
import { SeasonCard } from "@/components/season/SeasonCard"

// Loading skeletons
import { Skeleton } from "@/components/ui/skeleton"

// V6 Data fetching
import { getUserWeeklyPower } from "@/lib/power"
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
 * Clean 3-section layout:
 * - Main Column: Power Card, Active Competitions, Rivalries Strip, Feed
 * - Sidebar: Season Card, City Ladder, Quick Actions
 */
export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      displayName: true,
      username: true,
      city: true,
      country: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const userId = user.id

  // Get user's team membership separately
  const teamMembership = await prisma.teamMember.findFirst({
    where: { userId, role: { not: "BANNED" } },
    select: {
      teamId: true,
      team: { select: { name: true, slug: true } },
    },
  })
  const teamId = teamMembership?.teamId

  // Parallel data fetching with error handling
  const [
    weeklyPowerResult,
    gauntletsResult,
    pendingGauntletsResult,
    rivalriesResult,
    seasonResult,
    crewWarResult,
    cityLadderResult,
  ] = await Promise.allSettled([
    getUserWeeklyPower(userId),
    getUserGauntlets(userId, 10),
    getPendingInvitations(userId),
    getUserRivalries(userId, 6),
    getCurrentSeason(),
    teamId ? getActiveCrewWar(teamId) : Promise.resolve(null),
    user.city ? getCityLadder(user.city, userId, 10) : Promise.resolve([]),
  ])

  // Extract results with fallbacks
  const weeklyPower =
    weeklyPowerResult.status === "fulfilled"
      ? weeklyPowerResult.value
      : { currentPower: 0, delta: 0, percentChange: 0, breakdown: { easy: 0, moderate: 0, hard: 0, race: 0 }, activityCount: 0 }

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
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Header */}
        <HomeHeader displayName={user.displayName ?? user.username ?? "Athlete"} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Power Card */}
            {isFeatureEnabled("power") && (
              <PowerCard
                currentPower={weeklyPower.currentPower}
                delta={weeklyPower.delta}
                percentChange={weeklyPower.percentChange}
                breakdown={weeklyPower.breakdown}
                activityCount={weeklyPower.activityCount}
              />
            )}

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
