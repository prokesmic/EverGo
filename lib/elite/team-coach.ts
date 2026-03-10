import { prisma } from "@/lib/db"

export interface TeamCoachDashboard {
  team: {
    id: string
    slug: string
    name: string
  }
  compliance: {
    weeklySessionTarget: number
    membersOnTrack: number
    totalMembers: number
    avgCompletionPct: number
  }
  memberRows: Array<{
    userId: string
    displayName: string
    role: string
    sessionsThisWeek: number
    completionPct: number
  }>
  calendar: Array<{
    id: string
    title: string
    startsAt: string
    type: "TEAM_SESSION" | "CHALLENGE"
  }>
  objectives: Array<{
    id: string
    title: string
    targetValue: number
    currentValue: number
    progressPct: number
    endsAt: string
  }>
}

const COACH_ROLES = new Set(["OWNER", "ADMIN", "CAPTAIN", "COACH"])

export async function canAccessCoachDashboard(teamId: string, userId: string): Promise<boolean> {
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: { teamId, userId },
    },
    select: { role: true },
  })

  return !!membership && COACH_ROLES.has(membership.role.toUpperCase())
}

export async function getTeamCoachDashboard(teamSlug: string): Promise<TeamCoachDashboard | null> {
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    select: {
      id: true,
      slug: true,
      name: true,
      members: {
        include: {
          user: { select: { id: true, displayName: true } },
        },
      },
    },
  })

  if (!team) return null

  const memberIds = team.members.map((member) => member.userId)
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())

  const [activitiesThisWeek, teamChallenges] = await Promise.all([
    prisma.activity.groupBy({
      by: ["userId"],
      where: {
        userId: { in: memberIds },
        activityDate: { gte: weekStart, lte: weekEnd },
      },
      _count: { id: true },
    }),
    prisma.challenge.findMany({
      where: {
        teamId: team.id,
        endDate: { gte: new Date() },
      },
      include: {
        participants: {
          select: {
            currentValue: true,
          },
        },
      },
      orderBy: { endDate: "asc" },
      take: 6,
    }),
  ])

  const sessionsByMember = new Map(activitiesThisWeek.map((item) => [item.userId, item._count.id]))
  const weeklySessionTarget = 4
  const memberRows = team.members.map((member) => {
    const sessions = sessionsByMember.get(member.userId) ?? 0
    const completionPct = Math.min(100, Math.round((sessions / weeklySessionTarget) * 100))
    return {
      userId: member.userId,
      displayName: member.user.displayName,
      role: member.role,
      sessionsThisWeek: sessions,
      completionPct,
    }
  })

  const membersOnTrack = memberRows.filter((row) => row.sessionsThisWeek >= weeklySessionTarget).length
  const avgCompletionPct =
    memberRows.length > 0
      ? Math.round(memberRows.reduce((sum, row) => sum + row.completionPct, 0) / memberRows.length)
      : 0

  const objectives = teamChallenges.map((challenge) => {
    const currentValue = challenge.participants.reduce((sum, participant) => sum + participant.currentValue, 0)
    const progressPct = Math.min(100, Math.round((currentValue / Math.max(challenge.targetValue, 1)) * 100))
    return {
      id: challenge.id,
      title: challenge.title,
      targetValue: challenge.targetValue,
      currentValue,
      progressPct,
      endsAt: challenge.endDate.toISOString(),
    }
  })

  const calendar = [
    {
      id: `${team.id}:session:tempo`,
      title: "Team quality session",
      startsAt: addDaysIso(new Date(), 1, 18),
      type: "TEAM_SESSION" as const,
    },
    {
      id: `${team.id}:session:long`,
      title: "Long aerobic group session",
      startsAt: addDaysIso(new Date(), 3, 8),
      type: "TEAM_SESSION" as const,
    },
    ...teamChallenges.slice(0, 3).map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      startsAt: challenge.startDate.toISOString(),
      type: "CHALLENGE" as const,
    })),
  ].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())

  return {
    team: {
      id: team.id,
      slug: team.slug,
      name: team.name,
    },
    compliance: {
      weeklySessionTarget,
      membersOnTrack,
      totalMembers: team.members.length,
      avgCompletionPct,
    },
    memberRows: memberRows.sort((a, b) => b.completionPct - a.completionPct),
    calendar,
    objectives,
  }
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function addDaysIso(base: Date, days: number, hour: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}
