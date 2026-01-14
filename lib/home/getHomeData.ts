/**
 * Home Dashboard Data Fetcher (V11)
 *
 * Unified data fetching for the home dashboard.
 * Fetches all required data in parallel for optimal performance.
 *
 * Includes:
 * - User profile and stats
 * - Active competitions (rivalries, gauntlets)
 * - Season progress
 * - Recent moments
 * - Verification status
 * - Recovery mode status
 * - Consistency league standing
 */

import { prisma } from "@/lib/db"
import { startOfWeek, endOfWeek, subDays } from "date-fns"
import { getVerificationLadderStatus } from "@/lib/verification/ladder"
import { getRecoveryModeStatus } from "@/lib/competition/recoveryMode"
import { computeConsistencyScore } from "@/lib/metrics/consistencyScore"
import { getUserMoments } from "@/lib/moments/detect"
import type { VerificationTier, ConsistencyTier, UserPersona } from "@prisma/client"

// =============================================================================
// TYPES
// =============================================================================

export interface HomeData {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    coverPhotoUrl: string | null
    bio: string | null
    persona: UserPersona | null
    createdAt: Date
  }

  location: {
    city: string | null
    country: string | null
  }

  sport: {
    name: string
    slug: string
    category: string | null
  } | null

  stats: {
    sportIndex: number
    sportIndexDelta: number
    multisportIndex: number
    globalRank: number | null
    currentStreak: number
    longestStreak: number
    totalActivities: number
  }

  verification: {
    tier: VerificationTier
    progressToNext: number
    canUpgrade: boolean
  }

  consistency: {
    score: number
    tier: ConsistencyTier
    perfectWeeks: number
  }

  recovery: {
    isActive: boolean
    endsAt: Date | null
    usesRemaining: number
  }

  thisWeek: {
    activities: number
    power: number
    activeMinutes: number
    distance: number
  }

  competitions: {
    activeRivalries: number
    activeGauntlets: number
    seasonRank: number | null
  }

  moments: Array<{
    id: string
    type: string
    title: string
    createdAt: Date
  }>

  social: {
    followersCount: number
    followingCount: number
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Fetch all home dashboard data for a user
 */
export async function getHomeData(userId: string): Promise<HomeData> {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  // Parallel fetch all data
  const [
    user,
    userStats,
    userStreak,
    primarySport,
    weekActivities,
    activeRivalries,
    activeGauntlets,
    verificationStatus,
    recoveryStatus,
    consistencyResult,
    moments,
    currentSeason,
  ] = await Promise.all([
    // User profile
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        bio: true,
        city: true,
        country: true,
        persona: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    }),

    // User stats
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        sportIndex: true,
        sportIndexDelta7d: true,
        multisportIndex: true,
        globalRank: true,
        totalActivities: true,
        verificationTier: true,
      },
    }),

    // User streak
    prisma.userStreak.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        consistencyScore: true,
        consistencyTier: true,
        perfectWeeks: true,
      },
    }),

    // Primary sport
    prisma.userSport.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { priority: "asc" },
      include: { sport: { select: { name: true, slug: true, category: true } } },
    }),

    // This week's activities
    prisma.activity.aggregate({
      where: {
        userId,
        activityDate: { gte: weekStart, lte: weekEnd },
      },
      _count: { id: true },
      _sum: {
        power: true,
        durationSeconds: true,
        distanceMeters: true,
      },
    }),

    // Active rivalries count
    prisma.rivalryParticipant.count({
      where: {
        userId,
        rivalry: { status: "ACTIVE" },
      },
    }),

    // Active gauntlets count
    prisma.gauntlet.count({
      where: {
        OR: [
          { challengerId: userId, status: "ACTIVE" },
          { opponentId: userId, status: "ACTIVE" },
        ],
      },
    }),

    // Verification status
    getVerificationLadderStatus(userId),

    // Recovery mode status
    getRecoveryModeStatus(userId),

    // Consistency score
    computeConsistencyScore(userId).catch(() => null),

    // Recent moments
    getUserMoments(userId, { limit: 5 }),

    // Current season rank
    getCurrentSeasonRank(userId),
  ])

  if (!user) {
    throw new Error("User not found")
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      bio: user.bio,
      persona: user.persona,
      createdAt: user.createdAt,
    },

    location: {
      city: user.city,
      country: user.country,
    },

    sport: primarySport?.sport
      ? {
          name: primarySport.sport.name,
          slug: primarySport.sport.slug,
          category: primarySport.sport.category,
        }
      : null,

    stats: {
      sportIndex: userStats?.sportIndex ?? 0,
      sportIndexDelta: userStats?.sportIndexDelta7d ?? 0,
      multisportIndex: userStats?.multisportIndex ?? 0,
      globalRank: userStats?.globalRank ?? null,
      currentStreak: userStreak?.currentStreak ?? 0,
      longestStreak: userStreak?.longestStreak ?? 0,
      totalActivities: userStats?.totalActivities ?? 0,
    },

    verification: {
      tier: userStats?.verificationTier ?? "BRONZE",
      progressToNext: verificationStatus.progressToNext,
      canUpgrade: verificationStatus.canUpgrade,
    },

    consistency: {
      score: consistencyResult?.score ?? userStreak?.consistencyScore ?? 0,
      tier: consistencyResult?.tier ?? userStreak?.consistencyTier ?? "STARTER",
      perfectWeeks: userStreak?.perfectWeeks ?? 0,
    },

    recovery: {
      isActive: recoveryStatus.isActive,
      endsAt: recoveryStatus.endsAt,
      usesRemaining: recoveryStatus.usesRemaining,
    },

    thisWeek: {
      activities: weekActivities._count.id,
      power: Math.round(weekActivities._sum.power ?? 0),
      activeMinutes: Math.round((weekActivities._sum.durationSeconds ?? 0) / 60),
      distance: Math.round((weekActivities._sum.distanceMeters ?? 0) / 1000),
    },

    competitions: {
      activeRivalries,
      activeGauntlets,
      seasonRank: currentSeason,
    },

    moments: moments.map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      createdAt: m.createdAt,
    })),

    social: {
      followersCount: user._count.followers,
      followingCount: user._count.following,
    },
  }
}

// =============================================================================
// HELPERS
// =============================================================================

async function getCurrentSeasonRank(userId: string): Promise<number | null> {
  const now = new Date()

  const currentSeason = await prisma.season.findFirst({
    where: {
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: { id: true },
  })

  if (!currentSeason) return null

  const participant = await prisma.seasonParticipant.findFirst({
    where: {
      seasonId: currentSeason.id,
      userId,
    },
    select: { rank: true },
  })

  return participant?.rank ?? null
}

// =============================================================================
// PERSONA-BASED EMPHASIS
// =============================================================================

/**
 * Get emphasized sections based on user persona
 */
export function getPersonaEmphasis(persona: UserPersona | null): {
  primarySections: string[]
  secondarySections: string[]
} {
  switch (persona) {
    case "COMPETITOR":
      return {
        primarySections: ["rankings", "rivalries", "gauntlets", "season"],
        secondarySections: ["feed", "moments", "streak"],
      }
    case "TRACKER":
      return {
        primarySections: ["stats", "streak", "moments", "progress"],
        secondarySections: ["feed", "rankings", "rivalries"],
      }
    case "SOCIAL":
      return {
        primarySections: ["feed", "moments", "friends", "teams"],
        secondarySections: ["rankings", "streak", "rivalries"],
      }
    default:
      // Balanced default
      return {
        primarySections: ["stats", "rivalries", "feed", "moments"],
        secondarySections: ["rankings", "streak", "season"],
      }
  }
}
