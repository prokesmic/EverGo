import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getGauntletById,
  acceptGauntlet,
  declineGauntlet,
  cancelGauntlet,
} from '@/lib/gauntlet'

/**
 * GET /api/gauntlet/[id]
 *
 * Get a specific gauntlet by ID
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

  try {
    const gauntlet = await getGauntletById(id)

    if (!gauntlet) {
      return NextResponse.json({ error: 'Gauntlet not found' }, { status: 404 })
    }

    // Only participants can view
    if (gauntlet.challengerId !== session.user.id && gauntlet.opponentId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to view this gauntlet' }, { status: 403 })
    }

    return NextResponse.json({ gauntlet })
  } catch (error) {
    console.error('Error fetching gauntlet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gauntlet' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gauntlet/[id]
 *
 * Perform an action on a gauntlet
 * Body: { action: 'accept' | 'decline' | 'cancel' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'accept': {
        const gauntlet = await acceptGauntlet(id, session.user.id)
        return NextResponse.json({ gauntlet, message: 'Gauntlet accepted! The challenge is on!' })
      }

      case 'decline': {
        await declineGauntlet(id, session.user.id)
        return NextResponse.json({ message: 'Gauntlet declined' })
      }

      case 'cancel': {
        await cancelGauntlet(id, session.user.id)
        return NextResponse.json({ message: 'Gauntlet cancelled' })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be accept, decline, or cancel' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error performing gauntlet action:', error)
    const message = error instanceof Error ? error.message : 'Failed to perform action'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
