import { prisma } from '@/lib/db'
import { getUserWeeklyPower } from '@/lib/power'
import { getUserGauntlets } from '@/lib/gauntlet'
import { getUserRivalries } from '@/lib/rivalry'
import { getCurrentSeason, getUserSeasonRank } from '@/lib/season'

/**
 * Hero Banner Data Fetcher (V6)
 *
 * Fetches all data needed for the hero banner in parallel
 */

export interface HeroData {
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
    coverPhotoUrl: string | null
    city: string | null
    country: string | null
  }
  primarySports: Array<{
    id: string
    name: string
    slug: string
  }>
  weeklyPower: {
    current: number
    delta: number
  }
  seasonRanks: {
    global: number | null
    city: number | null
    cityName: string | null
  }
  competitionStats: {
    activeGauntlets: number
    rivalryWins: number
    rivalryLosses: number
  }
}

export async function getHeroData(userId: string): Promise<HeroData> {
  // Parallel fetch all data
  const [
    user,
    userSports,
    weeklyPowerData,
    gauntlets,
    rivalries,
    activeSeason
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        city: true,
        country: true
      }
    }),
    prisma.userSport.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { priority: 'asc' },
      take: 4,
      include: {
        sport: {
          select: { id: true, name: true, slug: true }
        }
      }
    }),
    getUserWeeklyPower(userId),
    getUserGauntlets(userId, 50), // Get more to filter
    getUserRivalries(userId, 50),
    getCurrentSeason()
  ])

  // Filter for active gauntlets only
  const activeGauntlets = gauntlets.filter(
    g => g.status === 'ACTIVE' || g.status === 'PENDING'
  )

  // Get season stats if season exists
  let globalRank: number | null = null
  let cityRank: number | null = null

  if (activeSeason && user?.city) {
    const [globalStats, cityStats] = await Promise.all([
      getUserSeasonRank(userId, activeSeason.id, 'global'),
      getUserSeasonRank(userId, activeSeason.id, 'city', user.city)
    ])
    globalRank = globalStats?.rank ?? null
    cityRank = cityStats?.rank ?? null
  } else if (activeSeason) {
    const globalStats = await getUserSeasonRank(userId, activeSeason.id, 'global')
    globalRank = globalStats?.rank ?? null
  }

  // Calculate rivalry totals
  const rivalryTotals = rivalries.reduce(
    (acc, r) => ({
      wins: acc.wins + r.wins,
      losses: acc.losses + r.losses
    }),
    { wins: 0, losses: 0 }
  )

  return {
    user: user!,
    primarySports: userSports.map(us => us.sport),
    weeklyPower: {
      current: weeklyPowerData.currentPower,
      delta: weeklyPowerData.delta
    },
    seasonRanks: {
      global: globalRank,
      city: cityRank,
      cityName: user?.city ?? null
    },
    competitionStats: {
      activeGauntlets: activeGauntlets.length,
      rivalryWins: rivalryTotals.wins,
      rivalryLosses: rivalryTotals.losses
    }
  }
}
