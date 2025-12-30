import { prisma } from "@/lib/db"
import { RivalryMode, RivalryMetric, RivalryStatus } from "@prisma/client"

/**
 * Rivalry Scoring Engine
 *
 * Deterministic computation of rivalry scores based on activities.
 * Every activity log triggers recompute for relevant active rivalries.
 */

// =============================================================================
// TYPES
// =============================================================================

type RivalryWithParticipants = {
  id: string
  mode: RivalryMode
  metric: RivalryMetric
  sportSlug: string
  sportSubtype: string | null
  windowStart: Date
  windowEnd: Date
  status: RivalryStatus
  benchmarkId: string | null
  participants: {
    id: string
    userId: string
    scoreValue: number | null
    bestValue: number | null
    bestActivityId: string | null
  }[]
}

type ParticipantScore = {
  participantId: string
  userId: string
  scoreValue: number
  bestValue: number | null
  bestActivityId: string | null
  activityCount: number
  lastActivityAt: Date | null
}

// =============================================================================
// MAIN SCORING FUNCTION
// =============================================================================

/**
 * recomputeRivalry
 * Recalculates all scores for a rivalry from scratch.
 * Called after every relevant activity is logged.
 */
export async function recomputeRivalry(rivalryId: string): Promise<void> {
  const rivalry = await prisma.rivalry.findUnique({
    where: { id: rivalryId },
    include: {
      participants: true,
    },
  })

  if (!rivalry || rivalry.status !== RivalryStatus.ACTIVE) {
    return
  }

  // Fetch activities for each participant within the window
  const scores = await Promise.all(
    rivalry.participants.map((p) => computeParticipantScore(rivalry, p.userId, p.id))
  )

  // Determine leader
  let leaderUserId: string | null = null
  if (scores.length === 2) {
    const [p1, p2] = scores
    if (p1.scoreValue > p2.scoreValue) {
      leaderUserId = p1.userId
    } else if (p2.scoreValue > p1.scoreValue) {
      leaderUserId = p2.userId
    }
    // null if tied
  }

  // Update all participants and rivalry in a transaction
  await prisma.$transaction([
    ...scores.map((score) =>
      prisma.rivalryParticipant.update({
        where: { id: score.participantId },
        data: {
          scoreValue: score.scoreValue,
          bestValue: score.bestValue,
          bestActivityId: score.bestActivityId,
          activityCount: score.activityCount,
          lastActivityAt: score.lastActivityAt,
        },
      })
    ),
    prisma.rivalry.update({
      where: { id: rivalryId },
      data: {
        leaderUserId,
        lastComputedAt: new Date(),
      },
    }),
  ])
}

/**
 * computeParticipantScore
 * Calculates score for a single participant based on their activities.
 */
async function computeParticipantScore(
  rivalry: RivalryWithParticipants,
  userId: string,
  participantId: string
): Promise<ParticipantScore> {
  // Build activity filter based on sport
  const sportFilter = await getSportFilter(rivalry.sportSlug, rivalry.sportSubtype)

  // Fetch activities within window
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: {
        gte: rivalry.windowStart,
        lte: rivalry.windowEnd,
      },
      ...sportFilter,
    },
    orderBy: { activityDate: "desc" },
  })

  if (activities.length === 0) {
    return {
      participantId,
      userId,
      scoreValue: 0,
      bestValue: null,
      bestActivityId: null,
      activityCount: 0,
      lastActivityAt: null,
    }
  }

  let scoreValue = 0
  let bestValue: number | null = null
  let bestActivityId: string | null = null

  if (rivalry.mode === RivalryMode.VOLUME) {
    // Volume mode: sum up the metric
    scoreValue = activities.reduce((sum, activity) => {
      return sum + getActivityMetricValue(activity, rivalry.metric)
    }, 0)
  } else if (rivalry.mode === RivalryMode.BENCHMARK) {
    // Benchmark mode: find best attempt
    const isLowerBetter = rivalry.metric === RivalryMetric.TIME

    for (const activity of activities) {
      const value = getActivityMetricValue(activity, rivalry.metric)
      if (value === 0) continue

      if (bestValue === null) {
        bestValue = value
        bestActivityId = activity.id
      } else if (isLowerBetter && value < bestValue) {
        bestValue = value
        bestActivityId = activity.id
      } else if (!isLowerBetter && value > bestValue) {
        bestValue = value
        bestActivityId = activity.id
      }
    }

    scoreValue = bestValue ?? 0
  }

  return {
    participantId,
    userId,
    scoreValue,
    bestValue,
    bestActivityId,
    activityCount: activities.length,
    lastActivityAt: activities[0]?.activityDate ?? null,
  }
}

