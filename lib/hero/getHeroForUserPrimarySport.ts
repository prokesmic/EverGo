import { prisma } from "@/lib/db"
import { resolveHeroForSport, ResolvedHero } from "./heroResolver"

/**
 * Gets the hero image based on a user's primary sport.
 * Used for profile pages to show sport-specific hero banners.
 *
 * Priority:
 * 1. Primary sport (priority = 0, status = ACTIVE)
 * 2. Most recent activity's sport
 * 3. First sport in user's list
 * 4. Generic fallback
 */
export async function getHeroForUserPrimarySport(
  userId: string
): Promise<ResolvedHero> {
  // Try primary sport first (priority = 0, status = ACTIVE)
  const primarySport = await prisma.userSport.findFirst({
    where: { userId, status: "ACTIVE", priority: 0 },
    include: { sport: true },
  })

  if (primarySport?.sport) {
    return resolveHeroForSport({
      sport: { id: primarySport.sport.id, name: primarySport.sport.name },
      userId,
    })
  }

  // Fall back to most recent activity's sport
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

  // Fall back to any sport the user has
  const anySport = await prisma.userSport.findFirst({
    where: { userId },
    orderBy: [{ priority: "asc" }],
    include: { sport: true },
  })

  if (anySport?.sport) {
    return resolveHeroForSport({
      sport: { id: anySport.sport.id, name: anySport.sport.name },
      userId,
    })
  }

  // Ultimate fallback
  return resolveHeroForSport({
    sport: { id: "generic", name: "Sport" },
    userId,
  })
}
