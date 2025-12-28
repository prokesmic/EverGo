import { prisma } from "@/lib/db"
import { resolveHeroForSport, ResolvedHero } from "./heroResolver"

/**
 * Gets the hero image for the user's home page.
 * Priority:
 * 1. Primary sport (priority = 0, status = ACTIVE)
 * 2. Most recent activity's sport
 * 3. First sport in DB
 * 4. Fallback generic
 */
export async function getHomeHeroForUser(userId: string): Promise<ResolvedHero> {
  // Try primary sport first
  const primary = await prisma.userSport.findFirst({
    where: { userId, status: "ACTIVE", priority: 0 },
    include: { sport: true },
  })

  if (primary?.sport) {
    return resolveHeroForSport({
      sport: { id: primary.sport.id, name: primary.sport.name },
      userId,
    })
  }

  // Fall back to most recent activity (via discipline -> sport)
  const lastActivity = await prisma.activity.findFirst({
    where: { userId },
    orderBy: [{ activityDate: "desc" }],
    include: {
      discipline: {
        include: { sport: true },
      },
    },
  })

  if (lastActivity?.discipline?.sport) {
    return resolveHeroForSport({
      sport: {
        id: lastActivity.discipline.sport.id,
        name: lastActivity.discipline.sport.name,
      },
      userId,
    })
  }

  // Fall back to any sport
  const anySport = await prisma.sport.findFirst({ orderBy: [{ name: "asc" }] })
  if (anySport) {
    return resolveHeroForSport({
      sport: { id: anySport.id, name: anySport.name },
      userId,
    })
  }

  // Ultimate fallback
  return resolveHeroForSport({
    sport: { id: "generic", name: "Sport" },
    userId,
  })
}

/**
 * Gets the hero image for a specific sport (for sport pages, rankings, etc.)
 */
export async function getHeroForSport(
  sportId: string,
  userId?: string
): Promise<ResolvedHero> {
  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
    select: { id: true, name: true },
  })

  if (!sport) {
    return resolveHeroForSport({
      sport: { id: "generic", name: "Sport" },
      userId,
    })
  }

  return resolveHeroForSport({ sport, userId })
}
