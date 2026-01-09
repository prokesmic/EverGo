import { prisma } from "@/lib/db"
import {
  CompetitionType,
  CompetitionStatus,
  ScoringMode,
  ScoringMetric,
  CompetitionEventType,
  ParticipantEntityType,
  Prisma,
} from "@prisma/client"
import { getVerificationWeight } from "@/lib/sport-index/checkAnomalies"

type ParticipantScore = {
  participantId: string
  entityType: ParticipantEntityType
  entityId: string
  score: number
  rank: number
  rawValue: number
  activitiesCount: number
}

type CompetitionResult = {
  competitionId: string
  participants: ParticipantScore[]
  winnerId?: string
  status: CompetitionStatus
}

/**
 * Unified Competition Engine
 * Handles scoring for Rivalries, Challenges, and Team Battles
 */
export async function recomputeCompetition(
  competitionId: string
): Promise<CompetitionResult | null> {
  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      participants: true,
    },
  })

  if (!competition) return null

  // Don't recompute finished competitions
  if (competition.status === "COMPLETED" || competition.status === "CANCELLED") {
    return null
  }

  const now = new Date()
  const isExpired = now > competition.windowEnd
  const isActive =
    now >= competition.windowStart && now <= competition.windowEnd

  // Calculate scores for each participant
  const scores = await Promise.all(
    competition.participants.map((p) =>
      calculateParticipantScore(competition, p)
    )
  )

  // Sort by score (higher is better for most modes)
  // For TIME metric, lower is better
  const sortedScores = [...scores].sort((a, b) => {
    if (competition.scoringMetric === "TIME") {
      // Lower time is better
      return a.rawValue - b.rawValue
    }
    return b.score - a.score
  })

  // Assign ranks
  sortedScores.forEach((s, i) => {
    s.rank = i + 1
  })

  // Determine winner if expired
  let leaderEntityId: string | undefined
  let newStatus: CompetitionStatus = competition.status

  if (isExpired && competition.status === "ACTIVE") {
    newStatus = "COMPLETED"
    if (sortedScores.length > 0 && sortedScores[0].score > 0) {
      leaderEntityId = sortedScores[0].entityId
    }
  } else if (isActive && competition.status === "PENDING") {
    newStatus = "ACTIVE"
  }

  // Update competition and create snapshot
  await prisma.$transaction(async (tx) => {
    // Update competition status
    await tx.competition.update({
      where: { id: competitionId },
      data: {
        status: newStatus,
        leaderEntityId,
        lastComputedAt: new Date(),
      },
    })

    // Update participant scores
    for (const score of sortedScores) {
      await tx.competitionParticipant.update({
        where: { id: score.participantId },
        data: {
          scoreValue: score.score,
          bestValue: score.rawValue,
        },
      })
    }

    // Create snapshot
    await tx.competitionSnapshot.create({
      data: {
        competitionId,
        snapshotJson: JSON.parse(JSON.stringify(sortedScores)),
      },
    })

    // Create event if status changed
    if (newStatus !== competition.status) {
      const eventType: CompetitionEventType =
        newStatus === "COMPLETED" ? "COMPLETED" : "SCORE_CHANGED"

      await tx.competitionEvent.create({
        data: {
          competitionId,
          type: eventType,
          title:
            eventType === "COMPLETED"
              ? `Competition ended - ${leaderEntityId ? "Winner declared" : "No winner"}`
              : "Scores updated",
          detailJson: JSON.parse(JSON.stringify({ scores: sortedScores })),
        },
      })
    }
  })

  return {
    competitionId,
    participants: sortedScores,
    winnerId: leaderEntityId,
    status: newStatus,
  }
}

/**
 * Calculate score for a single participant
 */
