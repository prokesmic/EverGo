/**
 * Integration Job Runner
 * Processes queued jobs (backfills, syncs, webhook events)
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  backfillStravaActivities,
  syncRecentStravaActivities,
  processStravaWebhookEvent,
  syncAllStravaConnections,
} from "@/lib/integrations/strava/sync"

const MAX_CONCURRENT_JOBS = 3
const MAX_ATTEMPTS = 5

type JobPayload = {
  userId?: string
  eventId?: string
}

/**
 * POST: Run pending jobs (called by cron or manually)
 * Requires secret header for security
 */
export async function POST(request: NextRequest) {
  // Verify secret (for cron job security)
  const authHeader = request.headers.get("x-evergo-job-secret")
  const expectedSecret = process.env.STRAVA_SYNC_SIGNING_SECRET

  // Allow if secret matches OR if in development without secret
  const isAuthorized =
    (expectedSecret && authHeader === expectedSecret) ||
    (!expectedSecret && process.env.NODE_ENV === "development")

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Select pending jobs
    const jobs = await prisma.integrationJob.findMany({
      where: {
        status: "PENDING",
        runAt: { lte: new Date() },
        attempts: { lt: MAX_ATTEMPTS },
      },
      take: MAX_CONCURRENT_JOBS,
      orderBy: { runAt: "asc" },
    })

    console.log(`[Job Runner] Found ${jobs.length} pending jobs`)

    const results: { id: string; type: string; status: string; error?: string }[] = []

    for (const job of jobs) {
      // Mark as running
      await prisma.integrationJob.update({
        where: { id: job.id },
        data: { status: "RUNNING", attempts: { increment: 1 } },
      })

      try {
        const payload = job.payload as JobPayload

        switch (job.type) {
          case "STRAVA_BACKFILL":
            if (payload.userId) {
              await backfillStravaActivities(payload.userId)
            }
            break

          case "STRAVA_SYNC_RECENT":
            if (payload.userId) {
              await syncRecentStravaActivities(payload.userId)
            }
            break

          case "STRAVA_PROCESS_WEBHOOK":
            if (payload.eventId) {
              await processStravaWebhookEvent(payload.eventId)
            }
            break

          case "STRAVA_SYNC_ALL":
            await syncAllStravaConnections()
            break

          default:
            throw new Error(`Unknown job type: ${job.type}`)
        }

        // Mark as done
        await prisma.integrationJob.update({
          where: { id: job.id },
          data: { status: "DONE", error: null },
        })

        results.push({ id: job.id, type: job.type, status: "DONE" })
        console.log(`[Job Runner] Job completed: ${job.id} (${job.type})`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        // Check if should retry
        const attempts = job.attempts + 1
        const shouldRetry = attempts < MAX_ATTEMPTS

        if (shouldRetry) {
          // Exponential backoff: 1min, 5min, 25min, 2hrs
          const delayMinutes = Math.pow(5, attempts - 1)
          const nextRun = new Date(Date.now() + delayMinutes * 60 * 1000)

          await prisma.integrationJob.update({
            where: { id: job.id },
            data: {
              status: "PENDING",
              runAt: nextRun,
              error: errorMessage,
            },
          })

          console.log(`[Job Runner] Job ${job.id} failed, retry at ${nextRun.toISOString()}`)
        } else {
          await prisma.integrationJob.update({
            where: { id: job.id },
            data: { status: "FAILED", error: errorMessage },
          })

          console.error(`[Job Runner] Job ${job.id} failed permanently: ${errorMessage}`)
        }

        results.push({
          id: job.id,
          type: job.type,
          status: shouldRetry ? "RETRY" : "FAILED",
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error("[Job Runner] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET: Get job queue status
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-evergo-job-secret")
  const expectedSecret = process.env.STRAVA_SYNC_SIGNING_SECRET

  const isAuthorized =
    (expectedSecret && authHeader === expectedSecret) ||
    (!expectedSecret && process.env.NODE_ENV === "development")

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const stats = await prisma.integrationJob.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    const pending = await prisma.integrationJob.count({
      where: { status: "PENDING", runAt: { lte: new Date() } },
    })

    return NextResponse.json({
      stats: stats.reduce(
        (acc, { status, _count }) => ({ ...acc, [status]: _count.id }),
        {} as Record<string, number>
      ),
      readyToRun: pending,
    })
  } catch (error) {
    console.error("[Job Runner] Error getting stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
