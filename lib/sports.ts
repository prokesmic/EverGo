import { prisma } from "@/lib/db"

/**
 * Normalizes a sport name or slug to a consistent lowercase hyphenated format.
 * Used for hero image lookups, category matching, and URL routing.
 *
 * Examples:
 * - "Running" → "running"
 * - "Trail Running" → "trail-running"
 * - "Cross_Country_Skiing" → "cross-country-skiing"
 * - "Open Water Swimming" → "open-water-swimming"
 */
export function normalizeSportSlug(input?: string | null): string | null {
  if (!input) return null
  return input
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-")
    .replace(/-+/g, "-")
}

/**
 * Converts a sport name to a URL-friendly slug.
 * Similar to normalizeSportSlug but always returns a string.
 */
export function sportToSlug(name: string): string {
  return normalizeSportSlug(name) || "unknown"
}

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
