import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { logger } from '@/lib/logger'
import { rateLimitMiddleware, RATE_LIMITS, getClientIp } from '@/lib/rate-limit'

type RateLimitType = keyof typeof RATE_LIMITS

interface ApiHandlerOptions {
  // Require authentication
  requireAuth?: boolean
  // Rate limit configuration
  rateLimit?: RateLimitType
  // Custom rate limit key (default: IP address)
  rateLimitKey?: (request: Request, session: any) => string
}

interface ApiContext {
  request: Request
  session: any | null
  userId: string | null
  params?: Record<string, string>
}

type ApiHandler = (ctx: ApiContext) => Promise<Response>

/**
 * Wrapper for API route handlers with built-in:
 * - Logging
 * - Rate limiting
 * - Authentication
 * - Error handling
 */
export function createApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
) {
  return async (request: Request, { params }: { params?: Record<string, string> } = {}) => {
    const startTime = Date.now()
    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Rate limiting
      if (options.rateLimit) {
        const config = RATE_LIMITS[options.rateLimit]
        const rateLimitResponse = rateLimitMiddleware(request, config)
        if (rateLimitResponse) {
          logger.warn('Rate limit exceeded', {
            path,
            ip: getClientIp(request),
            limiter: options.rateLimit,
          })
          return rateLimitResponse
        }
      }

      // Authentication
      let session = null
      let userId = null

      if (options.requireAuth) {
        session = await getServerSession(authOptions)
        if (!session?.user) {
          logger.warn('Unauthorized request', { path })
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          )
        }
        userId = (session.user as any).id
      }

      // Execute handler
      const response = await handler({
        request,
        session,
        userId,
        params,
      })

      // Log successful request
      const duration = Date.now() - startTime
      logger.api(request.method, path, response.status, duration)

      return response
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      logger.error(`API Error: ${path}`, error, {
        method: request.method,
        duration,
      })

      // Return appropriate error response
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.status }
        )
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Common API errors
export const Errors = {
  unauthorized: () => new ApiError('Unauthorized', 401, 'UNAUTHORIZED'),
  forbidden: () => new ApiError('Forbidden', 403, 'FORBIDDEN'),
  notFound: (resource = 'Resource') => new ApiError(`${resource} not found`, 404, 'NOT_FOUND'),
  badRequest: (message = 'Bad request') => new ApiError(message, 400, 'BAD_REQUEST'),
  conflict: (message = 'Conflict') => new ApiError(message, 409, 'CONFLICT'),
  tooManyRequests: () => new ApiError('Too many requests', 429, 'RATE_LIMITED'),
  internal: (message = 'Internal server error') => new ApiError(message, 500, 'INTERNAL_ERROR'),
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    throw Errors.badRequest('Invalid request body')
  }
}

/**
 * Parse query parameters
 */
export function parseQuery(request: Request): URLSearchParams {
  const url = new URL(request.url)
  return url.searchParams
}

/**
 * Paginate query parameters
 */
export function getPagination(
  request: Request,
  defaults = { page: 1, limit: 20, maxLimit: 100 }
) {
  const params = parseQuery(request)

  let page = parseInt(params.get('page') || String(defaults.page))
  let limit = parseInt(params.get('limit') || String(defaults.limit))

  // Validate
  if (isNaN(page) || page < 1) page = defaults.page
  if (isNaN(limit) || limit < 1) limit = defaults.limit
  if (limit > defaults.maxLimit) limit = defaults.maxLimit

  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  })
}
