/**
 * Strava Sync Cron Route
 * Called by Vercel Cron or external scheduler to sync all connections
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET: Trigger incremental sync for all active connections
 * Called by Vercel Cron every 10-30 minutes
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  // Allow if secret matches (Vercel Cron sends as Bearer token)
  // Also allow in development
  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (!cronSecret && process.env.NODE_ENV === "development")

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Queue sync jobs for all active connections
    const connections = await prisma.stravaConnection.findMany({
      where: { isActive: true },
      select: { userId: true },
    })

    console.log(`[Strava Cron] Queuing sync for ${connections.length} connections`)

    // Create a sync job for each connection
    const jobs = await prisma.integrationJob.createMany({
      data: connections.map(({ userId }) => ({
        type: "STRAVA_SYNC_RECENT",
        payload: { userId },
        status: "PENDING",
        runAt: new Date(),
      })),
    })

    // Also trigger the job runner
    const jobRunnerUrl = `${process.env.NEXTAUTH_URL}/api/jobs/run`
    const jobSecret = process.env.STRAVA_SYNC_SIGNING_SECRET

    if (jobSecret) {
      // Fire and forget - don't wait for job runner
      fetch(jobRunnerUrl, {
        method: "POST",
        headers: { "x-evergo-job-secret": jobSecret },
      }).catch((err) => console.error("[Strava Cron] Failed to trigger job runner:", err))
    }

    return NextResponse.json({
      success: true,
      queued: connections.length,
    })
  } catch (error) {
    console.error("[Strava Cron] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
