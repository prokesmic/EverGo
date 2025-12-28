import { prisma } from "@/lib/db"

export type SportItem = {
  id: string
  name: string
  icon: string
  category: string
}

/**
 * Fetches all available sports in the system.
 */
export async function getAllSports(): Promise<SportItem[]> {
  const sports = await prisma.sport.findMany({
    select: {
      id: true,
      name: true,
      icon: true,
      category: true,
    },
    orderBy: { name: "asc" },
  })

  return sports
}

/**
 * Get a single sport by ID.
 */
export async function getSportById(sportId: string): Promise<SportItem | null> {
  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
    select: {
      id: true,
      name: true,
      icon: true,
      category: true,
    },
  })

  return sport
}

/**
 * Get sports that the user hasn't added yet.
 */
export async function getAvailableSportsForUser(userId: string): Promise<SportItem[]> {
  const userSportIds = await prisma.userSport.findMany({
    where: { userId },
    select: { sportId: true },
  })

  const userSportIdSet = new Set(userSportIds.map((us) => us.sportId))

  const allSports = await getAllSports()
  return allSports.filter((sport) => !userSportIdSet.has(sport.id))
}
