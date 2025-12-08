import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

// GET /api/teams/[slug]/challenges - Get team challenges
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "active"

  try {
    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { slug },
      include: { sport: true }
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const where: any = {
      scope: "TEAM",
      teamId: team.id,
      isActive: true
    }

    const now = new Date()

    if (status === "active") {
      where.startDate = { lte: now }
      where.endDate = { gte: now }
    } else if (status === "upcoming") {
      where.startDate = { gt: now }
    } else if (status === "completed") {
      where.endDate = { lt: now }
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        sport: true,
        badge: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { currentValue: "desc" },
          take: 10
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { endDate: "asc" }
    })

    // Get current user's participation if logged in
    let userParticipation: Record<string, any> = {}
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user) {
        const participations = await prisma.challengeParticipant.findMany({
          where: {
            userId: user.id,
            challengeId: { in: challenges.map(c => c.id) }
          }
        })
        participations.forEach((p) => {
          userParticipation[p.challengeId] = p
        })
      }
    }

    const enrichedChallenges = challenges.map((challenge) => ({
      ...challenge,
      participation: userParticipation[challenge.id] || null,
      leaderboard: challenge.participants.map((p, index) => ({
        ...p,
        rank: index + 1,
      }))
    }))

    return NextResponse.json({
      challenges: enrichedChallenges,
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
        sport: team.sport
      }
    })
  } catch (error) {
    console.error("Error fetching team challenges:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/teams/[slug]/challenges - Create team challenge
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const team = await prisma.team.findUnique({
      where: { slug },
      include: { sport: true }
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is team admin/owner
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId: user.id } }
    })

    if (!membership || !["OWNER", "ADMIN", "CAPTAIN"].includes(membership.role)) {
      return NextResponse.json({ error: "Only team admins can create challenges" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      imageUrl,
      startDate,
      endDate,
      targetType,
      targetValue,
      targetUnit,
      autoJoinMembers = true
    } = body

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !targetType || !targetValue || !targetUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the challenge
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        imageUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetType,
        targetValue: parseFloat(targetValue),
        targetUnit,
        scope: "TEAM",
        teamId: team.id,
        sportId: team.sportId,
        isActive: true
      },
      include: {
        sport: true,
        badge: true
      }
    })

    // Auto-join all team members if requested
    if (autoJoinMembers) {
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: team.id },
        select: { userId: true }
      })

      await prisma.challengeParticipant.createMany({
        data: teamMembers.map(member => ({
          challengeId: challenge.id,
          userId: member.userId,
          currentValue: 0
        })),
        skipDuplicates: true
      })
    }

    return NextResponse.json({
      success: true,
      challenge,
      message: autoJoinMembers
        ? "Challenge created and all team members have been added"
        : "Challenge created successfully"
    })
  } catch (error) {
    console.error("Error creating team challenge:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
