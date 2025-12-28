import { prisma } from "@/lib/db"
import { UserSportStatus, SubscriptionStatus, SubscriptionPlan } from "@prisma/client"

export type MySport = {
  id: string
  sportId: string
  sportName: string
  sportIcon: string
  sportCategory: string
  status: UserSportStatus
  priority: number | null
  skillLevel: string | null
  startedAt: Date | null
}

export type MySportsData = {
  active: MySport[]
  paused: MySport[]
  primarySportId: string | null
}

/**
 * Fetches the user's sports, split into active and paused arrays.
 * Active sports are sorted by priority (0 is Primary).
 */
export async function getMySports(userId: string): Promise<MySportsData> {
  const userSports = await prisma.userSport.findMany({
    where: { userId },
    include: {
      sport: {
        select: {
          id: true,
          name: true,
          icon: true,
          category: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // ACTIVE comes before PAUSED alphabetically
      { priority: "asc" },
    ],
  })

  const active: MySport[] = []
  const paused: MySport[] = []
  let primarySportId: string | null = null

  for (const us of userSports) {
    const sport: MySport = {
      id: us.id,
      sportId: us.sport.id,
      sportName: us.sport.name,
      sportIcon: us.sport.icon,
      sportCategory: us.sport.category,
      status: us.status,
      priority: us.priority,
      skillLevel: us.skillLevel,
      startedAt: us.startedAt,
    }

    if (us.status === "ACTIVE") {
      active.push(sport)
      if (us.priority === 0) {
        primarySportId = us.sport.id
      }
    } else {
      paused.push(sport)
    }
  }

  return { active, paused, primarySportId }
}

/**
 * Check if user can add more active sports based on subscription tier.
 * Free users: max 3 active sports
 * Pro users: unlimited
 */
export async function canAddActiveSport(userId: string): Promise<{ allowed: boolean; reason?: string; isPro: boolean }> {
  const [subscription, activeCount] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, plan: true },
    }),
    prisma.userSport.count({
      where: { userId, status: "ACTIVE" },
    }),
  ])

  const isPro = subscription?.status === SubscriptionStatus.ACTIVE &&
    (subscription?.plan === SubscriptionPlan.PRO || subscription?.plan === SubscriptionPlan.PRO_ANNUAL)
  const FREE_TIER_LIMIT = 3

  if (isPro) {
    return { allowed: true, isPro: true }
  }

  if (activeCount >= FREE_TIER_LIMIT) {
    return {
      allowed: false,
      reason: `Free users can have up to ${FREE_TIER_LIMIT} active sports. Upgrade to Pro for unlimited.`,
      isPro: false,
    }
  }

  return { allowed: true, isPro: false }
}

/**
 * Get the count of active sports for a user.
 */
export async function getActiveSportCount(userId: string): Promise<number> {
  return prisma.userSport.count({
    where: { userId, status: "ACTIVE" },
  })
}
