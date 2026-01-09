import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createGauntlet,
  getUserGauntlets,
  getActiveGauntlet,
  getPendingInvitations,
  getGauntletStats,
} from '@/lib/gauntlet'
import { GauntletDuration } from '@prisma/client'

/**
 * GET /api/gauntlet
 *
 * Get user's gauntlets, active gauntlet, pending invitations, or stats
 * Query params:
 * - type: 'all' | 'active' | 'invitations' | 'stats'
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'

  try {
    switch (type) {
      case 'active': {
        const gauntlet = await getActiveGauntlet(session.user.id)
        return NextResponse.json({ gauntlet })
      }

      case 'invitations': {
        const invitations = await getPendingInvitations(session.user.id)
        return NextResponse.json({ invitations })
      }

      case 'stats': {
        const stats = await getGauntletStats(session.user.id)
        return NextResponse.json({ stats })
      }

      case 'all':
      default: {
        const gauntlets = await getUserGauntlets(session.user.id)
        return NextResponse.json({ gauntlets })
      }
    }
  } catch (error) {
    console.error('Error fetching gauntlets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gauntlets' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gauntlet
 *
 * Create a new gauntlet challenge
 * Body: { opponentId, duration, message? }
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { opponentId, duration, message } = body

    if (!opponentId) {
      return NextResponse.json(
        { error: 'Opponent ID is required' },
        { status: 400 }
      )
    }

    // Validate duration
    const validDurations: GauntletDuration[] = ['ONE_DAY', 'THREE_DAYS', 'ONE_WEEK']
    if (!validDurations.includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be ONE_DAY, THREE_DAYS, or ONE_WEEK' },
        { status: 400 }
      )
    }

    const gauntlet = await createGauntlet({
      challengerId: session.user.id,
      opponentId,
      duration,
      message,
    })

    return NextResponse.json({ gauntlet }, { status: 201 })
  } catch (error) {
    console.error('Error creating gauntlet:', error)
    const message = error instanceof Error ? error.message : 'Failed to create gauntlet'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