/**
 * getSportFilter
 * Builds Prisma where clause to filter activities by sport.
 */
async function getSportFilter(
  sportSlug: string,
  sportSubtype: string | null
): Promise<Record<string, unknown>> {
  // Find sport by slug
  const sport = await prisma.sport.findUnique({
    where: { slug: sportSlug },
  })

  if (!sport) {
    return {}
  }

  const filter: Record<string, unknown> = {
    sportId: sport.id,
  }

  // If subtype specified, also filter by discipline
  if (sportSubtype) {
    const discipline = await prisma.discipline.findFirst({
      where: {
        sportId: sport.id,
        slug: sportSubtype,
      },
    })
    if (discipline) {
      filter.disciplineId = discipline.id
    }
  }

  return filter
}

/**
 * getActivityMetricValue
 * Extracts the relevant metric value from an activity.
 */
function getActivityMetricValue(
  activity: { distanceMeters: number | null; durationSeconds: number | null; score: number | null },
  metric: RivalryMetric
): number {
  switch (metric) {
    case RivalryMetric.DISTANCE:
      return activity.distanceMeters ?? 0
    case RivalryMetric.DURATION:
      return activity.durationSeconds ?? 0
    case RivalryMetric.SESSIONS:
      return 1 // Each activity counts as 1 session
    case RivalryMetric.TIME:
      return activity.durationSeconds ?? 0
    case RivalryMetric.REPS:
    case RivalryMetric.SCORE:
      return activity.score ?? 0
    default:
      return 0
  }
}

// =============================================================================
// TRIGGERED RECOMPUTE
// =============================================================================

/**
 * recomputeRivalriesForUser
 * Called after a user logs an activity.
 * Finds all active rivalries for the user and recomputes them.
 */
export async function recomputeRivalriesForUser(
  userId: string,
  sportSlug?: string
): Promise<void> {
  const filter: Record<string, unknown> = {
    status: RivalryStatus.ACTIVE,
    windowEnd: { gte: new Date() },
    participants: {
      some: { userId },
    },
  }

  if (sportSlug) {
    filter.sportSlug = sportSlug
  }

  const activeRivalries = await prisma.rivalry.findMany({
    where: filter,
    select: { id: true },
  })

  // Recompute each rivalry
  await Promise.all(activeRivalries.map((r) => recomputeRivalry(r.id)))
}

/**
 * recomputeRivalriesForActivity
 * Called when a specific activity is logged.
 * More efficient than recomputeRivalriesForUser when sport is known.
 */
export async function recomputeRivalriesForActivity(
  userId: string,
  activityDate: Date,
  sportId: string
): Promise<void> {
  // Get sport slug from sportId
  const sport = await prisma.sport.findUnique({
    where: { id: sportId },
    select: { slug: true },
  })

  if (!sport) return

  // Find active rivalries that:
  // 1. User is a participant
  // 2. Match the sport
  // 3. Activity date is within window
  const rivalries = await prisma.rivalry.findMany({
    where: {
      status: RivalryStatus.ACTIVE,
      sportSlug: sport.slug,
      windowStart: { lte: activityDate },
      windowEnd: { gte: activityDate },
      participants: {
        some: { userId },
      },
    },
    select: { id: true },
  })

  await Promise.all(rivalries.map((r) => recomputeRivalry(r.id)))
}

