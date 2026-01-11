/**
 * Job Queue Processor Cron Endpoint
 *
 * Processes pending background jobs.
 * Should be called frequently (e.g., every minute).
 *
 * POST /api/cron/jobs - Process jobs
 * GET /api/cron/jobs - Get queue status
 */

import { NextRequest, NextResponse } from "next/server"
import { processJobs, getQueueStatus, enqueueJob } from "@/lib/jobs/queue"

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET - Queue status
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const status = await getQueueStatus()
    return NextResponse.json({ status })
  } catch (error) {
    console.error("[Jobs Cron] Status error:", error)
    return NextResponse.json(
      { error: "Failed to get queue status" },
      { status: 500 }
    )
  }
}

/**
 * POST - Process jobs
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const limit = body.limit ?? 20

    const result = await processJobs(limit)

    // Optionally enqueue cleanup job once per day
    const now = new Date()
    if (now.getHours() === 3 && now.getMinutes() < 5) {
      await enqueueJob("CLEANUP_OLD_JOBS", { daysToKeep: 7 }, { idempotencyKey: "cleanup-daily" })
    }

    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
    })
  } catch (error) {
    console.error("[Jobs Cron] Processing error:", error)
    return NextResponse.json(
      { error: "Failed to process jobs" },
      { status: 500 }
    )
  }
}
