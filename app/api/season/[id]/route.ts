import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getSeasonById,
  getSeasonLeaderboard,
  getUserSeasonRank,
  getSeasonLadder,
} from '@/lib/season'

/**
 * GET /api/season/[id]
 *
 * Get a specific season with leaderboard
 * Query params:
 * - scope: 'global' | 'country' | 'city'
 * - scopeValue: for regional leaderboards
 * - view: 'full' | 'ladder'
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const scope = (searchParams.get('scope') as 'global' | 'country' | 'city') || 'global'
  const scopeValue = searchParams.get('scopeValue') || undefined
  const view = searchParams.get('view') || 'full'

  try {
    const season = await getSeasonById(id)

    if (!season) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 })
    }

    if (view === 'ladder') {
      // Get ladder view (users around current user)
      const ladder = await getSeasonLadder(session.user.id, id, scope, scopeValue)
      return NextResponse.json({ season, ladder })
    }

    // Full view with leaderboard
    const [leaderboard, userRank] = await Promise.all([
      getSeasonLeaderboard(id, scope, scopeValue),
      getUserSeasonRank(session.user.id, id, scope, scopeValue),
    ])

    return NextResponse.json({
      season,
      leaderboard,
      userRank,
    })
  } catch (error) {
    console.error('Error fetching season:', error)
    return NextResponse.json(
      { error: 'Failed to fetch season' },
      { status: 500 }
    )
  }
}
