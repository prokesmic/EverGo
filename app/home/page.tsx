import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
import type { ResolvedHero } from "@/lib/hero/heroResolver"
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
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/login")
  }

    // Fetch user stats for Sport Index - with fallback
  let userStats = null
  try {
    userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    })
  } catch (e) {
    console.error("[Home] Failed to fetch userStats:", e)
  }

  // Simplified data - fetch in parallel with fallback
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  let weeklyActivities: any[] = []
  try {
    weeklyActivities = await prisma.activity.findMany({
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
  } catch (e) {
    console.error("[Home] Failed to fetch weeklyActivities:", e)
  }

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

  // Get user's primary sport for rank lens - with fallback
  let userPrimarySport = null
  try {
    userPrimarySport = await getUserPrimarySport(user.id)
  } catch (e) {
    console.error("[Home] Failed to fetch userPrimarySport:", e)
  }

  // Get hero image, user rank scopes, and rank lens snapshot in parallel - with fallbacks
  let hero: Partial<ResolvedHero> = { sportName: "Sport" }
  let userRanks = null
  let rankLensSnapshot = null

  try {
    const results = await Promise.allSettled([
      getHomeHeroForUser(user.id),
      getUserRankScopes(user.id),
      userPrimarySport
        ? getHeroRankLensSnapshot({
            userId: user.id,
            sportId: userPrimarySport.id,
            benchmarkId: null,
          })
        : Promise.resolve(null),
    ])

    if (results[0].status === 'fulfilled') hero = results[0].value as any
    if (results[1].status === 'fulfilled') userRanks = results[1].value
    if (results[2].status === 'fulfilled') rankLensSnapshot = results[2].value

    // Log any failures
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`[Home] Promise ${i} failed:`, r.reason)
      }
    })
  } catch (e) {
    console.error("[Home] Failed in Promise.allSettled:", e)
  }

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
}
