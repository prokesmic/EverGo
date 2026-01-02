import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { SlimHero } from "@/components/home/SlimHero"
import { AthleteRibbon, type RankCardData } from "@/components/home/AthleteRibbon"
import { PulseRail } from "@/components/vapor/PulseRail"
import { CompeteNowDeckWrapper } from "@/components/home/CompeteNowDeckWrapper"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { PartnerFinderWidget } from "@/components/social/partner-finder-widget"
import { PeopleToFollow } from "@/components/widgets/PeopleToFollow"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { Feed } from "@/components/feed/feed"
import { getHomeHeroForUser } from "@/lib/hero/getHomeHero"
import { RankingsHighlightsFeed } from "@/components/home/RankingsHighlightsFeed"
import { VirtualizedFollowingFeed } from "@/components/home/VirtualizedFollowingFeed"
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
    console.log("[Home] Starting session check...")
    const session = await getServerSession(authOptions)

    console.log("[Home] Session result:", {
      hasSession: !!session,
      email: session?.user?.email,
      id: session?.user?.id
    })

    if (!session) {
      console.log("[Home] No session, redirecting to login")
      redirect("/login")
    }

    if (!session.user?.email) {
      console.log("[Home] Session exists but no email, redirecting to login")
      redirect("/login")
    }

    console.log("[Home] Looking up user by email:", session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    console.log("[Home] User lookup result:", { found: !!user, userId: user?.id })

    if (!user) {
      console.log("[Home] User not found in database, redirecting to login")
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

    // Build Athlete Ribbon data
    const sportIndexValue = userStats?.sportIndex ?? 0

    // Build rank cards from rankLensSnapshot tiles
    const buildRankCards = (): RankCardData[] => {
      const cards: RankCardData[] = []

      if (!rankLensSnapshot?.tiles) return cards

      const tiles = rankLensSnapshot.tiles

      // Global rank
      if (tiles.global) {
        cards.push({
          scope: 'global',
          rank: tiles.global.rank,
          total: tiles.global.total ?? null,
          delta: null,
        })
      }

      // Country rank
      if (tiles.country) {
        cards.push({
          scope: 'country',
          rank: tiles.country.rank,
          total: tiles.country.total ?? null,
          label: tiles.country.scopeValue ?? user.country ?? null,
          delta: null,
        })
      }

      // City rank
      if (tiles.city) {
        cards.push({
          scope: 'city',
          rank: tiles.city.rank,
          total: tiles.city.total ?? null,
          label: tiles.city.scopeValue ?? user.city ?? null,
          delta: null,
        })
      }

      // Team rank
      if (tiles.team) {
        cards.push({
          scope: 'team',
          rank: tiles.team.rank,
          total: tiles.team.total ?? null,
          label: tiles.team.scopeValue ?? null,
          delta: null,
        })
      }

      return cards
    }

    const rankCards = buildRankCards()

    return (
      <main className="min-h-screen bg-slate-50 pb-20 md:pb-0" data-testid="home-page">
        {/* ============================================
            ZONE A: THE VIBE - Slim Hero + Avatar Bridge
            Atmospheric background + overlapping avatar identity
        ============================================ */}
        <div data-testid="home-slot-hero">
          <SlimHero
            name={user.displayName || "Athlete"}
            avatarUrl={user.avatarUrl || undefined}
            location={user.city || "Prague, Czech Republic"}
            primarySport={hero.sportName || primarySport}
            imageUrl={hero.imageUrl}
            imageCategory={hero.category}
            imageCredit={hero.image?.credit}
          />
        </div>

        {/* ============================================
            ZONE B: THE ATHLETE RIBBON
            High-definition cards with Sport Index anchor
            + Global/Country/City/Team orbit cards
        ============================================ */}
        <AthleteRibbon
          sportIndex={sportIndexValue}
          sportIndexDelta={null}
          rankCards={rankCards}
        />

        {/* ============================================
            SECTION 3: THE PULSE - Friend Activity Rail
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
                  highlightsContent={<RankingsHighlightsFeed />}
                  followingContent={<VirtualizedFollowingFeed />}
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

              {/* 3. People to Follow (Discovery) */}
              <div className="hidden lg:block">
                <PeopleToFollow />
              </div>
            </aside>

          </div>
        </div>
      </main>
    )
  } catch (error) {
    // Don't catch redirect errors - they need to bubble up
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error("[Home] Unexpected error:", error)
    console.error("[Home] Error stack:", error instanceof Error ? error.stack : "no stack")
    redirect("/login")
  }
}
