import { NextRequest, NextResponse } from 'next/server'
import { finalizeGauntlets, expirePendingGauntlets } from '@/lib/gauntlet'
import { processSeasons } from '@/lib/season'
import { finalizeCrewWars, expirePendingCrewWars } from '@/lib/crew-wars'

/**
 * POST /api/cron/v6
 *
 * Unified V6 cron job that processes all competition features:
 * 1. Gauntlets - finalize completed, expire pending
 * 2. Seasons - activate/finalize seasons
 * 3. Crew Wars - finalize completed, expire pending
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

  const results: Record<string, any> = {}

  try {
    console.log('[Cron V6] Starting unified V6 processing...')

    // 1. Process Gauntlets
    try {
      const gauntletFinalized = await finalizeGauntlets()
      const gauntletExpired = await expirePendingGauntlets()
      results.gauntlet = { finalized: gauntletFinalized, expired: gauntletExpired }
      console.log(`[Cron V6] Gauntlets: finalized=${gauntletFinalized}, expired=${gauntletExpired}`)
    } catch (e) {
      console.error('[Cron V6] Gauntlet processing failed:', e)
      results.gauntlet = { error: String(e) }
    }

    // 2. Process Seasons
    try {
      const seasonResult = await processSeasons()
      results.season = seasonResult
      console.log(`[Cron V6] Seasons: activated=${seasonResult.activated}, finalized=${seasonResult.finalized}`)
    } catch (e) {
      console.error('[Cron V6] Season processing failed:', e)
      results.season = { error: String(e) }
    }

    // 3. Process Crew Wars
    try {
      const crewWarsFinalized = await finalizeCrewWars()
      const crewWarsExpired = await expirePendingCrewWars()
      results.crewWars = { finalized: crewWarsFinalized, expired: crewWarsExpired }
      console.log(`[Cron V6] Crew Wars: finalized=${crewWarsFinalized}, expired=${crewWarsExpired}`)
    } catch (e) {
      console.error('[Cron V6] Crew Wars processing failed:', e)
      results.crewWars = { error: String(e) }
    }

    console.log('[Cron V6] Unified processing complete')

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('[Cron V6] Unified processing failed:', error)
    return NextResponse.json(
      { error: 'V6 processing failed', results },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
