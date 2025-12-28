import { prisma } from "@/lib/db"

export type DefaultSportForActivity = {
  sportId: string
  sportName: string
  disciplineId: string | null
  disciplineName: string | null
}

/**
 * Gets the default sport and discipline for creating a new activity.
 * Returns the user's primary sport (priority = 0) if available,
 * otherwise returns the first active sport.
 */
export async function getDefaultSportForUser(userId: string): Promise<DefaultSportForActivity | null> {
  // First try to get the primary sport (priority = 0)
  const primarySport = await prisma.userSport.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      priority: 0,
    },
    include: {
      sport: {
        include: {
          disciplines: {
            take: 1,
            orderBy: { name: "asc" },
          },
        },
      },
    },
  })

  if (primarySport) {
    return {
      sportId: primarySport.sport.id,
      sportName: primarySport.sport.name,
      disciplineId: primarySport.sport.disciplines[0]?.id ?? null,
      disciplineName: primarySport.sport.disciplines[0]?.name ?? null,
    }
  }

  // Fallback to first active sport
  const firstActiveSport = await prisma.userSport.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    orderBy: { priority: "asc" },
    include: {
      sport: {
        include: {
          disciplines: {
            take: 1,
            orderBy: { name: "asc" },
          },
        },
      },
    },
  })

  if (firstActiveSport) {
    return {
      sportId: firstActiveSport.sport.id,
      sportName: firstActiveSport.sport.name,
      disciplineId: firstActiveSport.sport.disciplines[0]?.id ?? null,
      disciplineName: firstActiveSport.sport.disciplines[0]?.name ?? null,
    }
  }

  return null
}

/**
 * Get disciplines for a specific sport.
 */
export async function getDisciplinesForSport(sportId: string) {
  return prisma.discipline.findMany({
    where: { sportId },
    select: {
      id: true,
      name: true,
      measurementType: true,
    },
    orderBy: { name: "asc" },
  })
}