// =============================================================================
// RIVALRY COMPLETION
// =============================================================================

/**
 * checkAndCompleteExpiredRivalries
 * Cron job function to complete rivalries that have ended.
 */
export async function checkAndCompleteExpiredRivalries(): Promise<number> {
  const now = new Date()

  // Find active rivalries that have ended
  const expiredRivalries = await prisma.rivalry.findMany({
    where: {
      status: RivalryStatus.ACTIVE,
      windowEnd: { lt: now },
    },
    include: {
      participants: true,
    },
  })

  let completed = 0

  for (const rivalry of expiredRivalries) {
    await completeRivalry(rivalry.id)
    completed++
  }

  return completed
}

/**
 * completeRivalry
 * Finalizes a rivalry, determines winner, and updates ratings.
 */
export async function completeRivalry(rivalryId: string): Promise<void> {
  const rivalry = await prisma.rivalry.findUnique({
    where: { id: rivalryId },
    include: {
      participants: true,
    },
  })

  if (!rivalry || rivalry.status !== RivalryStatus.ACTIVE) {
    return
  }

  // Ensure final scores are computed
  await recomputeRivalry(rivalryId)

  // Refetch with updated scores
  const updatedRivalry = await prisma.rivalry.findUnique({
    where: { id: rivalryId },
    include: {
      participants: true,
    },
  })

  if (!updatedRivalry || updatedRivalry.participants.length !== 2) {
    return
  }

  const [p1, p2] = updatedRivalry.participants
  const score1 = p1.scoreValue ?? 0
  const score2 = p2.scoreValue ?? 0

  let winnerUserId: string | null = null
  let loserUserId: string | null = null
  let isTie = false
  let winnerScore: number | null = null
  let loserScore: number | null = null

  if (score1 > score2) {
    winnerUserId = p1.userId
    loserUserId = p2.userId
    winnerScore = score1
    loserScore = score2
  } else if (score2 > score1) {
    winnerUserId = p2.userId
    loserUserId = p1.userId
    winnerScore = score2
    loserScore = score1
  } else {
    isTie = true
    winnerScore = score1
    loserScore = score2
  }

  // Calculate Elo rating changes
  const { winnerDelta, loserDelta } = await calculateEloDeltas(
    updatedRivalry.sportSlug,
    winnerUserId,
    loserUserId,
    isTie
  )

  // Create result and update rivalry status in transaction
  await prisma.$transaction([
    prisma.rivalryResult.create({
      data: {
        rivalryId,
        winnerUserId,
        loserUserId,
        isTie,
        winnerScore,
        loserScore,
        winnerRatingDelta: winnerDelta,
        loserRatingDelta: loserDelta,
      },
    }),
    prisma.rivalry.update({
      where: { id: rivalryId },
      data: { status: RivalryStatus.COMPLETED },
    }),
  ])

  // Update Elo ratings
  if (!isTie && winnerUserId && loserUserId) {
    await updateEloRatings(
      updatedRivalry.sportSlug,
      winnerUserId,
      loserUserId,
      winnerDelta,
      loserDelta
    )
  } else if (isTie) {
    // For ties, both get small adjustment
    await updateEloRatingsForTie(
      updatedRivalry.sportSlug,
      p1.userId,
      p2.userId
    )
  }
}

// =============================================================================
// ELO RATING HELPERS
// =============================================================================

const ELO_K = 24 // K-factor for rating changes
const DEFAULT_RATING = 1000

/**
 * calculateEloDeltas
 * Calculates expected rating changes for winner and loser.
 */
