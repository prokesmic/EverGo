import { prisma } from "@/lib/db"
import type { SearchResultItem } from "@/schemas/api"
import { buildDomainEvent, enqueueDomainEvent } from "@/lib/events/publisher"

export type SearchType = "all" | "users" | "teams" | "challenges"
export type SearchSort = "relevance" | "recent" | "popular"

interface SearchOptions {
  query: string
  type: SearchType
  limit: number
  city?: string
  sport?: string
  sort: SearchSort
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
      city: options.city ?? null,
      sport: options.sport ?? null,
      sort: options.sort,
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
  city,
  sport,
  sort,
}: SearchOptions): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = []

  if (type === "all" || type === "users") {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(sport
          ? {
              sports: {
                some: {
                  status: "ACTIVE",
                  sport: { slug: { contains: sport, mode: "insensitive" } },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        createdAt: true,
        _count: {
          select: {
            activities: true,
            followers: true,
          },
        },
      },
      take: type === "users" ? Math.max(limit * 3, 30) : 10,
    })

    const sortedUsers = sortUsers(users, sort, query).slice(0, type === "users" ? limit : 5)

    results.push(
      ...sortedUsers.map((user) => {
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
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(sport ? { sport: { slug: { contains: sport, mode: "insensitive" } } } : {}),
      },
      include: {
        sport: true,
      },
      take: type === "teams" ? Math.max(limit * 3, 30) : 10,
    })

    const sortedTeams = sortTeams(teams, sort, query).slice(0, type === "teams" ? limit : 5)

    results.push(
      ...sortedTeams.map((team) => ({
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
        ...(sport ? { sport: { slug: { contains: sport, mode: "insensitive" } } } : {}),
      },
      include: {
        sport: true,
        _count: { select: { participants: true } },
      },
      take: type === "challenges" ? Math.max(limit * 3, 30) : 10,
    })

    const sortedChallenges = sortChallenges(challenges, sort, query).slice(
      0,
      type === "challenges" ? limit : 5
    )

    results.push(
      ...sortedChallenges.map((challenge) => ({
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

function textRelevanceScore(query: string, ...fields: Array<string | null | undefined>): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0

  let score = 0
  for (const field of fields) {
    if (!field) continue
    const value = field.toLowerCase()
    if (value === q) score += 120
    else if (value.startsWith(q)) score += 70
    else if (value.includes(q)) score += 35
  }
  return score
}

function sortUsers<
  T extends {
    displayName: string | null
    username: string | null
    city: string | null
    createdAt: Date
    _count: { activities: number; followers: number }
  },
>(users: T[], sort: SearchSort, query: string): T[] {
  return [...users].sort((a, b) => {
    if (sort === "recent") {
      return b.createdAt.getTime() - a.createdAt.getTime()
    }
    if (sort === "popular") {
      const aScore = a._count.activities + a._count.followers * 2
      const bScore = b._count.activities + b._count.followers * 2
      return bScore - aScore
    }

    const aScore = textRelevanceScore(query, a.displayName, a.username, a.city)
    const bScore = textRelevanceScore(query, b.displayName, b.username, b.city)
    return bScore - aScore
  })
}

function sortTeams<
  T extends {
    name: string
    description: string | null
    createdAt: Date
    totalActivities: number
    memberCount: number
  },
>(teams: T[], sort: SearchSort, query: string): T[] {
  return [...teams].sort((a, b) => {
    if (sort === "recent") {
      return b.createdAt.getTime() - a.createdAt.getTime()
    }
    if (sort === "popular") {
      const aScore = a.totalActivities + a.memberCount * 2
      const bScore = b.totalActivities + b.memberCount * 2
      return bScore - aScore
    }

    return (
      textRelevanceScore(query, b.name, b.description) -
      textRelevanceScore(query, a.name, a.description)
    )
  })
}

function sortChallenges<
  T extends {
    title: string
    description: string
    createdAt: Date
    _count: { participants: number }
  },
>(challenges: T[], sort: SearchSort, query: string): T[] {
  return [...challenges].sort((a, b) => {
    if (sort === "recent") {
      return b.createdAt.getTime() - a.createdAt.getTime()
    }
    if (sort === "popular") {
      return b._count.participants - a._count.participants
    }

    return (
      textRelevanceScore(query, b.title, b.description) -
      textRelevanceScore(query, a.title, a.description)
    )
  })
}
