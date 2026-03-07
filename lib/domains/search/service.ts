import { prisma } from "@/lib/db"
import type { SearchResultItem } from "@/schemas/api"
import { buildDomainEvent, enqueueDomainEvent } from "@/lib/events/publisher"

export type SearchType = "all" | "users" | "teams" | "challenges"

interface SearchOptions {
  query: string
  type: SearchType
  limit: number
  userId?: string
}

export async function searchDomain(options: SearchOptions): Promise<SearchResultItem[]> {
  const provider = process.env.SEARCH_PROVIDER ?? "db"
  let results: SearchResultItem[] = []

  if (provider === "db") {
    results = await searchWithDatabase(options)
  } else {
    // Placeholder for external provider (Typesense/OpenSearch)
    results = await searchWithDatabase(options)
  }

  const event = buildDomainEvent({
    name: "search.queried",
    aggregateId: `search:${options.query}`,
    aggregateType: "search",
    userId: options.userId,
    payload: {
      query: options.query,
      searchType: options.type,
      resultCount: results.length,
      provider,
    },
  })
  await enqueueDomainEvent(event).catch(() => {
    // Analytics event failure should never block search results.
  })

  return results
}

async function searchWithDatabase({
  query,
  type,
  limit,
}: SearchOptions): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = []

  if (type === "all" || type === "users") {
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
      ...users.map((user) => {
        const handle = user.username ? `@${user.username}` : "Athlete"
        return {
          type: "user" as const,
          id: user.username ?? user.id,
          title: user.displayName ?? user.username ?? "User",
          subtitle: user.city ? `${handle} • ${user.city}` : handle,
          image: user.avatarUrl,
        }
      })
    )
  }

  if (type === "all" || type === "teams") {
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { sport: true },
      take: type === "teams" ? limit : 5,
    })

    results.push(
      ...teams.map((team) => ({
        type: "team" as const,
        id: team.slug,
        title: team.name,
        subtitle: `${team.memberCount} members • ${team.sport.name}`,
        image: team.logoUrl,
        icon: team.sport.icon ?? undefined,
      }))
    )
  }

  if (type === "all" || type === "challenges") {
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
        type: "challenge" as const,
        id: challenge.id,
        title: challenge.title,
        subtitle: `${challenge._count.participants} participants${challenge.sport ? ` • ${challenge.sport.name}` : ""}`,
        image: challenge.imageUrl,
        icon: challenge.sport?.icon ?? "🏆",
      }))
    )
  }

  return results
}
