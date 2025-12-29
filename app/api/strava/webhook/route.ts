/**
 * Strava Webhook Route
 * Handles webhook validation (GET) and event reception (POST)
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET: Webhook validation (Strava subscription verification)
 * Strava sends hub.mode, hub.challenge, hub.verify_token as query params
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get("hub.mode")
  const challenge = searchParams.get("hub.challenge")
  const verifyToken = searchParams.get("hub.verify_token")

  console.log("[Strava Webhook] Validation request:", { mode, challenge, verifyToken })

  // Verify the request
  if (mode !== "subscribe") {
    console.error("[Strava Webhook] Invalid mode:", mode)
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  }

  const expectedToken = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
  if (!expectedToken) {
    console.error("[Strava Webhook] STRAVA_WEBHOOK_VERIFY_TOKEN not configured")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  if (verifyToken !== expectedToken) {
    console.error("[Strava Webhook] Token mismatch")
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 })
  }

  // Echo back the challenge to confirm subscription
  console.log("[Strava Webhook] Validation successful, returning challenge")
  return NextResponse.json({ "hub.challenge": challenge })
}

/**
 * POST: Receive webhook events
 * Must respond 200 within 2 seconds, process async
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("[Strava Webhook] Received event:", {
      object_type: payload.object_type,
      object_id: payload.object_id,
      aspect_type: payload.aspect_type,
      owner_id: payload.owner_id,
    })

    // Validate required fields
    if (!payload.object_type || !payload.object_id || !payload.aspect_type || !payload.owner_id) {
      console.error("[Strava Webhook] Missing required fields in payload")
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Store the event for async processing
    const event = await prisma.stravaWebhookEvent.create({
      data: {
        subscriptionId: payload.subscription_id || 0,
        ownerId: BigInt(payload.owner_id),
        objectType: payload.object_type,
        objectId: BigInt(payload.object_id),
        aspectType: payload.aspect_type,
        updates: payload.updates || null,
        eventTime: new Date(payload.event_time * 1000),
        status: "PENDING",
      },
    })

    // Queue a job to process this event
    await prisma.integrationJob.create({
      data: {
        type: "STRAVA_PROCESS_WEBHOOK",
        payload: { eventId: event.id },
        status: "PENDING",
        runAt: new Date(),
      },
    })

    console.log("[Strava Webhook] Event queued:", event.id)

    // CRITICAL: Respond 200 immediately (Strava requires response within 2 seconds)
    return NextResponse.json({ status: "received" })
  } catch (error) {
    console.error("[Strava Webhook] Error processing webhook:", error)
    // Still return 200 to prevent Strava from retrying excessively
    return NextResponse.json({ status: "error" })
  }
}
