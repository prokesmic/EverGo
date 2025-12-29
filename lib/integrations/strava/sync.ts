/**
 * Strava Sync Operations
 * Handles backfill and incremental sync
 */
import { prisma } from "@/lib/db"
import { listStravaActivities, getStravaActivity } from "./client"
import { importStravaActivity, hideStravaActivity } from "./import"

const BATCH_SIZE = 50 // Strava max per_page
const BACKFILL_MONTHS = 24 // Import last 24 months of activities

export interface SyncResult {
  imported: number
  updated: number
  errors: number
  skipped: number
}

/**
 * Perform initial backfill for a user
 * Imports all activities from the last 24 months
 */
export async function backfillStravaActivities(userId: string): Promise<SyncResult> {
  console.log(`[Strava Sync] Starting backfill for user: ${userId}`)

  const result: SyncResult = { imported: 0, updated: 0, errors: 0, skipped: 0 }

  // Calculate the "after" timestamp (24 months ago)
  const afterDate = new Date()
  afterDate.setMonth(afterDate.getMonth() - BACKFILL_MONTHS)
  const afterTimestamp = Math.floor(afterDate.getTime() / 1000)

  let page = 1
  let hasMore = true

  while (hasMore) {
    try {
      console.log(`[Strava Sync] Fetching page ${page}...`)
      const activities = await listStravaActivities(userId, {
        after: afterTimestamp,
        page,
        perPage: BATCH_SIZE,
      })

      if (activities.length === 0) {
        hasMore = false
        break
      }

      // Import each activity
      for (const activity of activities) {
        try {
          const importResult = await importStravaActivity(userId, activity)
          if (importResult.isNew) {
            result.imported++
          } else {
            result.updated++
          }
        } catch (error) {
          console.error(`[Strava Sync] Error importing activity ${activity.id}:`, error)
          result.errors++
        }
      }

      // If we got fewer than batch size, we've reached the end
      if (activities.length < BATCH_SIZE) {
        hasMore = false
      } else {
        page++
      }

      // Rate limit protection - small delay between pages
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`[Strava Sync] Error fetching page ${page}:`, error)
      result.errors++
      hasMore = false
    }
  }

  // Update last backfill timestamp
  await prisma.stravaConnection.update({
    where: { userId },
    data: { lastBackfillAt: new Date() },
  })

  console.log(`[Strava Sync] Backfill complete:`, result)
  return result
}

/**
 * Perform incremental sync for a user
 * Fetches activities since last sync (with 6 hour overlap for safety)
 */
export async function syncRecentStravaActivities(userId: string): Promise<SyncResult> {
  console.log(`[Strava Sync] Starting incremental sync for user: ${userId}`)

  const result: SyncResult = { imported: 0, updated: 0, errors: 0, skipped: 0 }

  const connection = await prisma.stravaConnection.findUnique({
    where: { userId },
  })

  if (!connection || !connection.isActive) {
    console.log(`[Strava Sync] No active connection for user: ${userId}`)
    return result
  }

  // Calculate the "after" timestamp (last sync minus 6 hours for overlap)
  let afterTimestamp: number
  if (connection.lastSyncAt) {
    const afterDate = new Date(connection.lastSyncAt.getTime() - 6 * 60 * 60 * 1000)
    afterTimestamp = Math.floor(afterDate.getTime() / 1000)
  } else {
    // If never synced, get last 7 days
    const afterDate = new Date()
    afterDate.setDate(afterDate.getDate() - 7)
    afterTimestamp = Math.floor(afterDate.getTime() / 1000)
  }

  let page = 1
  let hasMore = true

  while (hasMore) {
    try {
      const activities = await listStravaActivities(userId, {
        after: afterTimestamp,
        page,
        perPage: BATCH_SIZE,
      })

      if (activities.length === 0) {
        hasMore = false
        break
      }

      for (const activity of activities) {
        try {
          const importResult = await importStravaActivity(userId, activity)
          if (importResult.isNew) {
            result.imported++
          } else {
            result.updated++
          }
        } catch (error) {
          console.error(`[Strava Sync] Error importing activity ${activity.id}:`, error)
          result.errors++
        }
      }

      if (activities.length < BATCH_SIZE) {
        hasMore = false
      } else {
        page++
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`[Strava Sync] Error in incremental sync:`, error)
      result.errors++
      hasMore = false
    }
  }

  // Update last sync timestamp
  await prisma.stravaConnection.update({
    where: { userId },
    data: { lastSyncAt: new Date() },
  })

  console.log(`[Strava Sync] Incremental sync complete:`, result)
  return result
}

