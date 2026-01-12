/**
 * HomeDashboardBody - Feed-Centric Dashboard Content
 *
 * What's happening: Active competitions, rivalries, activity feed from followed users.
 * This is the main content area for the home page (below the hero).
 */

import { Suspense, type ComponentProps } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { FriendsStrip } from "@/components/home/FollowingStrip"
import { ActiveCompetitions } from "@/components/home/ActiveCompetitions"
import { RivalriesStrip } from "@/components/home/RivalriesStrip"
import { CityLadder } from "@/components/home/CityLadder"
import { QuickActions } from "@/components/home/QuickActions"
import { HomeFeed } from "@/components/home/HomeFeedV6"
import { SeasonCard } from "@/components/season/SeasonCard"
import { isFeatureEnabled } from "@/lib/features"

// Extract types from child components for type safety
type ActiveCompetitionsProps = ComponentProps<typeof ActiveCompetitions>
type RivalriesStripProps = ComponentProps<typeof RivalriesStrip>
type SeasonCardProps = ComponentProps<typeof SeasonCard>
type CityLadderProps = ComponentProps<typeof CityLadder>
type FriendsStripProps = ComponentProps<typeof FriendsStrip>

export type HomeDashboardBodyProps = {
  userId: string
  userCity: string | null
  teamId?: string | null

  // Competition data - use actual component prop types
  activeGauntlets: ActiveCompetitionsProps["gauntlets"]
  crewWar: ActiveCompetitionsProps["crewWar"]
  rivalries: RivalriesStripProps["rivalries"]

  // Season data
  activeSeason: SeasonCardProps["season"] | null
  seasonStats: SeasonCardProps["userStats"] | null

  // Social data
  friends: FriendsStripProps["friends"]
  cityLadder: CityLadderProps["entries"]
}

export function HomeDashboardBody({
  userId,
  userCity,
  teamId,
  activeGauntlets,
  crewWar,
  rivalries,
  activeSeason,
  seasonStats,
  friends,
  cityLadder,
}: HomeDashboardBodyProps) {
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Column (2/3) - Feed-centric content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Competitions */}
          {isFeatureEnabled("gauntlet") && activeGauntlets.length > 0 && (
            <ActiveCompetitions
              gauntlets={activeGauntlets}
              crewWar={crewWar}
              teamId={teamId ?? undefined}
              userId={userId}
            />
          )}

          {/* Rivalries Strip */}
          {isFeatureEnabled("rivalry") && rivalries.length > 0 && (
            <RivalriesStrip rivalries={rivalries.slice(0, 4)} />
          )}

          {/* Activity Feed - What's happening */}
          <Suspense fallback={<FeedSkeleton />}>
            <HomeFeed userId={userId} />
          </Suspense>
        </div>

        {/* Sidebar (1/3) - Discovery & Quick Actions */}
        <div className="space-y-6">
          {/* Friends Strip - Who you follow */}
          <FriendsStrip friends={friends} />

          {/* Season Card - Current competition season */}
          {isFeatureEnabled("season") && activeSeason && (
            <SeasonCard
              season={activeSeason}
              userStats={seasonStats ?? undefined}
            />
          )}

          {/* City Ladder - Local competition */}
          {userCity && cityLadder.length > 0 && (
            <CityLadder
              city={userCity}
              entries={cityLadder}
              currentUserId={userId}
            />
          )}

          {/* Quick Actions - Log activity, create gauntlet, etc */}
          <QuickActions />
        </div>
      </div>
    </div>
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
