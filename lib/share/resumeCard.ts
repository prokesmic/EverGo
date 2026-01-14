/**
 * Sport Résumé Card Generator (V11)
 *
 * Creates shareable sport profile cards with:
 * - User's primary sport and vanity metric
 * - Verification badge
 * - Key stats (streak, activities, rank)
 * - Recent achievements
 */

import { prisma } from "@/lib/db"
import type { VerificationTier, ConsistencyTier } from "@prisma/client"
import { getTierDisplayInfo } from "@/lib/verification/ladder"
import { getSportConfig } from "@/lib/sports/config"

// =============================================================================
// TYPES
// =============================================================================

export interface ResumeCardData {
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    coverPhotoUrl: string | null
    verificationTier: VerificationTier
    consistencyTier: ConsistencyTier
  }
  sport: {
    name: string
    slug: string
    primaryMetric: {
      key: string
      label: string
      value: string
      unit?: string
    }
  } | null
  stats: {
    currentStreak: number
    totalActivities: number
    globalRank: number | null
    sportIndex: number
    multisportIndex: number
  }
  achievements: {
    type: string
    title: string
    date: Date
  }[]
  generatedAt: Date
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

/**
 * Generate resume card data for a user
 */
export async function generateResumeCardData(userId: string): Promise<ResumeCardData> {
  // Fetch all required data in parallel
  const [user, userStats, userStreak, primarySport, recentMoments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        coverPhotoUrl: true,
      },
    }),
    prisma.userStats.findUnique({
      where: { userId },
      select: {
        sportIndex: true,
        multisportIndex: true,
        globalRank: true,
        totalActivities: true,
        verificationTier: true,
      },
    }),
    prisma.userStreak.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        consistencyTier: true,
      },
    }),
    prisma.userSport.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { priority: "asc" },
      include: { sport: true },
    }),
    prisma.moment.findMany({
      where: { userId, dismissed: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        type: true,
        title: true,
        createdAt: true,
      },
    }),
  ])

  if (!user) {
    throw new Error("User not found")
  }

  // Get sport-specific data
  let sportData: ResumeCardData["sport"] = null
  if (primarySport?.sport) {
    const sportConfig = getSportConfig(primarySport.sport.slug)
    const primaryMetricKey = sportConfig.primaryMetric

    // Fetch the user's best value for the primary metric
    const metricValue = await fetchPrimaryMetricValue(userId, primarySport.sport.slug, primaryMetricKey)

    sportData = {
      name: primarySport.sport.name,
      slug: primarySport.sport.slug,
      primaryMetric: {
        key: primaryMetricKey,
        label: formatMetricLabel(primaryMetricKey),
        value: metricValue.formatted,
        unit: metricValue.unit,
      },
    }
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      verificationTier: userStats?.verificationTier ?? "BRONZE",
      consistencyTier: userStreak?.consistencyTier ?? "STARTER",
    },
    sport: sportData,
    stats: {
      currentStreak: userStreak?.currentStreak ?? 0,
      totalActivities: userStats?.totalActivities ?? 0,
      globalRank: userStats?.globalRank ?? null,
      sportIndex: userStats?.sportIndex ?? 0,
      multisportIndex: userStats?.multisportIndex ?? 0,
    },
    achievements: recentMoments.map((m) => ({
      type: m.type,
      title: m.title,
      date: m.createdAt,
    })),
    generatedAt: new Date(),
  }
}

// =============================================================================
// HELPERS
// =============================================================================

async function fetchPrimaryMetricValue(
  userId: string,
  sportSlug: string,
  metricKey: string
): Promise<{ formatted: string; unit?: string }> {
  // This is a simplified implementation - in production, you'd want to
  // calculate the actual best value for each metric type

  switch (metricKey) {
    case "max_jump_height": {
      const activity = await prisma.activity.findFirst({
        where: { userId, discipline: { sport: { slug: sportSlug } } },
        orderBy: { maxJumpHeightMeters: "desc" },
        select: { maxJumpHeightMeters: true },
      })
      const value = activity?.maxJumpHeightMeters ?? 0
      return { formatted: value.toFixed(1), unit: "m" }
    }

    case "pace_5k": {
      const activity = await prisma.activity.findFirst({
        where: { userId, discipline: { sport: { slug: sportSlug } } },
        orderBy: { best5kPaceSeconds: "asc" },
        select: { best5kPaceSeconds: true },
      })
      if (activity?.best5kPaceSeconds) {
        const mins = Math.floor(activity.best5kPaceSeconds / 60)
        const secs = Math.round(activity.best5kPaceSeconds % 60)
        return { formatted: `${mins}:${secs.toString().padStart(2, "0")}`, unit: "/km" }
      }
      return { formatted: "--:--", unit: "/km" }
    }

    case "vertical_descent": {
      const agg = await prisma.activity.aggregate({
        where: { userId, discipline: { sport: { slug: sportSlug } } },
        _sum: { verticalDescentMeters: true },
      })
      const total = agg._sum.verticalDescentMeters ?? 0
      if (total >= 1000) {
        return { formatted: (total / 1000).toFixed(1), unit: "km" }
      }
      return { formatted: Math.round(total).toString(), unit: "m" }
    }

    default: {
      // Default: show total activities
      const count = await prisma.activity.count({
        where: { userId, discipline: { sport: { slug: sportSlug } } },
      })
      return { formatted: count.toString(), unit: "activities" }
    }
  }
}

function formatMetricLabel(key: string): string {
  const labels: Record<string, string> = {
    max_jump_height: "Max Jump",
    pace_5k: "5K Pace",
    vertical_descent: "Vertical",
    power_20min_wkg: "Power",
    sessions: "Sessions",
    distance: "Distance",
  }
  return labels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// =============================================================================
// SHARE URL GENERATION
// =============================================================================

/**
 * Generate a shareable URL for the resume card
 */
export function getResumeCardShareUrl(username: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evergo.app"
  return `${baseUrl}/share/${username}`
}

/**
 * Generate OG image URL for social sharing
 */
export function getResumeCardOgImageUrl(username: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://evergo.app"
  return `${baseUrl}/api/og/resume/${username}`
}