/**
 * Sync all active Strava connections (for cron job)
 */
export async function syncAllStravaConnections(): Promise<{ synced: number; errors: number }> {
  const connections = await prisma.stravaConnection.findMany({
    where: { isActive: true },
    select: { userId: true },
  })

  console.log(`[Strava Sync] Syncing ${connections.length} active connections`)

  let synced = 0
  let errors = 0

  for (const { userId } of connections) {
    try {
      await syncRecentStravaActivities(userId)
      synced++
    } catch (error) {
      console.error(`[Strava Sync] Error syncing user ${userId}:`, error)
      errors++
    }

    // Rate limit protection between users
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return { synced, errors }
}

/**
 * Process a single Strava webhook event
 */
export async function processStravaWebhookEvent(eventId: string): Promise<void> {
  const event = await prisma.stravaWebhookEvent.findUnique({
    where: { id: eventId },
  })

  if (!event) {
    throw new Error(`Webhook event not found: ${eventId}`)
  }

  // Find the user by Strava athlete ID
  const connection = await prisma.stravaConnection.findUnique({
    where: { athleteId: event.ownerId },
  })

  if (!connection) {
    console.warn(`[Strava Webhook] No connection found for athlete: ${event.ownerId}`)
    await prisma.stravaWebhookEvent.update({
      where: { id: eventId },
      data: {
        status: "DONE",
        error: "No connection found for athlete",
      },
    })
    return
  }

  if (!connection.isActive) {
    console.warn(`[Strava Webhook] Connection inactive for athlete: ${event.ownerId}`)
    await prisma.stravaWebhookEvent.update({
      where: { id: eventId },
      data: {
        status: "DONE",
        error: "Connection inactive",
      },
    })
    return
  }

  try {
    if (event.objectType === "activity") {
      await handleActivityEvent(connection.userId, event.objectId.toString(), event.aspectType)
    } else if (event.objectType === "athlete" && event.aspectType === "update") {
      // Check for deauthorization
      const updates = event.updates as Record<string, unknown>
      if (updates?.authorized === "false") {
        await handleDeauthorization(connection.userId)
      }
    }

    await prisma.stravaWebhookEvent.update({
      where: { id: eventId },
      data: { status: "DONE" },
    })

    // Update last webhook timestamp
    await prisma.stravaConnection.update({
      where: { userId: connection.userId },
      data: { lastWebhookAt: new Date() },
    })
  } catch (error) {
    console.error(`[Strava Webhook] Error processing event ${eventId}:`, error)
    await prisma.stravaWebhookEvent.update({
      where: { id: eventId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        attempts: { increment: 1 },
      },
    })
    throw error
  }
}

async function handleActivityEvent(
  userId: string,
  stravaActivityId: string,
  aspectType: string
): Promise<void> {
  if (aspectType === "delete") {
    // Hide the activity (don't permanently delete in case of privacy toggle)
    await hideStravaActivity(stravaActivityId)
    console.log(`[Strava Webhook] Activity deleted: ${stravaActivityId}`)
  } else {
    // Create or update - fetch full activity details and import
    const activity = await getStravaActivity(userId, parseInt(stravaActivityId))
    await importStravaActivity(userId, activity)
    console.log(`[Strava Webhook] Activity ${aspectType}d: ${stravaActivityId}`)
  }
}

async function handleDeauthorization(userId: string): Promise<void> {
  await prisma.stravaConnection.update({
    where: { userId },
    data: { isActive: false },
  })
  console.log(`[Strava Webhook] User deauthorized: ${userId}`)
}
