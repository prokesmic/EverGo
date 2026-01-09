import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getHeadToHead,
  getUserRivals,
  getUserRivalryStats,
  getTopRivalries,
} from '@/lib/head-to-head'

/**
 * GET /api/rivalry/head-to-head
 *
 * Get head-to-head records
 * Query params:
 * - type: 'record' | 'rivals' | 'stats' | 'top'
 * - opponentId: for 'record' type
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'rivals'
  const opponentId = searchParams.get('opponentId')

  try {
    switch (type) {
      case 'record': {
        if (!opponentId) {
          return NextResponse.json(
            { error: 'opponentId is required for record type' },
            { status: 400 }
          )
        }
        const record = await getHeadToHead(session.user.id, opponentId)
        return NextResponse.json({ record })
      }

      case 'rivals': {
        const rivals = await getUserRivals(session.user.id)
        return NextResponse.json({ rivals })
      }

      case 'stats': {
        const stats = await getUserRivalryStats(session.user.id)
        return NextResponse.json({ stats })
      }

      case 'top': {
        const topRivalries = await getTopRivalries()
        return NextResponse.json({ topRivalries })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching head-to-head data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch head-to-head data' },
      { status: 500 }
    )
  }
}
