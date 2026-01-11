import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimitMiddleware, RATE_LIMITS, getClientIp } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import { searchQuerySchema, validateQuery, type SearchResultItem } from "@/schemas/api"

export async function GET(req: Request) {
  // Apply search-specific rate limiting
  const rateLimitResponse = rateLimitMiddleware(req, RATE_LIMITS.search)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(req.url)

    // Validate query params with Zod schema
    const validation = validateQuery(searchQuerySchema, searchParams)
    if (!validation.success) {
      return NextResponse.json({ results: [], error: validation.error }, { status: 400 })
    }

    const { q: query, type, limit } = validation.data

    const results: SearchResultItem[] = []

    // Search Users
    if (!type || type === "all" || type === "users") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { displayName: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          city: true,
        },
        take: type === "users" ? limit : 5,
      })

      results.push(
        ...users.map((user): SearchResultItem => ({
          type: "user",
          id: user.username ?? user.id, // Privacy: prefer username
          title: user.displayName ?? user.username ?? "User",
          subtitle: user.city ? `@${user.username} • ${user.city}` : `@${user.username}`,
          image: user.avatarUrl,
        }))
      )
    }

    // Search Teams
    if (!type || type === "all" || type === "teams") {
      const teams = await prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          sport: true,
        },
        take: type === "teams" ? limit : 5,
      })

      results.push(
        ...teams.map((team): SearchResultItem => ({
          type: "team",
          id: team.slug,
          title: team.name,
          subtitle: `${team.memberCount} members • ${team.sport.name}`,
          image: team.logoUrl,
          icon: team.sport.icon ?? undefined,
        }))
      )
    }

    // Search Challenges
    if (!type || type === "all" || type === "challenges") {
      const challenges = await prisma.challenge.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        include: {
          sport: true,
          _count: { select: { participants: true } },
        },
        take: type === "challenges" ? limit : 5,
      })

      results.push(
        ...challenges.map((challenge): SearchResultItem => ({
          type: "challenge",
          id: challenge.id,
          title: challenge.title,
          subtitle: `${challenge._count.participants} participants${challenge.sport ? ` • ${challenge.sport.name}` : ""}`,
          image: challenge.imageUrl,
          icon: challenge.sport?.icon ?? "🏆",
        }))
      )
    }

    return NextResponse.json({ results })
  } catch (error) {
    logger.error("Search error", error, { ip: getClientIp(req) })
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
