import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { differenceInDays } from "date-fns"

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

    // Find user's teams
    const userTeams = await prisma.teamMember.findMany({
      where: { userId: user.id },
      select: { teamId: true },
    })

    if (userTeams.length === 0) {
      return NextResponse.json({ battle: null })
    }

    const teamIds = userTeams.map((t) => t.teamId)

    // Try to find an active team challenge
    // This is a placeholder - implement based on your TeamChallenge model
    try {
      // @ts-ignore - TeamChallenge model may not exist yet
      const activeChallenge = await prisma.teamChallenge?.findFirst({
        where: {
          OR: [{ teamAId: { in: teamIds } }, { teamBId: { in: teamIds } }],
          endDate: { gte: new Date() },
          startDate: { lte: new Date() },
        },
        include: {
          teamA: {
            include: {
              sport: true,
              _count: { select: { members: true } },
            },
          },
          teamB: {
            include: {
              sport: true,
              _count: { select: { members: true } },
            },
          },
        },
        orderBy: { endDate: "asc" },
      })

      if (!activeChallenge) {
        return NextResponse.json({ battle: null })
      }

      // Calculate scores based on activities during the challenge period
      const teamAActivities = await prisma.activity.count({
        where: {
          user: { teamMemberships: { some: { teamId: activeChallenge.teamAId } } },
          activityDate: {
            gte: activeChallenge.startDate,
            lte: activeChallenge.endDate,
          },
        },
      })

      const teamBActivities = await prisma.activity.count({
        where: {
          user: { teamMemberships: { some: { teamId: activeChallenge.teamBId } } },
          activityDate: {
            gte: activeChallenge.startDate,
            lte: activeChallenge.endDate,
          },
        },
      })

      const daysLeft = differenceInDays(new Date(activeChallenge.endDate), new Date())

      return NextResponse.json({
        battle: {
          teamA: {
            id: activeChallenge.teamA.id,
            name: activeChallenge.teamA.name,
            logoUrl: activeChallenge.teamA.logoUrl,
            color: "bg-orange-500",
            score: activeChallenge.teamAScore || teamAActivities * 100,
            weeklyActivities: teamAActivities,
            streak: 0, // TODO: Calculate team streak
          },
          teamB: {
            id: activeChallenge.teamB.id,
            name: activeChallenge.teamB.name,
            logoUrl: activeChallenge.teamB.logoUrl,
            color: "bg-indigo-500",
            score: activeChallenge.teamBScore || teamBActivities * 100,
            weeklyActivities: teamBActivities,
            streak: 0,
          },
          challengeName: activeChallenge.name || "Weekly Showdown",
          endsIn: daysLeft <= 0 ? "Today" : `${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
        },
      })
    } catch {
      // TeamChallenge model doesn't exist yet
      return NextResponse.json({ battle: null })
    }
  } catch (error) {
    console.error("Error fetching active battle:", error)
    return NextResponse.json({ battle: null })
  }
}
