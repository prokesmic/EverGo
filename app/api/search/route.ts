import { rateLimitMiddleware, RATE_LIMITS, getClientIp } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { searchQuerySchema, validateQuery } from "@/schemas/api"
import { searchDomain } from "@/lib/domains/search/service"
import { errorWithRequestId, getRequestIdFromRequest, jsonWithRequestId } from "@/lib/architecture/request"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req)

  // Apply search-specific rate limiting
  const rateLimitResponse = rateLimitMiddleware(req, RATE_LIMITS.search)
  if (rateLimitResponse) {
    rateLimitResponse.headers.set("x-request-id", requestId)
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(req.url)

    // Validate query params with Zod schema
    const validation = validateQuery(searchQuerySchema, searchParams)
    if (!validation.success) {
      return jsonWithRequestId(requestId, { results: [], error: validation.error }, { status: 400 })
    }

    const { q: query, type, limit, city, sport, sort } = validation.data
    const session = await getServerSession(authOptions)
    const userId = (session?.user as { id?: string } | undefined)?.id

    const results = await searchDomain({
      query,
      type: type || "all",
      limit,
      city,
      sport,
      sort,
      userId,
    })

    return jsonWithRequestId(requestId, { results })
  } catch (error) {
    logger.error("Search error", error, { ip: getClientIp(req), requestId })
    return errorWithRequestId(requestId, "Search failed", 500)
  }
}
