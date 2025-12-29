/**
 * Strava API Client
 * Handles authenticated requests with automatic token refresh
 */
import { prisma } from "@/lib/db"
import { encryptToken, decryptToken } from "./crypto"
import type { StravaTokenResponse, StravaActivity, StravaRateLimitInfo } from "./types"

const STRAVA_API_BASE = "https://www.strava.com/api/v3"
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/token"

// Track rate limits (app-wide)
let rateLimitInfo: StravaRateLimitInfo | null = null

export function getRateLimitInfo(): StravaRateLimitInfo | null {
  return rateLimitInfo
}

function parseRateLimitHeaders(headers: Headers): void {
  // X-RateLimit-Limit: 600,30000 (15-min limit, daily limit)
  // X-RateLimit-Usage: 314,27536 (15-min usage, daily usage)
  const limitHeader = headers.get("X-RateLimit-Limit")
  const usageHeader = headers.get("X-RateLimit-Usage")

  if (limitHeader && usageHeader) {
    const [shortLimit, dailyLimit] = limitHeader.split(",").map(Number)
    const [shortUsage, dailyUsage] = usageHeader.split(",").map(Number)

    rateLimitInfo = {
      shortTermLimit: shortLimit,
      shortTermUsage: shortUsage,
      dailyLimit: dailyLimit,
      dailyUsage: dailyUsage,
    }

    // Log warning if approaching limits
    if (shortUsage > shortLimit * 0.8 || dailyUsage > dailyLimit * 0.8) {
      console.warn("[Strava] Approaching rate limits:", rateLimitInfo)
    }
  }
}

async function refreshAccessToken(connectionId: string, refreshToken: string): Promise<StravaTokenResponse> {
  const clientId = process.env.AUTH_STRAVA_ID
  const clientSecret = process.env.AUTH_STRAVA_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Strava OAuth credentials not configured")
  }

  const response = await fetch(STRAVA_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("[Strava] Token refresh failed:", error)
    throw new Error(`Failed to refresh Strava token: ${response.status}`)
  }

  const tokens: StravaTokenResponse = await response.json()

  // CRITICAL: Strava rotates refresh tokens - must persist the new one
  await prisma.stravaConnection.update({
    where: { id: connectionId },
    data: {
      accessToken: tokens.access_token,
      refreshTokenEnc: encryptToken(tokens.refresh_token),
      expiresAt: new Date(tokens.expires_at * 1000),
      updatedAt: new Date(),
    },
  })

  console.log("[Strava] Token refreshed for connection:", connectionId)
  return tokens
}

interface StravaFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  body?: Record<string, unknown>
  params?: Record<string, string | number>
}

/**
 * Make an authenticated request to the Strava API
 * Automatically handles token refresh
 */
export async function stravaFetch<T>(
  userId: string,
  endpoint: string,
  options: StravaFetchOptions = {}
): Promise<T> {
  const connection = await prisma.stravaConnection.findUnique({
    where: { userId },
  })

  if (!connection) {
    throw new Error("No Strava connection found for user")
  }

  if (!connection.isActive) {
    throw new Error("Strava connection is inactive")
  }

  let accessToken = connection.accessToken

  // Check if token needs refresh (with 5 minute buffer)
  if (connection.expiresAt < new Date(Date.now() + 5 * 60 * 1000)) {
    console.log("[Strava] Token expired, refreshing...")
    const refreshToken = decryptToken(connection.refreshTokenEnc)
    const newTokens = await refreshAccessToken(connection.id, refreshToken)
    accessToken = newTokens.access_token
  }

  // Build URL with query params
  let url = `${STRAVA_API_BASE}${endpoint}`
  if (options.params) {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(options.params)) {
      searchParams.set(key, String(value))
    }
    url += `?${searchParams.toString()}`
  }

  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  }

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)
  parseRateLimitHeaders(response.headers)

  if (response.status === 429) {
    console.error("[Strava] Rate limited!")
    throw new Error("Strava rate limit exceeded")
  }

  if (!response.ok) {
    const error = await response.text()
    console.error(`[Strava] API error ${response.status}:`, error)
    throw new Error(`Strava API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch a single activity by ID
 */
export async function getStravaActivity(userId: string, activityId: number): Promise<StravaActivity> {
  return stravaFetch<StravaActivity>(userId, `/activities/${activityId}`)
}

/**
 * List athlete activities with pagination
 */
export async function listStravaActivities(
  userId: string,
  options: {
    before?: number // Unix timestamp
    after?: number // Unix timestamp
    page?: number
    perPage?: number
  } = {}
): Promise<StravaActivity[]> {
  const params: Record<string, string | number> = {
    per_page: options.perPage || 50,
  }

  if (options.before) params.before = options.before
  if (options.after) params.after = options.after
  if (options.page) params.page = options.page

  return stravaFetch<StravaActivity[]>(userId, "/athlete/activities", { params })
}

/**
 * Get the authenticated athlete's profile
 */
export async function getStravaAthlete(userId: string) {
  return stravaFetch<{ id: number; firstname: string; lastname: string }>(userId, "/athlete")
}

/**
 * Deauthorize the app (revoke access)
 */
export async function deauthorizeStrava(accessToken: string): Promise<void> {
  await fetch("https://www.strava.com/oauth/deauthorize", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: accessToken }),
  })
}