async function calculateEloDeltas(
  sportSlug: string,
  winnerUserId: string | null,
  loserUserId: string | null,
  isTie: boolean
): Promise<{ winnerDelta: number; loserDelta: number }> {
  if (isTie || !winnerUserId || !loserUserId) {
    return { winnerDelta: 0, loserDelta: 0 }
  }

  const [winnerRating, loserRating] = await Promise.all([
    getUserSportRating(winnerUserId, sportSlug),
    getUserSportRating(loserUserId, sportSlug),
  ])

  // Calculate expected scores
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
  const expectedLoser = 1 - expectedWinner

  // Winner gets 1 point, loser gets 0
  const winnerDelta = Math.round(ELO_K * (1 - expectedWinner))
  const loserDelta = Math.round(ELO_K * (0 - expectedLoser))

  return { winnerDelta, loserDelta }
}

/**
 * getUserSportRating
 * Gets user's current rating for a sport, or default if none exists.
 */
async function getUserSportRating(userId: string, sportSlug: string): Promise<number> {
  const rating = await prisma.userSportRating.findUnique({
    where: {
      userId_sportSlug: { userId, sportSlug },
    },
  })

  return rating?.rating ?? DEFAULT_RATING
}

/**
 * updateEloRatings
 * Applies rating changes after a rivalry completes.
 */
async function updateEloRatings(
  sportSlug: string,
  winnerUserId: string,
  loserUserId: string,
  winnerDelta: number,
  loserDelta: number
): Promise<void> {
  await prisma.$transaction([
    prisma.userSportRating.upsert({
      where: {
        userId_sportSlug: { userId: winnerUserId, sportSlug },
      },
      create: {
        userId: winnerUserId,
        sportSlug,
        rating: DEFAULT_RATING + winnerDelta,
        wins: 1,
        losses: 0,
        ties: 0,
      },
      update: {
        rating: { increment: winnerDelta },
        wins: { increment: 1 },
      },
    }),
    prisma.userSportRating.upsert({
      where: {
        userId_sportSlug: { userId: loserUserId, sportSlug },
      },
      create: {
        userId: loserUserId,
        sportSlug,
        rating: DEFAULT_RATING + loserDelta,
        wins: 0,
        losses: 1,
        ties: 0,
      },
      update: {
        rating: { increment: loserDelta },
        losses: { increment: 1 },
      },
    }),
  ])
}

/**
 * updateEloRatingsForTie
 * Handles rating updates for tied rivalries.
 */
async function updateEloRatingsForTie(
  sportSlug: string,
  userId1: string,
  userId2: string
): Promise<void> {
  // For ties, we move ratings slightly toward each other
  const [rating1, rating2] = await Promise.all([
    getUserSportRating(userId1, sportSlug),
    getUserSportRating(userId2, sportSlug),
  ])

  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400))
  const expected2 = 1 - expected1

  // Ties count as 0.5 for both
  const delta1 = Math.round(ELO_K * (0.5 - expected1))
  const delta2 = Math.round(ELO_K * (0.5 - expected2))

  await prisma.$transaction([
    prisma.userSportRating.upsert({
      where: {
        userId_sportSlug: { userId: userId1, sportSlug },
      },
      create: {
        userId: userId1,
        sportSlug,
        rating: DEFAULT_RATING + delta1,
        wins: 0,
        losses: 0,
        ties: 1,
      },
      update: {
        rating: { increment: delta1 },
        ties: { increment: 1 },
      },
    }),
    prisma.userSportRating.upsert({
      where: {
        userId_sportSlug: { userId: userId2, sportSlug },
      },
      create: {
        userId: userId2,
        sportSlug,
        rating: DEFAULT_RATING + delta2,
        wins: 0,
        losses: 0,
        ties: 1,
      },
      update: {
        rating: { increment: delta2 },
        ties: { increment: 1 },
      },
    }),
  ])
}

// =============================================================================
// PENDING RIVALRY EXPIRATION
// =============================================================================

/**
 * expirePendingRivalries
 * Cron job function to expire pending rivalries past their invite deadline.
 */
export async function expirePendingRivalries(): Promise<number> {
  const now = new Date()

  const result = await prisma.rivalry.updateMany({
    where: {
      status: RivalryStatus.PENDING,
      inviteExpiresAt: { lt: now },
    },
    data: {
      status: RivalryStatus.EXPIRED,
    },
  })

  return result.count
}