async function calculateParticipantScore(
  competition: {
    id: string
    sportSlug: string | null
    scoringMode: ScoringMode
    scoringMetric: ScoringMetric
    windowStart: Date
    windowEnd: Date
    benchmarkId: string | null
  },
  participant: {
    id: string
    entityType: ParticipantEntityType
    entityId: string
  }
): Promise<ParticipantScore> {
  // Get relevant activities for this participant in the window
  const userIds =
    participant.entityType === "USER"
      ? [participant.entityId]
      : await getTeamMemberIds(participant.entityId)

  // Build activity query based on competition settings
  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: userIds },
      activityDate: {
        gte: competition.windowStart,
        lte: competition.windowEnd,
      },
      // Only include activities for the competition's sport if specified
      ...(competition.sportSlug
        ? {
            OR: [
              { discipline: { sport: { slug: competition.sportSlug } } },
              { discipline: { slug: competition.sportSlug } },
            ],
          }
        : {}),
      // Exclude anomalous activities
      isAnomalous: false,
    },
  })

  if (activities.length === 0) {
    return {
      participantId: participant.id,
      entityType: participant.entityType,
      entityId: participant.entityId,
      score: 0,
      rank: 0,
      rawValue: 0,
      activitiesCount: 0,
    }
  }

  // Calculate raw value based on scoring metric
  // Schema metrics: DISTANCE, DURATION, SESSIONS, TIME, REPS, SCORE, ELEVATION_GAIN
  let rawValue = 0
  let score = 0

  switch (competition.scoringMetric) {
    case "DURATION":
      rawValue = activities.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0)
      score = rawValue / 60 // Convert to minutes for display
      break

    case "DISTANCE":
      rawValue = activities.reduce((sum, a) => sum + (a.distanceMeters ?? 0), 0)
      score = rawValue / 1000 // Convert to km
      break

    case "SESSIONS":
      rawValue = activities.length
      score = rawValue
      break

    case "TIME":
      // Best time from activities
      rawValue = Math.min(
        ...activities.filter((a) => a.durationSeconds).map((a) => a.durationSeconds!)
      )
      score = rawValue > 0 ? 10000 / rawValue : 0
      break

    case "REPS":
      // Benchmarks removed in V6 - use activity count as fallback
      rawValue = activities.length
      score = rawValue
      break

    case "SCORE":
      // Benchmarks removed in V6 - use session count as fallback
      rawValue = activities.length
      score = rawValue
      break

    case "ELEVATION_GAIN":
      rawValue = activities.reduce((sum, a) => sum + (a.elevationGain ?? 0), 0)
      score = rawValue
      break
  }

  // Apply verification weighting
  // Weight score by average verification tier of activities
  const verificationWeights = activities.map((a) =>
    getVerificationWeight(a.verificationTier)
  )
  const avgWeight =
    verificationWeights.reduce((sum, w) => sum + w, 0) / verificationWeights.length
  score = score * avgWeight

  return {
    participantId: participant.id,
    entityType: participant.entityType,
    entityId: participant.entityId,
    score: Math.round(score * 100) / 100,
    rank: 0, // Will be assigned after sorting
    rawValue,
    activitiesCount: activities.length,
  }
}

/**
 * Get all user IDs for a team
 */
async function getTeamMemberIds(teamId: string): Promise<string[]> {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  })
  return members.map((m) => m.userId)
}

/**
 * Create a new competition
 */
export async function createCompetition(input: {
  type: CompetitionType
  createdByUserId: string
  sportSlug?: string
  windowStart: Date
  windowEnd: Date
  scoringMode: ScoringMode
  scoringMetric: ScoringMetric
  benchmarkId?: string
  visibility?: "PRIVATE" | "FRIENDS" | "PUBLIC"
  participants: Array<{
    entityType: ParticipantEntityType
    entityId: string
  }>
}) {
  return await prisma.$transaction(async (tx) => {
    const competition = await tx.competition.create({
      data: {
        type: input.type,
        createdByUserId: input.createdByUserId,
        sportSlug: input.sportSlug,
        windowStart: input.windowStart,
        windowEnd: input.windowEnd,
        scoringMode: input.scoringMode,
        scoringMetric: input.scoringMetric,
        benchmarkId: input.benchmarkId,
        visibility: input.visibility ?? "FRIENDS",
        status: new Date() >= input.windowStart ? "ACTIVE" : "PENDING",
      },
    })

    // Create participants
    await tx.competitionParticipant.createMany({
      data: input.participants.map((p) => ({
        competitionId: competition.id,
        entityType: p.entityType,
        entityId: p.entityId,
      })),
    })

    // Create started event
    await tx.competitionEvent.create({
      data: {
        competitionId: competition.id,
        type: "SCORE_CHANGED",
        title: `${input.type} competition created`,
      },
    })

    return competition
  })
}

/**
 * Process an activity for all active competitions it might affect
 */
export async function processActivityForCompetitions(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      discipline: { include: { sport: true } },
      user: true,
    },
  })

  if (!activity) return

  const sportSlug =
    activity.discipline?.sport?.slug ?? activity.discipline?.slug

  // Find user's team memberships
  const teamMemberships = await prisma.teamMember.findMany({
    where: { userId: activity.userId },
    select: { teamId: true },
  })
  const teamIds = teamMemberships.map((t) => t.teamId)

  // Find active competitions this user is part of
  const participations = await prisma.competitionParticipant.findMany({
    where: {
      OR: [
        { entityType: "USER", entityId: activity.userId },
        ...(teamIds.length > 0
          ? [{ entityType: "TEAM" as const, entityId: { in: teamIds } }]
          : []),
      ],
      competition: {
        status: "ACTIVE",
        windowStart: { lte: activity.activityDate },
        windowEnd: { gte: activity.activityDate },
        // Match sport if competition has one specified
        OR: [{ sportSlug: null }, { sportSlug }],
      },
    },
    include: { competition: true },
  })

  // Recompute each affected competition
  for (const participation of participations) {
    await recomputeCompetition(participation.competitionId)
  }
}
