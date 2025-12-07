// Simple in-memory rate limiter for API routes
// For production at scale, use Redis-based rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Cleanup every minute

interface RateLimitConfig {
  // Maximum number of requests allowed
  limit: number
  // Time window in seconds
  windowSeconds: number
  // Unique identifier for this limiter (e.g., 'api', 'auth', 'upload')
  identifier: string
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number // seconds until reset
  limit: number
}

// Default configurations for different API types
export const RATE_LIMITS = {
  // General API: 100 requests per minute
  api: { limit: 100, windowSeconds: 60, identifier: 'api' },

  // Authentication: 10 attempts per 15 minutes
  auth: { limit: 10, windowSeconds: 900, identifier: 'auth' },

  // Search: 30 requests per minute
  search: { limit: 30, windowSeconds: 60, identifier: 'search' },

  // File uploads: 20 per hour
  upload: { limit: 20, windowSeconds: 3600, identifier: 'upload' },

  // Activity creation: 60 per hour
  activity: { limit: 60, windowSeconds: 3600, identifier: 'activity' },

  // Comments/Posts: 30 per minute
  content: { limit: 30, windowSeconds: 60, identifier: 'content' },
} as const

/**
 * Check and update rate limit for a given key
 *
 * @param key - Unique identifier (usually IP or user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const storeKey = `${config.identifier}:${key}`

  let entry = rateLimitStore.get(storeKey)

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(storeKey, entry)

    return {
      success: true,
      remaining: config.limit - 1,
      resetIn: config.windowSeconds,
      limit: config.limit,
    }
  }

  // Increment count
  entry.count++

  const remaining = Math.max(0, config.limit - entry.count)
  const resetIn = Math.ceil((entry.resetTime - now) / 1000)

  // Check if over limit
  if (entry.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      resetIn,
      limit: config.limit,
    }
  }

  return {
    success: true,
    remaining,
    resetIn,
    limit: config.limit,
  }
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check common headers for proxied requests
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Rate limit middleware for API routes
 * Returns null if allowed, or a Response if rate limited
 */
export function rateLimitMiddleware(
  request: Request,
  config: RateLimitConfig = RATE_LIMITS.api
): Response | null {
  const ip = getClientIp(request)
  const result = checkRateLimit(ip, config)

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter: result.resetIn,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.resetIn),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.resetIn),
        },
      }
    )
  }

  return null
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Limit', String(result.limit))
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(result.resetIn))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
