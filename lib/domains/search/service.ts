import { prisma } from "@/lib/db"
import type { SearchResultItem } from "@/schemas/api"
import { buildDomainEvent, enqueueDomainEvent } from "@/lib/events/publisher"
import { Prisma } from "@prisma/client"

export type SearchType = "all" | "users" | "teams" | "challenges" | "activities"
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
  userId,
}: SearchOptions): Promise<SearchResultItem[]> {
  const results: SearchResultItem[] = []
  const insensitive = Prisma.QueryMode.insensitive

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

  if (type === "all" || type === "activities") {
    const visibilityFilter = userId
      ? {
          OR: [{ visibility: "PUBLIC" }, { userId }],
        }
      : {
          visibility: "PUBLIC",
        }

    const activities = await prisma.activity.findMany({
      where: {
        AND: [
          visibilityFilter,
          {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          },
          ...(city
            ? [{ user: { city: { contains: city, mode: insensitive } } }]
            : []),
          ...(sport
            ? [
                {
                  OR: [
                    { sport: { slug: { contains: sport, mode: insensitive } } },
                    { discipline: { sport: { slug: { contains: sport, mode: insensitive } } } },
                  ],
                },
              ]
            : []),
        ],
      },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            city: true,
          },
        },
        sport: {
          select: {
            name: true,
            slug: true,
            icon: true,
          },
        },
        discipline: {
          include: {
            sport: {
              select: {
                name: true,
                slug: true,
                icon: true,
              },
            },
          },
        },
        post: {
          select: {
            likesCount: true,
            commentsCount: true,
          },
        },
      },
      take: type === "activities" ? Math.max(limit * 3, 30) : 12,
    })

    const sortedActivities = sortActivities(activities, sort, query).slice(
      0,
      type === "activities" ? limit : 5
    )

    results.push(
      ...sortedActivities.map((activity) => {
        const ownerHandle = activity.user.username
          ? `@${activity.user.username}`
          : (activity.user.displayName ?? "Athlete")

        const resolvedSport =
          activity.sport ?? activity.discipline?.sport ?? null
        const distanceKm =
          typeof activity.distanceMeters === "number"
            ? activity.distanceMeters / 1000
            : null
        const durationMinutes =
          typeof activity.durationSeconds === "number"
            ? Math.round(activity.durationSeconds / 60)
            : null

        const pieces = [ownerHandle]
        if (resolvedSport?.name) pieces.push(resolvedSport.name)
        if (distanceKm !== null) pieces.push(`${distanceKm.toFixed(1)} km`)
        if (durationMinutes !== null) pieces.push(`${durationMinutes} min`)

        return {
          type: "activity" as const,
          id: activity.id,
          title: activity.title || "Activity",
          subtitle: pieces.join(" • "),
          image: activity.mapImageUrl ?? firstPhotoFromRaw(activity.photos),
          icon: resolvedSport?.icon ?? "🏃",
        }
      })
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

function sortActivities<
  T extends {
    id: string
    title: string
    description: string | null
    createdAt: Date
    activityDate: Date
    distanceMeters: number | null
    durationSeconds: number | null
    mapImageUrl: string | null
    photos: string
    post: { likesCount: number; commentsCount: number } | null
    user: { displayName: string | null; username: string | null; city: string | null }
    sport?: { name?: string | null; slug?: string | null; icon?: string | null } | null
    discipline?: { sport?: { name?: string | null; slug?: string | null; icon?: string | null } | null } | null
  },
>(activities: T[], sort: SearchSort, query: string): T[] {
  return [...activities].sort((a, b) => {
    if (sort === "recent") {
      return b.activityDate.getTime() - a.activityDate.getTime()
    }
    if (sort === "popular") {
      const aScore =
        (a.post?.likesCount ?? 0) * 2 +
        (a.post?.commentsCount ?? 0) * 3 +
        Math.round((a.distanceMeters ?? 0) / 1000) +
        Math.round((a.durationSeconds ?? 0) / 600)
      const bScore =
        (b.post?.likesCount ?? 0) * 2 +
        (b.post?.commentsCount ?? 0) * 3 +
        Math.round((b.distanceMeters ?? 0) / 1000) +
        Math.round((b.durationSeconds ?? 0) / 600)
      return bScore - aScore
    }

    const aSportName = a.sport?.name ?? a.discipline?.sport?.name ?? null
    const bSportName = b.sport?.name ?? b.discipline?.sport?.name ?? null

    const aScore = textRelevanceScore(
      query,
      a.title,
      a.description,
      aSportName,
      a.user.displayName,
      a.user.username,
      a.user.city
    )
    const bScore = textRelevanceScore(
      query,
      b.title,
      b.description,
      bSportName,
      b.user.displayName,
      b.user.username,
      b.user.city
    )
    return bScore - aScore
  })
}

function firstPhotoFromRaw(rawPhotos: string): string | null {
  try {
    const parsed = JSON.parse(rawPhotos)
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed[0]
    }
  } catch {
    // no-op
  }
  return null
}
