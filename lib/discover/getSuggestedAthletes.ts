import { prisma } from "@/lib/db"
import {
  scoreSuggestedAthlete,
  createScoreContext,
  updateScoreContext,
  type SuggestCandidate,
  type UserProfile,
} from "./scoreSuggestedAthlete"

export interface SuggestedAthlete {
  id: string
  username: string | null
  displayName: string
  avatarUrl: string | null
  city: string | null
  country: string | null
  primarySport: string | null
  mutualFollows: number
  totalActivities: number
  isFollowing: boolean
  score: number
  reason: string
}

type FilterMode = "near" | "sport" | "fof"

interface GetSuggestedAthletesOptions {
  limit?: number
  minScore?: number
  mode?: FilterMode
}

/**
 * Get suggested athletes for a user with unified scoring
 *
 * Process:
 * 1. Fetch candidate pool (exclude self, followed, blocked)
 * 2. Enrich with mutual counts and activity data
 * 3. Score each candidate with diversity tracking
 * 4. Return top N with explainability reasons
 */
export async function getSuggestedAthletes(
  userId: string,
  options: GetSuggestedAthletesOptions = {}
): Promise<SuggestedAthlete[]> {
  const { limit = 12, minScore = 10, mode } = options

  // 1. Get current user's profile for scoring context
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      city: true,
      country: true,
    },
  })

  if (!currentUser) {
    return []
  }

  // Get user's primary sport (priority = 0)
  const userPrimarySport = await prisma.userSport.findFirst({
    where: { userId, status: "ACTIVE", priority: 0 },
    include: { sport: { select: { slug: true, name: true } } },
  })

  // Get user's other active sports
  const userSports = await prisma.userSport.findMany({
    where: { userId, status: "ACTIVE" },
    include: { sport: { select: { slug: true } } },
  })

  const meProfile: UserProfile = {
    primarySport: userPrimarySport?.sport?.slug ?? null,
    sports: userSports.map(us => us.sport.slug),
    city: currentUser.city,
    country: currentUser.country,
    sportIndex: null,
  }

  // 2. Get users the current user is following (to exclude)
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const followingIds = new Set(following.map(f => f.followingId))

  // 3. Fetch candidate pool
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const candidates = await prisma.user.findMany({
    where: {
      id: { not: userId },
      privacyLevel: { not: "PRIVATE" },
    },
    take: 300,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      city: true,
      country: true,
      createdAt: true,
      _count: {
        select: {
          activities: true,
          personalRecords: true,
        },
      },
    },
  })

  // Filter out followed users
  const filteredCandidates = candidates.filter(c => !followingIds.has(c.id))

  // 4. Get primary sports for all candidates
  const candidateIds = filteredCandidates.map(c => c.id)

  const candidatePrimarySports = await prisma.userSport.findMany({
    where: {
      userId: { in: candidateIds },
      status: "ACTIVE",
      priority: 0,
    },
    include: { sport: { select: { slug: true, name: true } } },
  })

  const candidatePrimarySportMap = new Map(
    candidatePrimarySports.map(us => [us.userId, us.sport])
  )

  // 5. Calculate mutual follow counts efficiently
  // Get who the current user follows
  const myFollowing = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const myFollowingSet = new Set(myFollowing.map(f => f.followingId))

  // Get followers of each candidate who are also followed by me (mutuals)
  const mutualCounts: Record<string, number> = {}

  if (myFollowingSet.size > 0) {
    const candidateFollowers = await prisma.follow.findMany({
      where: {
        followingId: { in: candidateIds },
        followerId: { in: [...myFollowingSet] },
      },
      select: { followingId: true },
    })

    for (const cf of candidateFollowers) {
      mutualCounts[cf.followingId] = (mutualCounts[cf.followingId] ?? 0) + 1
    }
  }

  // 6. Get recent activity counts
  const activityCounts = await prisma.activity.groupBy({
    by: ["userId"],
    where: {
      userId: { in: candidateIds },
      activityDate: { gte: thirtyDaysAgo },
    },
    _count: { id: true },
    _max: { activityDate: true },
  })

  const activityCountMap: Record<string, { count30d: number; lastActivity: Date | null }> = {}
  for (const ac of activityCounts) {
    activityCountMap[ac.userId] = {
      count30d: ac._count.id,
      lastActivity: ac._max.activityDate,
    }
  }

  // 7. Check Strava connections for verified status
  const verifiedUsers = await prisma.stravaConnection.findMany({
    where: {
      userId: { in: candidateIds },
    },
    select: { userId: true },
  })
  const verifiedSet = new Set(verifiedUsers.map(v => v.userId))

  // 8. Score and rank candidates with diversity tracking
  // First pass: score all candidates without diversity penalty
  const initialScores = filteredCandidates.map(candidate => {
    const activityData = activityCountMap[candidate.id]
    const candidateSport = candidatePrimarySportMap.get(candidate.id)

    const suggestCandidate: SuggestCandidate = {
      id: candidate.id,
      displayName: candidate.displayName,
      avatarUrl: candidate.avatarUrl,
      primarySport: candidateSport?.slug ?? null,
      sports: [],
      city: candidate.city,
      country: candidate.country,
      mutualCount: mutualCounts[candidate.id] ?? 0,
      activities30d: activityData?.count30d ?? 0,
      lastActivityAt: activityData?.lastActivity,
      hasAvatar: !!candidate.avatarUrl,
      hasBio: !!candidate.bio && candidate.bio.length > 10,
      hasPB: candidate._count.personalRecords > 0,
      hasVerified: verifiedSet.has(candidate.id),
      createdAt: candidate.createdAt,
    }

    const ctx = createScoreContext()
    const result = scoreSuggestedAthlete(meProfile, suggestCandidate, ctx)

    return {
      candidate,
      candidateSport,
      score: result.score,
      reason: result.reason,
      mutuals: mutualCounts[candidate.id] ?? 0,
      activities30d: activityData?.count30d ?? 0,
      suggestCandidate,
    }
  })

  // Apply mode-based sorting/boosting
  if (mode === "near") {
    // Prioritize users from same city/country
    initialScores.sort((a, b) => {
      const aLocal =
        (a.candidate.city && a.candidate.city === currentUser.city ? 100 : 0) +
        (a.candidate.country && a.candidate.country === currentUser.country ? 50 : 0)
      const bLocal =
        (b.candidate.city && b.candidate.city === currentUser.city ? 100 : 0) +
        (b.candidate.country && b.candidate.country === currentUser.country ? 50 : 0)
      if (aLocal !== bLocal) return bLocal - aLocal
      return b.score - a.score
    })
  } else if (mode === "sport") {
    // Prioritize users with same primary sport and higher activity
    initialScores.sort((a, b) => {
      const aSameSport = a.suggestCandidate.primarySport === meProfile.primarySport ? 100 : 0
      const bSameSport = b.suggestCandidate.primarySport === meProfile.primarySport ? 100 : 0
      if (aSameSport !== bSameSport) return bSameSport - aSameSport
      // Then by activity count
      if (a.activities30d !== b.activities30d) return b.activities30d - a.activities30d
      return b.score - a.score
    })
  } else if (mode === "fof") {
    // Prioritize users followed by people I follow (mutual count)
    initialScores.sort((a, b) => {
      if (a.mutuals !== b.mutuals) return b.mutuals - a.mutuals
      return b.score - a.score
    })
  } else {
    // Default: sort by score
    initialScores.sort((a, b) => b.score - a.score)
  }

  // Second pass: select top candidates with diversity tracking
  const finalCtx = createScoreContext()
  const results: SuggestedAthlete[] = []

  for (const item of initialScores) {
    if (results.length >= limit) break

    // Re-score with diversity context
    const result = scoreSuggestedAthlete(meProfile, item.suggestCandidate, finalCtx)

    if (result.score >= minScore) {
      results.push({
        id: item.candidate.id,
        username: item.candidate.username,
        displayName: item.candidate.displayName,
        avatarUrl: item.candidate.avatarUrl,
        city: item.candidate.city,
        country: item.candidate.country,
        primarySport: item.candidateSport?.name ?? null,
        mutualFollows: item.mutuals,
        totalActivities: item.candidate._count.activities,
        isFollowing: false,
        score: result.score,
        reason: result.reason,
      })

      // Update diversity context
      updateScoreContext(finalCtx, item.suggestCandidate)
    }
  }

  return results
}
