import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { RivalryStatus } from "@prisma/client"

/**
 * GET /api/rivalries/active
 *
 * Returns active rivalries for the current user.
 * Used by CompeteNowDeck on the home page.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch active rivalries with participants
    const rivalries = await prisma.rivalry.findMany({
      where: {
        status: RivalryStatus.ACTIVE,
        participants: {
          some: { userId: user.id },
        },
      },
      include: {
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
      },
      orderBy: { windowEnd: "asc" }, // Ending soonest first
      take: 5,
    })

    // Transform to CompeteItem format
    const items = rivalries.map((rivalry) => {
      const myParticipant = rivalry.participants.find(
        (p) => p.userId === user.id
      )
      const opponent = rivalry.participants.find((p) => p.userId !== user.id)

      const myScore = myParticipant?.scoreValue ?? 0
      const theirScore = opponent?.scoreValue ?? 0
      const delta = myScore - theirScore

      return {
        kind: "rivalry" as const,
        id: rivalry.id,
        endsAt: rivalry.windowEnd.toISOString(),
        opponentName: opponent?.user.displayName || "Opponent",
        opponentAvatarUrl: opponent?.user.avatarUrl,
        sportSlug: rivalry.sportSlug,
        delta,
        myScore,
        theirScore,
        status:
          delta > 0
            ? "WINNING"
            : delta < 0
              ? "LOSING"
              : "TIED",
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching active rivalries:", error)
    return NextResponse.json(
      { error: "Failed to fetch active rivalries" },
      { status: 500 }
    )
  }
}
