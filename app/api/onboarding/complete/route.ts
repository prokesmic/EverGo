import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
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

    const data = await request.json()
    const {
      selectedSports,
      weeklyGoal,
      city,
      country,
      followedUsers,
      joinedCommunities,
    } = data

    const normalizedSports: string[] = Array.isArray(selectedSports)
      ? [...new Set(selectedSports.filter((sportId: unknown): sportId is string => typeof sportId === "string" && sportId.length > 0))]
      : []

    const normalizedFollowedUsers: string[] = Array.isArray(followedUsers)
      ? [...new Set(followedUsers.filter((id: unknown): id is string => typeof id === "string" && id.length > 0 && id !== user.id))]
      : []

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          city: city || user.city,
          country: country || user.country,
          onboardingCompleted: true,
          primarySportId: normalizedSports[0] ?? user.primarySportId,
        },
      })

      if (normalizedSports.length > 0) {
        await tx.userSport.deleteMany({
          where: { userId: user.id },
        })

        await tx.userSport.createMany({
          data: normalizedSports.map((sportId, index) => ({
            userId: user.id,
            sportId,
            priority: index,
            status: "ACTIVE",
          })),
          skipDuplicates: true,
        })
      }

      await tx.userStreak.upsert({
        where: { userId: user.id },
        update: {
          weeklyGoal: weeklyGoal || 3,
        },
        create: {
          userId: user.id,
          weeklyGoal: weeklyGoal || 3,
          currentStreak: 0,
          longestStreak: 0,
          weeklyStreak: 0,
          weeklyProgress: 0,
        },
      })

      if (normalizedFollowedUsers.length > 0) {
        await tx.follow.createMany({
          data: normalizedFollowedUsers.map((followingId) => ({
            followerId: user.id,
            followingId,
          })),
          skipDuplicates: true,
        })
      }
    })

    // Communities removed in V6
    void joinedCommunities

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    })
  } catch (error) {
    console.error("Onboarding completion error:", error)
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
