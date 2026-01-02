import { prisma } from "@/lib/db"

export type ScopeInput =
  | { scope: "GLOBAL" }
  | { scope: "COUNTRY" }
  | { scope: "CITY" }
  | { scope: "TEAM"; teamId: string }

export type ScopeResult = {
  userIds: string[] | null // null means "all users" (no filter)
  whereUser: Record<string, unknown>
  scopeKey: string
  scopeLabel: string
}

/**
 * Resolve scope filter to Prisma where clause
 * Returns userIds for explicit filtering or whereUser for Prisma queries
 */
export async function resolveScopeWhere(
  userId: string,
  input: ScopeInput
): Promise<ScopeResult> {
  if (input.scope === "GLOBAL") {
    return {
      userIds: null,
      whereUser: {},
      scopeKey: "GLOBAL",
      scopeLabel: "Global",
    }
  }

  // Get user's location for COUNTRY/CITY scopes (using normalized fields)
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { countryCode: true, countryName: true, cityId: true, cityName: true },
  })

  if (!me) {
    throw new Error("User not found")
  }

  if (input.scope === "COUNTRY") {
    if (!me.countryCode) {
      return {
        userIds: [],
        whereUser: { id: { in: [] } },
        scopeKey: "COUNTRY",
        scopeLabel: "Country",
      }
    }
    return {
      userIds: null,
      whereUser: { countryCode: me.countryCode },
      scopeKey: "COUNTRY",
      scopeLabel: me.countryName || me.countryCode,
    }
  }

  if (input.scope === "CITY") {
    if (!me.cityId) {
      return {
        userIds: [],
        whereUser: { id: { in: [] } },
        scopeKey: "CITY",
        scopeLabel: "City",
      }
    }
    return {
      userIds: null,
      whereUser: { cityId: me.cityId },
      scopeKey: "CITY",
      scopeLabel: me.cityName || "City",
    }
  }

  // TEAM scope
  const team = await prisma.team.findUnique({
    where: { id: input.teamId },
    select: { name: true },
  })

  const members = await prisma.teamMember.findMany({
    where: { teamId: input.teamId },
    select: { userId: true },
  })

  const ids = members.map((m) => m.userId)

  return {
    userIds: ids,
    whereUser: { id: { in: ids } },
    scopeKey: `TEAM:${input.teamId}`,
    scopeLabel: team?.name ?? "Team",
  }
}

/**
 * Get user's teams for team scope selection
 */
export async function getUserTeams(userId: string) {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
    },
  })

  return memberships.map((m) => m.team)
}

/**
 * Check if user has location set (for showing country/city scopes)
 */
export async function getUserLocationInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { countryCode: true, countryName: true, cityId: true, cityName: true },
  })

  return {
    hasCountry: !!user?.countryCode,
    hasCity: !!user?.cityId,
    country: user?.countryName ?? null,
    city: user?.cityName ?? null,
    countryCode: user?.countryCode ?? null,
    cityId: user?.cityId ?? null,
  }
}
