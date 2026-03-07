import { createHash } from "crypto"
import { NextResponse } from "next/server"

type CachedResponse = {
  status: number
  body: unknown
  expiresAt: number
}

const DEFAULT_TTL_MS = 5 * 60 * 1000
const cache = new Map<string, CachedResponse>()

function normalizeKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex")
}

function pruneExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) {
      cache.delete(key)
    }
  }
}

function replayResponse(entry: CachedResponse) {
  const response = NextResponse.json(entry.body, { status: entry.status })
  response.headers.set("x-idempotent-replay", "true")
  return response
}

export async function withIdempotency(
  rawKey: string | null,
  handler: () => Promise<Response>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<Response> {
  if (!rawKey) {
    return handler()
  }

  pruneExpiredEntries()
  const key = normalizeKey(rawKey)
  const cached = cache.get(key)
  if (cached) {
    return replayResponse(cached)
  }

  const response = await handler()
  const clone = response.clone()

  try {
    const body = await clone.json()
    cache.set(key, {
      status: response.status,
      body,
      expiresAt: Date.now() + ttlMs,
    })
  } catch {
    // Ignore non-JSON responses for idempotency replay
  }

  return response
}
