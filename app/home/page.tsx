import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { SlimHero, type HeroSport } from "@/components/home/SlimHero"
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
// V5 Components
import { FirstWeekCard } from "@/components/first-week/FirstWeekCard"
import { FirstWeekTips } from "@/components/first-week/FirstWeekTips"
import { RankLadder } from "@/components/rankings/RankLadder"
import { RankBattleCard } from "@/components/battles/RankBattleCard"
import { AlmostThereCard } from "@/components/notifications/AlmostThereCard"
import { EffortScoreCard } from "@/components/effort/EffortScoreCard"
import { FloatingRankPill } from "@/components/rankings/FloatingRankPill"
// V5 Data fetching
import { getFirstWeekProgress, getFirstWeekTips } from "@/lib/first-week"
import { getRankLadder, getUserRankScopes as getEffortRankScopes } from "@/lib/rankings/rank-ladder"
import { getUserActiveBattle } from "@/lib/rank-battles"
import { getAlmostThereInsights } from "@/lib/almost-there"
import { getUserWeeklyEffort } from "@/lib/effort-score"
import { isFeatureEnabled } from "@/lib/features"

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

  // Fetch user's other active sports (non-primary) for hero display
  let otherSports: HeroSport[] = []
  try {
    const userSports = await prisma.userSport.findMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
        priority: { not: 0 }, // Exclude primary sport (priority 0)
      },
      include: {
        sport: {
          select: { name: true, icon: true },
        },
      },
      orderBy: { priority: "asc" },
      take: 4, // Limit to 4 other sports
    })
    otherSports = userSports.map((us) => ({
      name: us.sport.name,
      icon: us.sport.icon,
    }))
  } catch (e) {
    console.error("[Home] Failed to fetch userSports:", e)
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

    // ============================================
    // V5 DATA FETCHING - Effort Score, Rank Ladder, Battles
    // ============================================
    let firstWeekProgress = null
    let firstWeekTips: any[] = []
    let rankLadder = null
    let activeBattle = null
    let almostThereInsights: any[] = []
    let weeklyEffort = null
    let effortRankScopes = null

    if (isFeatureEnabled('effortScore') || isFeatureEnabled('rankLadder') || isFeatureEnabled('rankBattles')) {
      try {
        const v5Results = await Promise.allSettled([
          getFirstWeekProgress(user.id),
          getRankLadder(user.id, 'global'),
          getUserActiveBattle(user.id),
          getAlmostThereInsights(user.id),
          getUserWeeklyEffort(user.id),
          getEffortRankScopes(user.id),
        ])

        if (v5Results[0].status === 'fulfilled') {
          firstWeekProgress = v5Results[0].value
          if (firstWeekProgress) {
            firstWeekTips = getFirstWeekTips(firstWeekProgress)
          }
        }
        if (v5Results[1].status === 'fulfilled') rankLadder = v5Results[1].value
        if (v5Results[2].status === 'fulfilled') activeBattle = v5Results[2].value
        if (v5Results[3].status === 'fulfilled') almostThereInsights = v5Results[3].value
        if (v5Results[4].status === 'fulfilled') weeklyEffort = v5Results[4].value
        if (v5Results[5].status === 'fulfilled') effortRankScopes = v5Results[5].value

        // Log failures
        v5Results.forEach((r, i) => {
          if (r.status === 'rejected') {
            console.error(`[Home V5] Promise ${i} failed:`, r.reason)
          }
        })
      } catch (e) {
        console.error("[Home V5] Failed to fetch V5 data:", e)
      }
    }

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
            city={user.cityName || user.city || undefined}
            country={user.countryName || user.country || undefined}
            primarySport={hero.sportName || primarySport}
            otherSports={otherSports}
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

              {/* V5: First Week Magic (for new users) */}
              {firstWeekProgress?.isFirstWeek && (
                <div data-testid="home-slot-first-week">
                  <FirstWeekCard progress={firstWeekProgress} />
                  {firstWeekTips.length > 0 && (
                    <FirstWeekTips tips={firstWeekTips} className="mt-3" />
                  )}
                </div>
              )}

              {/* V5: Almost There Insights */}
              {almostThereInsights.length > 0 && !firstWeekProgress?.isFirstWeek && (
                <div data-testid="home-slot-almost-there">
                  <AlmostThereCard insights={almostThereInsights} />
                </div>
              )}

              {/* V5: Active Rank Battle */}
              {activeBattle && isFeatureEnabled('rankBattles') && (
                <div data-testid="home-slot-battle">
                  <RankBattleCard
                    battle={{
                      ...activeBattle,
                      weekStart: activeBattle.weekStart,
                      weekEnd: activeBattle.weekEnd,
                    }}
                    currentUserId={user.id}
                  />
                </div>
              )}

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
              {/* V5: Weekly Effort Score */}
              {weeklyEffort && isFeatureEnabled('effortScore') && (
                <EffortScoreCard
                  currentScore={weeklyEffort.currentScore}
                  delta={weeklyEffort.delta}
                  percentChange={weeklyEffort.percentChange}
                  breakdown={weeklyEffort.breakdown}
                  activityCount={weeklyEffort.activityCount}
                />
              )}

              {/* V5: Rank Ladder */}
              {rankLadder && isFeatureEnabled('rankLadder') && (
                <RankLadder
                  scope={rankLadder.scope}
                  scopeValue={rankLadder.scopeValue}
                  userRank={rankLadder.userRank}
                  totalInScope={rankLadder.totalInScope}
                  entries={rankLadder.entries}
                  pointsToNextRank={rankLadder.pointsToNextRank}
                  pointsBehindPrevRank={rankLadder.pointsBehindPrevRank}
                />
              )}

              {/* 1. Upcoming Events (Immediate Future) */}
              <CalendarWidget />

              {/* 2. Partner Finder (Social Planning) */}
              {isFeatureEnabled('partnerFinder') && <PartnerFinderWidget />}

              {/* 3. People to Follow (Discovery) */}
              <div className="hidden lg:block">
                <PeopleToFollow />
              </div>
            </aside>

          </div>
        </div>

        {/* V5: Mobile Floating Rank Pill */}
        {effortRankScopes && weeklyEffort && isFeatureEnabled('floatingRankPill') && (
          <FloatingRankPill
            global={{
              rank: effortRankScopes.global.rank,
              total: effortRankScopes.global.total,
            }}
            country={effortRankScopes.country.rank ? {
              rank: effortRankScopes.country.rank,
              total: effortRankScopes.country.total,
              scopeValue: effortRankScopes.country.scopeValue,
            } : null}
            city={effortRankScopes.city.rank ? {
              rank: effortRankScopes.city.rank,
              total: effortRankScopes.city.total,
              scopeValue: effortRankScopes.city.scopeValue,
            } : null}
            effortScore={weeklyEffort.currentScore}
            className="md:hidden"
          />
        )}
      </main>
    )
}
