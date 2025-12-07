import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimitMiddleware, RATE_LIMITS, getClientIp } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export async function GET(req: Request) {
  // Apply search-specific rate limiting
  const rateLimitResponse = rateLimitMiddleware(req, RATE_LIMITS.search)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") // users, teams, challenges, or all
    const limit = parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: any[] = []

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
        ...users.map((user) => ({
          type: "user",
          id: user.username,
          title: user.displayName,
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
        ...teams.map((team) => ({
          type: "team",
          id: team.slug,
          title: team.name,
          subtitle: `${team.memberCount} members • ${team.sport.name}`,
          image: team.logoUrl,
          icon: team.sport.icon,
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
        ...challenges.map((challenge) => ({
          type: "challenge",
          id: challenge.id,
          title: challenge.title,
          subtitle: `${challenge._count.participants} participants${challenge.sport ? ` • ${challenge.sport.name}` : ""}`,
          image: challenge.imageUrl,
          icon: challenge.sport?.icon || "🏆",
        }))
      )
    }

    return NextResponse.json({ results })
  } catch (error) {
    logger.error("Search error", error, { ip: getClientIp(req) })
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
