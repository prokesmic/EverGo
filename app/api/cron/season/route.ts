import { NextRequest, NextResponse } from 'next/server'
import { processSeasons } from '@/lib/season'

/**
 * POST /api/cron/season
 *
 * Cron job to:
 * 1. Activate upcoming seasons that have started
 * 2. Finalize completed seasons
 * 3. Create next month's season
 *
 * Should be run daily via Vercel Cron.
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Starting season processing...')

    const result = await processSeasons()

    console.log(`[Cron] Season processing complete: activated=${result.activated}, finalized=${result.finalized}`)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('[Cron] Season processing failed:', error)
    return NextResponse.json(
      { error: 'Season processing failed' },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
