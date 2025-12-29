/**
 * Strava OAuth Callback Route
 * Handles the redirect from Strava after authorization
 */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { encryptToken } from "@/lib/integrations/strava/crypto"
import type { StravaTokenResponse } from "@/lib/integrations/strava/types"

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"
const STRAVA_SCOPES = "read,activity:read_all,profile:read_all"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    // Redirect to login with return URL
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(loginUrl)
  }

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const state = searchParams.get("state")

  // Handle errors from Strava
  if (error) {
    console.error("[Strava Callback] Error from Strava:", error)
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=${encodeURIComponent(error)}`, request.nextUrl.origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=no_code", request.nextUrl.origin)
    )
  }

  // Validate state if present
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, "base64").toString())
      if (stateData.userId !== session.user.id) {
        console.warn("[Strava Callback] State user mismatch")
        // Continue anyway, we use session user
      }
    } catch {
      console.warn("[Strava Callback] Invalid state parameter")
    }
  }

  try {
    const clientId = process.env.AUTH_STRAVA_ID
    const clientSecret = process.env.AUTH_STRAVA_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=not_configured", request.nextUrl.origin)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(STRAVA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error("[Strava Callback] Token exchange failed:", errorText)
      return NextResponse.redirect(
        new URL("/settings/integrations?error=token_exchange_failed", request.nextUrl.origin)
      )
    }

    const tokens: StravaTokenResponse = await tokenResponse.json()

    if (!tokens.athlete) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=no_athlete", request.nextUrl.origin)
      )
    }

    // Check if this Strava account is already connected to another user
    const existingConnection = await prisma.stravaConnection.findUnique({
      where: { athleteId: BigInt(tokens.athlete.id) },
    })

    if (existingConnection && existingConnection.userId !== session.user.id) {
      console.error("[Strava Callback] Athlete already connected to another user")
      return NextResponse.redirect(
        new URL("/settings/integrations?error=already_connected", request.nextUrl.origin)
      )
    }

    // Store or update the connection
    await prisma.stravaConnection.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        athleteId: BigInt(tokens.athlete.id),
        scopes: STRAVA_SCOPES,
        accessToken: tokens.access_token,
        refreshTokenEnc: encryptToken(tokens.refresh_token),
        expiresAt: new Date(tokens.expires_at * 1000),
        isActive: true,
      },
      update: {
        athleteId: BigInt(tokens.athlete.id),
        scopes: STRAVA_SCOPES,
        accessToken: tokens.access_token,
        refreshTokenEnc: encryptToken(tokens.refresh_token),
        expiresAt: new Date(tokens.expires_at * 1000),
        isActive: true,
        updatedAt: new Date(),
      },
    })

    // Queue initial backfill job
    await prisma.integrationJob.create({
      data: {
        type: "STRAVA_BACKFILL",
        payload: { userId: session.user.id },
        status: "PENDING",
        runAt: new Date(),
      },
    })

    console.log("[Strava Callback] Connection established for user:", session.user.id)

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL("/settings/integrations?success=strava_connected", request.nextUrl.origin)
    )
  } catch (error) {
    console.error("[Strava Callback] Error:", error)
    return NextResponse.redirect(
      new URL("/settings/integrations?error=internal_error", request.nextUrl.origin)
    )
  }
}
