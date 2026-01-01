import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { WelcomeHero } from "@/components/dashboard/WelcomeHero"
import { PulseRail } from "@/components/vapor/PulseRail"
import { CompeteNowDeckWrapper } from "@/components/home/CompeteNowDeckWrapper"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { PartnerFinderWidget } from "@/components/social/partner-finder-widget"
import { FollowSuggestionsWrapper } from "@/components/widgets/follow-suggestions-wrapper"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { Feed } from "@/components/feed/feed"
import { getHomeHeroForUser } from "@/lib/hero/getHomeHero"
import { HighlightsFeed } from "@/components/home/HighlightsFeed"
import { FollowingFeed } from "@/components/home/FollowingFeed"
import { HomeFeedTabs } from "@/components/home/HomeFeedTabs"
import { getUserRankScopes } from "@/lib/leaderboards"
import { getHeroRankLensSnapshot, getUserPrimarySport } from "@/lib/rankings/hero-rank-lens"

export const dynamic = 'force-dynamic'

/**
 * Home Dashboard Page - Compare → Compete → Social Proof
 *
 * Layout Order:
 * 1. WelcomeHero (Full-width anchor with stats, RankStrip on desktop, Log Activity CTA)
 * 2. PulseRail (Stories-style friend activity)
 * 3. CompeteNowDeck (Active rivalries, challenges, team battles)
 * 4. HomeFeedTabs (Highlights + Following feed with tab switcher)
 * 5. Feed + Sidebar (Planning & Social)
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

    const weeklyActivities = await prisma.activity.findMany({
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
    })

    // Calculate Weekly Stats for Hero
    let weeklyDistance = 0
    let weeklyTime = 0
    const sportStats: Record<string, { distance: number }> = {}

    weeklyActivities.forEach((activity: any) => {
      weeklyDistance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
      weeklyTime += activity.durationSeconds ? activity.durationSeconds / 60 : 0

      const sportName = activity.discipline?.sport?.name?.toLowerCase() || 'other'
      if (!sportStats[sportName]) {
        sportStats[sportName] = { distance: 0 }
      }
      sportStats[sportName].distance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
    })

    // Determine primary sport by distance
    const sortedSports = Object.entries(sportStats).sort((a, b) => b[1].distance - a[1].distance)
    const primarySport = sortedSports.length > 0 ? sortedSports[0][0] : "running"

    // Get user's primary sport for rank lens
    const userPrimarySport = await getUserPrimarySport(user.id)

    // Get hero image, user rank scopes, and rank lens snapshot in parallel
    const [hero, userRanks, rankLensSnapshot] = await Promise.all([
      getHomeHeroForUser(user.id),
      getUserRankScopes(user.id),
      // Only fetch rank lens if user has a primary sport
      userPrimarySport
        ? getHeroRankLensSnapshot({
            userId: user.id,
            sportId: userPrimarySport.id,
            benchmarkId: null, // Default to Sport Index; client can switch via API
          })
        : Promise.resolve(null),
    ])

    return (
      <main className="min-h-screen bg-slate-50 pb-20 md:pb-0" data-testid="home-page">
        {/* ============================================
            SECTION 1: THE ANCHOR - Welcome Hero
            Full-width, dark background, primary CTA
            Contains: Stats + Log Activity CTA
        ============================================ */}
        <div data-testid="home-slot-hero">
          <WelcomeHero
            name={user.displayName || "Athlete"}
            avatarUrl={user.avatarUrl || undefined}
            location={user.city || "Prague, Czech Republic"}
            primarySport={hero.sportName || primarySport}
            hero={hero}
          />
        </div>

        {/* ============================================
            SECTION 2: THE PULSE - Friend Activity Rail
            Stories-style horizontal scroll (The Hook)
        ============================================ */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <PulseRail />
          </div>
        </div>

        {/* ============================================
            SECTION 3: MAIN CONTENT GRID
            12-column grid: Main (8) + Sidebar (4)
            Order: Compete → Rank → Feed
        ============================================ */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">

            {/* MAIN COLUMN (Span 8) - Compete First */}
            <div className="lg:col-span-8 space-y-5">

              {/* Compete Now Deck - Rivalries, Challenges, Battles */}
              <div data-testid="home-slot-compete">
                <CompeteNowDeckWrapper />
              </div>

              {/* Feed Tabs: Highlights + Following */}
              <div data-testid="home-slot-feed-tabs">
                <HomeFeedTabs
                  highlightsContent={<HighlightsFeed userId={user.id} />}
                  followingContent={<FollowingFeed userId={user.id} />}
                />
              </div>

              {/* Consumption Zone - Social Feed */}
              <div data-testid="home-slot-feed">
                <CreatePostBox userImage={user.avatarUrl || undefined} />
                <div className="mt-4">
                  <Feed />
                </div>
              </div>
            </div>

            {/* SIDEBAR (Span 4) - Planning & Future */}
            <aside className="lg:col-span-4 space-y-4">
              {/* 1. Upcoming Events (Immediate Future) */}
              <CalendarWidget />

              {/* 2. Partner Finder (Social Planning) */}
              <PartnerFinderWidget />

              {/* 3. Follow Suggestions (Discovery) */}
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
