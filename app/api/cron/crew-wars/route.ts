import { NextRequest, NextResponse } from 'next/server'
import { finalizeCrewWars, expirePendingCrewWars } from '@/lib/crew-wars'

/**
 * POST /api/cron/crew-wars
 *
 * Cron job to:
 * 1. Finalize completed crew wars
 * 2. Expire pending crew war challenges
 *
 * Should be run hourly via Vercel Cron.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Starting crew wars processing...')

    // Finalize completed crew wars
    const finalized = await finalizeCrewWars()
    console.log(`[Cron] Finalized ${finalized} crew wars`)

    // Expire pending crew wars
    const expired = await expirePendingCrewWars()
    console.log(`[Cron] Expired ${expired} pending crew wars`)

    return NextResponse.json({
      success: true,
      finalized,
      expired,
    })
  } catch (error) {
    console.error('[Cron] Crew wars processing failed:', error)
    return NextResponse.json(
      { error: 'Crew wars processing failed' },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
