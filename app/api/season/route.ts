import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCurrentSeason,
  getSeasons,
  getUserSeasonParticipation,
  getUserSeasonStats,
  getSeasonLeaderboard,
  joinSeason,
} from '@/lib/season'

/**
 * GET /api/season
 *
 * Get season data
 * Query params:
 * - type: 'current' | 'list' | 'participation' | 'stats' | 'leaderboard'
 * - seasonId: for leaderboard
 * - scope: 'global' | 'country' | 'city'
 * - scopeValue: for regional leaderboards
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'current'
  const seasonId = searchParams.get('seasonId')
  const scope = (searchParams.get('scope') as 'global' | 'country' | 'city') || 'global'
  const scopeValue = searchParams.get('scopeValue') || undefined

  try {
    switch (type) {
      case 'current': {
        const season = await getCurrentSeason()
        return NextResponse.json({ season })
      }

      case 'list': {
        const seasons = await getSeasons()
        return NextResponse.json({ seasons })
      }

      case 'participation': {
        const participation = await getUserSeasonParticipation(session.user.id)
        return NextResponse.json({ participation })
      }

      case 'stats': {
        const stats = await getUserSeasonStats(session.user.id)
        return NextResponse.json({ stats })
      }

      case 'leaderboard': {
        if (!seasonId) {
          const currentSeason = await getCurrentSeason()
          if (!currentSeason) {
            return NextResponse.json({ error: 'No active season' }, { status: 404 })
          }
          const leaderboard = await getSeasonLeaderboard(currentSeason.id, scope, scopeValue)
          return NextResponse.json({ leaderboard, season: currentSeason })
        }
        const leaderboard = await getSeasonLeaderboard(seasonId, scope, scopeValue)
        return NextResponse.json({ leaderboard })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching season data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch season data' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/season
 *
 * Join the current season
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const seasonId = body.seasonId

    const participation = await joinSeason(session.user.id, seasonId)
    return NextResponse.json({ participation }, { status: 201 })
  } catch (error) {
    console.error('Error joining season:', error)
    const message = error instanceof Error ? error.message : 'Failed to join season'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
