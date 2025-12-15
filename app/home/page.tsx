import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { WelcomeHero } from "@/components/dashboard/WelcomeHero"
import { PulseRail } from "@/components/vapor/PulseRail"
import { ActiveRivalryCard } from "@/components/vapor/ActiveRivalryCard"
import { BattleBarDemo } from "@/components/vapor/BattleBar"
import { AuroraRankingDeltaWidget } from "@/components/widgets/aurora-ranking-delta-widget"
import { ActivitiesSummaryWidget } from "@/components/widgets/activities-summary-widget"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { TeamsWidget } from "@/components/widgets/teams-widget"
import { PartnerFinderWidget } from "@/components/social/partner-finder-widget"
import { FollowSuggestionsWrapper } from "@/components/widgets/follow-suggestions-wrapper"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { Feed } from "@/components/feed/feed"

export const dynamic = 'force-dynamic'

/**
 * Home Dashboard Page - Hero-First Layout
 *
 * Layout Order:
 * 1. WelcomeHero (Full-width anchor with stats + Log Activity CTA)
 * 2. PulseRail (Stories-style friend activity)
 * 3. Motivation Zone (Rivalry + Ranking widgets)
 * 4. Deep Data (Summary + Feed)
 */
export default async function HomePage() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      redirect("/login")
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || "" },
    })

    if (!user) {
      redirect("/login")
    }

    // Fetch user stats for Sport Index
    const userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })

    // Simplified data - fetch in parallel
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [weeklyActivities, userTeams] = await Promise.all([
      prisma.activity.findMany({
        where: {
          userId: user.id,
          activityDate: { gte: sevenDaysAgo }
        },
        include: {
          discipline: {
            include: { sport: true }
          }
        },
        take: 50
      }),
      prisma.teamMember.findMany({
        where: { userId: user.id },
        include: {
          team: {
            include: {
              sport: true,
              _count: { select: { members: true } }
            }
          }
        },
        take: 3
      })
    ])

    // Calculate Weekly Stats
    let weeklyDistance = 0
    let weeklyTime = 0
    let weeklyCalories = 0
    const sportStats: Record<string, { distance: number, time: number, color: string }> = {}

    weeklyActivities.forEach((activity: any) => {
      weeklyDistance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
      weeklyTime += activity.durationSeconds ? activity.durationSeconds / 60 : 0
      weeklyCalories += activity.caloriesBurned || 0

      const sportName = activity.discipline?.sport?.name?.toLowerCase() || 'other'
      if (!sportStats[sportName]) {
        let color = "bg-brand-blue text-white"
        if (sportName === "running") color = "bg-brand-green text-white"
        if (sportName === "cycling") color = "bg-yellow-500 text-black"
        if (sportName === "swimming") color = "bg-cyan-500 text-white"
        sportStats[sportName] = { distance: 0, time: 0, color }
      }
      sportStats[sportName].distance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
      sportStats[sportName].time += activity.durationSeconds ? activity.durationSeconds / 60 : 0
    })

    const activityBreakdown = Object.entries(sportStats).map(([sport, stats]) => ({
      sport,
      distance: stats.distance,
      percentage: weeklyDistance > 0 ? (stats.distance / weeklyDistance) * 100 : 0,
      color: stats.color
    })).sort((a, b) => b.distance - a.distance)

    const primarySport = activityBreakdown.length > 0 ? activityBreakdown[0].sport : "running"

    // Format teams for widget
    const formattedTeams = userTeams.map((tm: any) => ({
      id: tm.team.id,
      name: tm.team.name,
      sport: tm.team.sport?.name || 'Sports',
      members: tm.team._count?.members || 0,
      nextTraining: "Tue 18:00",
      image: tm.team.logoUrl || "",
      initials: tm.team.name.substring(0, 2).toUpperCase(),
      color: "bg-blue-100 text-blue-600"
    }))

    // Ranking insights
    const rankingInsights = {
      globalRank: userStats?.globalRank || 142,
      globalRankChange: -3,
      cityRank: userStats?.cityRank || 12,
      cityRankChange: -2,
      countryRank: userStats?.countryRank || 89,
      countryRankChange: -5
    }

    return (
      <main className="min-h-screen bg-slate-50 pb-20 md:pb-0">
        {/* ============================================
            SECTION 1: THE ANCHOR - Welcome Hero
            Full-width, dark background, primary CTA
        ============================================ */}
        <WelcomeHero
          name={user.displayName || "Athlete"}
          avatarUrl={user.avatarUrl || undefined}
          location={user.city || "Prague, Czech Republic"}
          primarySport={primarySport}
          sportIndex={userStats?.sportIndex || 742}
          sportIndexTrend={38}
          streakDays={14}
          weeklyDistance={weeklyDistance}
          weeklyTime={weeklyTime}
          weeklyActivities={weeklyActivities.length}
          globalRank={userStats?.globalRank || undefined}
          cityRank={userStats?.cityRank || undefined}
        />

        {/* ============================================
            SECTION 2: THE PULSE - Friend Activity Rail
            Stories-style horizontal scroll
        ============================================ */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <PulseRail />
          </div>
        </div>

        {/* ============================================
            SECTION 3: MOTIVATION ZONE
            Rivalry + Ranking widgets in a grid
        ============================================ */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
          <section className="space-y-6">
            {/* Row 1: Rivalry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <ActiveRivalryCard />
              <BattleBarDemo />
            </div>

            {/* Row 2: Ranking Delta + Upcoming Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <AuroraRankingDeltaWidget insights={rankingInsights} />
              <PartnerFinderWidget />
            </div>
          </section>
        </div>

        {/* ============================================
            SECTION 4: DEEP DATA
            Summary widgets + Social feed
        ============================================ */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Column: Feed */}
            <div className="space-y-6 order-2 lg:order-1">
              <CreatePostBox userImage={user.avatarUrl || undefined} />
              <Feed />
            </div>

            {/* Sidebar: Widgets (hidden on mobile, below fold) */}
            <aside className="space-y-4 order-1 lg:order-2">
              {/* Weekly Summary */}
              <ActivitiesSummaryWidget
                totalDistance={weeklyDistance}
                totalTime={weeklyTime}
                totalCalories={weeklyCalories}
                breakdown={activityBreakdown}
              />

              {/* Calendar */}
              <div className="hidden md:block">
                <CalendarWidget />
              </div>

              {/* Teams */}
              {formattedTeams.length > 0 && (
                <div className="hidden md:block">
                  <TeamsWidget teams={formattedTeams} />
                </div>
              )}

              {/* Follow Suggestions */}
              <div className="hidden lg:block">
                <FollowSuggestionsWrapper />
              </div>
            </aside>
          </div>
        </div>
      </main>
    )
  } catch (error) {
    console.error("Home page error:", error)
    redirect("/login")
  }
}
