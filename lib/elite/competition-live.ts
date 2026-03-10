import { prisma } from "@/lib/db"

export interface LiveCompetitionItem {
  id: string
  kind: "RIVALRY" | "CHALLENGE" | "TEAM_BATTLE"
  title: string
  status: "LEADING" | "TRAILING" | "TIED" | "ACTIVE"
  myValue: number
  opponentValue: number
  delta: number
  momentum: number
  finishProbability: number
  endsAt: string | null
  updatedAt: string
}

export async function getLiveCompetition(userId: string): Promise<LiveCompetitionItem[]> {
  const [rivalries, challengeParticipants, teamMembership] = await Promise.all([
    prisma.rivalry.findMany({
      where: {
        status: "ACTIVE",
        participants: {
          some: { userId, isAccepted: true },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, displayName: true } },
          },
        },
      },
      take: 5,
      orderBy: { windowEnd: "asc" },
    }),
    prisma.challengeParticipant.findMany({
      where: {
        userId,
        challenge: {
          isActive: true,
          endDate: { gte: new Date() },
        },
      },
      include: {
        challenge: true,
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.teamMember.findFirst({
      where: {
        userId,
        role: { not: "BANNED" },
      },
      select: { teamId: true },
    }),
  ])

  const rivalryItems = rivalries
    .map<LiveCompetitionItem | null>((rivalry) => {
      const mine = rivalry.participants.find((p) => p.userId === userId)
      const opponent = rivalry.participants.find((p) => p.userId !== userId)
      if (!mine || !opponent) return null

      const myValue = mine.scoreValue ?? mine.bestValue ?? 0
      const opponentValue = opponent.scoreValue ?? opponent.bestValue ?? 0
      const delta = myValue - opponentValue
      const daysLeft = Math.max(
        1,
        Math.ceil((rivalry.windowEnd.getTime() - Date.now()) / 86_400_000)
      )
      const momentum = computeMomentum(delta, daysLeft)

      return {
        id: rivalry.id,
        kind: "RIVALRY" as const,
        title: `vs ${opponent.user.displayName}`,
        status: delta > 0 ? "LEADING" : delta < 0 ? "TRAILING" : "TIED",
        myValue,
        opponentValue,
        delta,
        momentum,
        finishProbability: computeFinishProbability(delta, daysLeft),
        endsAt: rivalry.windowEnd.toISOString(),
        updatedAt: (rivalry.lastComputedAt ?? rivalry.updatedAt).toISOString(),
      }
    })
    .filter((item): item is LiveCompetitionItem => item !== null)

  const challengeItems: LiveCompetitionItem[] = challengeParticipants.map((entry) => {
    const myValue = entry.currentValue
    const target = entry.challenge.targetValue
    const remaining = Math.max(0, target - myValue)
    const daysLeft = Math.max(
      1,
      Math.ceil((entry.challenge.endDate.getTime() - Date.now()) / 86_400_000)
    )
    const projectedDaily = myValue / Math.max(1, 7)
    const projectedEndValue = myValue + projectedDaily * daysLeft
    const status: LiveCompetitionItem["status"] = entry.isCompleted ? "LEADING" : "ACTIVE"

    return {
      id: entry.challengeId,
      kind: "CHALLENGE" as const,
      title: entry.challenge.title,
      status,
      myValue,
      opponentValue: target,
      delta: myValue - target,
      momentum: projectedDaily,
      finishProbability: clamp(Math.round((projectedEndValue / Math.max(target, 1)) * 100), 5, 99),
      endsAt: entry.challenge.endDate.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }
  })

  let teamBattleItem: LiveCompetitionItem[] = []
  if (teamMembership?.teamId) {
    const battle = await prisma.crewWar.findFirst({
      where: {
        status: "ACTIVE",
        OR: [
          { challengerTeamId: teamMembership.teamId },
          { opponentTeamId: teamMembership.teamId },
        ],
      },
      include: {
        challengerTeam: { select: { name: true } },
        opponentTeam: { select: { name: true } },
      },
      orderBy: { endsAt: "asc" },
    })

    if (battle) {
      const isChallenger = battle.challengerTeamId === teamMembership.teamId
      const myValue = isChallenger ? battle.challengerPower : battle.opponentPower
      const opponentValue = isChallenger ? battle.opponentPower : battle.challengerPower
      const delta = myValue - opponentValue
      const daysLeft = battle.endsAt
        ? Math.max(1, Math.ceil((battle.endsAt.getTime() - Date.now()) / 86_400_000))
        : 7

      teamBattleItem = [
        {
          id: battle.id,
          kind: "TEAM_BATTLE",
          title: `${battle.challengerTeam.name} vs ${battle.opponentTeam.name}`,
          status: delta > 0 ? "LEADING" : delta < 0 ? "TRAILING" : "TIED",
          myValue,
          opponentValue,
          delta,
          momentum: computeMomentum(delta, daysLeft),
          finishProbability: computeFinishProbability(delta, daysLeft),
          endsAt: battle.endsAt?.toISOString() ?? null,
          updatedAt: battle.updatedAt.toISOString(),
        },
      ]
    }
  }

  return [...rivalryItems, ...challengeItems, ...teamBattleItem].sort((a, b) => {
    const aUrgency = a.endsAt ? new Date(a.endsAt).getTime() : Number.POSITIVE_INFINITY
    const bUrgency = b.endsAt ? new Date(b.endsAt).getTime() : Number.POSITIVE_INFINITY
    return aUrgency - bUrgency
  })
}

function computeMomentum(delta: number, daysLeft: number) {
  return Math.round((delta / Math.max(daysLeft, 1)) * 100) / 100
}

function computeFinishProbability(delta: number, daysLeft: number) {
  const normalized = delta / Math.max(1, daysLeft * 12)
  return clamp(Math.round((1 / (1 + Math.exp(-normalized))) * 100), 5, 95)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}
