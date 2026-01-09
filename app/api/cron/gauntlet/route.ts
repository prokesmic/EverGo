import { NextRequest, NextResponse } from 'next/server'
import { finalizeGauntlets, expirePendingGauntlets } from '@/lib/gauntlet'

/**
 * POST /api/cron/gauntlet
 *
 * Cron job to:
 * 1. Finalize completed gauntlets
 * 2. Expire pending gauntlets that weren't responded to
 *
 * Should be run hourly via Vercel Cron or similar.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Starting gauntlet processing...')

    // Finalize completed gauntlets
    const finalized = await finalizeGauntlets()
    console.log(`[Cron] Finalized ${finalized} gauntlets`)

    // Expire pending gauntlets
    const expired = await expirePendingGauntlets()
    console.log(`[Cron] Expired ${expired} pending gauntlets`)

    return NextResponse.json({
      success: true,
      finalized,
      expired,
    })
  } catch (error) {
    console.error('[Cron] Gauntlet processing failed:', error)
    return NextResponse.json(
      { error: 'Gauntlet processing failed' },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
