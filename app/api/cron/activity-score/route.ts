import { NextResponse } from "next/server"
import { recomputeActivityScores } from "@/src/server/jobs/recomputeActivityScores"

/**
 * POST /api/cron/activity-score
 *
 * Vercel Cron endpoint to recompute activity scores daily.
 * Should be triggered by cron configuration in vercel.json.
 */
export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[Cron] Starting activity score computation...")

    const result = await recomputeActivityScores(28)

    console.log(`[Cron] Activity scores computed: ${result.processed} processed, ${result.updated} updated`)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("[Cron] Error computing activity scores:", error)
    return NextResponse.json(
      { error: "Failed to compute activity scores" },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET(request: Request) {
  return POST(request)
}
