import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { differenceInDays, startOfDay, subDays } from "date-fns"

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function getTeamDailyStreak(teamId: string): Promise<number> {
  const lookbackStart = subDays(startOfDay(new Date()), 30)
  const activities = await prisma.activity.findMany({
    where: {
      activityDate: { gte: lookbackStart },
      user: {
        teamMemberships: {
          some: { teamId },
        },
      },
    },
    select: { activityDate: true },
    orderBy: { activityDate: "desc" },
  })

  const daySet = new Set(activities.map((item) => toDayKey(item.activityDate)))
  let streak = 0
  for (let i = 0; i < 31; i += 1) {
    const day = toDayKey(subDays(startOfDay(new Date()), i))
    if (!daySet.has(day)) break
    streak += 1
  }
  return streak
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ battle: null })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ battle: null })
    }

    const userTeams = await prisma.teamMember.findMany({
      where: { userId: user.id, role: { not: "BANNED" } },
      select: { teamId: true },
    })

    if (userTeams.length === 0) {
      return NextResponse.json({ battle: null })
    }

    const teamIds = userTeams.map((item) => item.teamId)

    const activeBattle = await prisma.crewWar.findFirst({
      where: {
        status: "ACTIVE",
        AND: [
          {
            OR: [
              { challengerTeamId: { in: teamIds } },
              { opponentTeamId: { in: teamIds } },
            ],
          },
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: new Date() } },
            ],
          },
        ],
      },
      include: {
        challengerTeam: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            sport: { select: { icon: true } },
          },
        },
        opponentTeam: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            sport: { select: { icon: true } },
          },
        },
      },
      orderBy: { endsAt: "asc" },
    })

    if (!activeBattle) {
      return NextResponse.json({ battle: null })
    }

    const weekStart = subDays(new Date(), 7)

    const [teamAWeeklyActivities, teamBWeeklyActivities, teamAStreak, teamBStreak] =
      await Promise.all([
        prisma.activity.count({
          where: {
            activityDate: { gte: weekStart },
            user: { teamMemberships: { some: { teamId: activeBattle.challengerTeamId } } },
          },
        }),
        prisma.activity.count({
          where: {
            activityDate: { gte: weekStart },
            user: { teamMemberships: { some: { teamId: activeBattle.opponentTeamId } } },
          },
        }),
        getTeamDailyStreak(activeBattle.challengerTeamId),
        getTeamDailyStreak(activeBattle.opponentTeamId),
      ])

    const daysLeft = activeBattle.endsAt
      ? Math.max(0, differenceInDays(new Date(activeBattle.endsAt), new Date()))
      : null
    const isViewerChallenger = teamIds.includes(activeBattle.challengerTeamId)
    const myTeam = isViewerChallenger ? activeBattle.challengerTeam : activeBattle.opponentTeam
    const opponentTeam = isViewerChallenger ? activeBattle.opponentTeam : activeBattle.challengerTeam

    return NextResponse.json({
      battle: {
        teamA: {
          id: activeBattle.challengerTeam.slug,
          name: `${activeBattle.challengerTeam.sport.icon} ${activeBattle.challengerTeam.name}`,
          logoUrl: activeBattle.challengerTeam.logoUrl,
          color: "bg-orange-500",
          score: Math.round(activeBattle.challengerPower),
          weeklyActivities: teamAWeeklyActivities,
          streak: teamAStreak,
        },
        teamB: {
          id: activeBattle.opponentTeam.slug,
          name: `${activeBattle.opponentTeam.sport.icon} ${activeBattle.opponentTeam.name}`,
          logoUrl: activeBattle.opponentTeam.logoUrl,
          color: "bg-indigo-500",
          score: Math.round(activeBattle.opponentPower),
          weeklyActivities: teamBWeeklyActivities,
          streak: teamBStreak,
        },
        challengeName: activeBattle.message || "Crew War",
        endsIn: daysLeft === null ? "No end date" : daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        endsAt: activeBattle.endsAt?.toISOString() ?? null,
        myTeamId: myTeam.slug,
        myTeamName: myTeam.name,
        opponentTeamId: opponentTeam.slug,
        opponentTeamName: opponentTeam.name,
      },
    })
  } catch (error) {
    console.error("Error fetching active battle:", error)
    return NextResponse.json({ battle: null })
  }
}
