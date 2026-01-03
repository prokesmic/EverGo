/**
 * Strava OAuth Connect Route
 * Initiates OAuth flow and handles callback
 */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { encryptToken } from "@/lib/integrations/strava/crypto"
import type { StravaTokenResponse } from "@/lib/integrations/strava/types"

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize"
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token"

// Scopes we request from Strava
const STRAVA_SCOPES = "read,activity:read_all,profile:read_all"

/**
 * GET: Initiate OAuth flow - redirects to Strava
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientId = process.env.AUTH_STRAVA_ID
  if (!clientId) {
    return NextResponse.json({ error: "Strava not configured" }, { status: 500 })
  }

  // Build the authorization URL
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/strava/callback`
  const state = Buffer.from(JSON.stringify({ userId: session.user.id })).toString("base64")

  const authUrl = new URL(STRAVA_AUTH_URL)
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("approval_prompt", "auto")
  authUrl.searchParams.set("scope", STRAVA_SCOPES)
  authUrl.searchParams.set("state", state)

  return NextResponse.redirect(authUrl.toString())
}

/**
 * POST: Complete OAuth flow (exchange code for tokens)
 * Called from the callback page with the authorization code
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 })
    }

    const clientId = process.env.AUTH_STRAVA_ID
    const clientSecret = process.env.AUTH_STRAVA_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Strava not configured" }, { status: 500 })
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
      const error = await tokenResponse.text()
      console.error("[Strava Connect] Token exchange failed:", error)
      return NextResponse.json({ error: "Failed to exchange code" }, { status: 400 })
    }

    const tokens: StravaTokenResponse = await tokenResponse.json()

    if (!tokens.athlete) {
      return NextResponse.json({ error: "No athlete data in response" }, { status: 400 })
    }

    // Store or update the connection
    const connection = await prisma.stravaConnection.upsert({
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

    console.log("[Strava Connect] Connection established:", connection.id)

    return NextResponse.json({
      success: true,
      athlete: {
        id: tokens.athlete.id,
        firstname: tokens.athlete.firstname,
        lastname: tokens.athlete.lastname,
      },
    })
  } catch (error) {
    console.error("[Strava Connect] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
