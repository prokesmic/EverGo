/**
 * Strava Manual Sync Route
 * Triggers a sync for the current user
 */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { syncRecentStravaActivities } from "@/lib/integrations/strava/sync"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const connection = await prisma.stravaConnection.findUnique({
      where: { userId: session.user.id },
    })

    if (!connection) {
      return NextResponse.json({ error: "No Strava connection found" }, { status: 404 })
    }

    if (!connection.isActive) {
      return NextResponse.json({ error: "Strava connection is inactive" }, { status: 400 })
    }

    // Perform the sync
    const result = await syncRecentStravaActivities(session.user.id)

    return NextResponse.json({
      success: true,
      result: {
        imported: result.imported,
        updated: result.updated,
        errors: result.errors,
      },
    })
  } catch (error) {
    console.error("[Strava Sync] Error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

/**
 * GET: Get sync status
 */
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const connection = await prisma.stravaConnection.findUnique({
      where: { userId: session.user.id },
      select: {
        isActive: true,
        lastSyncAt: true,
        lastBackfillAt: true,
        lastWebhookAt: true,
        createdAt: true,
      },
    })

    if (!connection) {
      return NextResponse.json({ connected: false })
    }

    // Count imported activities
    const activityCount = await prisma.activity.count({
      where: {
        userId: session.user.id,
        source: "IMPORT_STRAVA",
        isHidden: false,
      },
    })

    // Count pending jobs
    const pendingJobs = await prisma.integrationJob.count({
      where: {
        status: { in: ["PENDING", "RUNNING"] },
        payload: {
          path: ["userId"],
          equals: session.user.id,
        },
      },
    })

    return NextResponse.json({
      connected: connection.isActive,
      lastSyncAt: connection.lastSyncAt,
      lastBackfillAt: connection.lastBackfillAt,
      lastWebhookAt: connection.lastWebhookAt,
      connectedAt: connection.createdAt,
      activityCount,
      pendingJobs,
    })
  } catch (error) {
    console.error("[Strava Sync] Error getting status:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
