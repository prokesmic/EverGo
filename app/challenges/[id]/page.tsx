import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ChallengeDetail } from "@/components/challenges/challenge-detail"

interface ChallengePageProps {
  params: Promise<{ id: string }>
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      sport: true,
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
  })

  if (!challenge) {
    notFound()
  }

  // Calculate leaderboard
  const now = new Date()
  const challengeStart = new Date(challenge.startDate)
  const challengeEnd = new Date(challenge.endDate)

  // Get all activities for participants within the challenge period
  const participantIds = challenge.participants.map((p) => p.userId)

  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: participantIds },
      sportId: challenge.sportId,
      activityDate: {
        gte: challengeStart,
        lte: challengeEnd,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Calculate progress for each participant based on targetType
  const leaderboard = participantIds.map((userId: string) => {
    const userActivities = activities.filter((a) => a.userId === userId)
    const participant = challenge.participants.find((p) => p.userId === userId)!

    let progress = 0

    // Use targetType from schema: DISTANCE, DURATION, ACTIVITIES, ELEVATION
    if (challenge.targetType === "DISTANCE") {
      progress =
        userActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000 // km
    } else if (challenge.targetType === "DURATION") {
      progress =
        userActivities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 3600 // hours
    } else if (challenge.targetType === "ACTIVITIES") {
      progress = userActivities.length
    } else if (challenge.targetType === "ELEVATION") {
      progress = userActivities.reduce((sum, a) => sum + (a.elevationGain || 0), 0)
    }

    const progressPercentage = Math.min(
      (progress / challenge.targetValue) * 100,
      100
    )

    return {
      rank: 0,
      userId,
      user: participant.user,
      progress,
      progressPercentage,
      activitiesCount: userActivities.length,
      joinedAt: participant.joinedAt,
      isCompleted: progress >= challenge.targetValue,
    }
  })

  // Sort by progress (descending) and add ranks
  leaderboard.sort((a, b) => b.progress - a.progress)
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1
  })

  // Check if current user is participating
  let currentUser = null
  if (session?.user?.email) {
    currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }

  const isParticipating = currentUser
    ? participantIds.includes(currentUser.id)
    : false

  const currentUserProgress = isParticipating
    ? leaderboard.find((entry) => entry.userId === currentUser!.id) || null
    : null

  // Calculate challenge status
  const status =
    now < challengeStart
      ? "upcoming"
      : now > challengeEnd
      ? "completed"
      : "active"

  return (
    <ChallengeDetail
      challenge={{
        ...challenge,
        status,
        participantsCount: challenge._count.participants,
      }}
      leaderboard={leaderboard}
      isParticipating={isParticipating}
      currentUserProgress={currentUserProgress}
      currentUserId={currentUser?.id}
    />
  )
}
