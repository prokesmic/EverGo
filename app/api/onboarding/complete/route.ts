import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
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
      distanceGoal,
      city,
      country,
      followedUsers,
      joinedCommunities,
    } = data

    // Update user profile with location
    await prisma.user.update({
      where: { id: user.id },
      data: {
        city: city || user.city,
        country: country || user.country,
      },
    })

    // Add selected sports
    if (selectedSports && selectedSports.length > 0) {
      // Delete existing sports first
      await prisma.userSport.deleteMany({
        where: { userId: user.id },
      })

      // Add new sports
      await prisma.userSport.createMany({
        data: selectedSports.map((sportId: string, index: number) => ({
          userId: user.id,
          sportId,
          isPrimary: index === 0, // First sport is primary
        })),
        skipDuplicates: true,
      })
    }

    // Initialize or update streak settings
    await prisma.userStreak.upsert({
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

    // Follow suggested users
    if (followedUsers && followedUsers.length > 0) {
      await prisma.follow.createMany({
        data: followedUsers.map((followingId: string) => ({
          followerId: user.id,
          followingId,
        })),
        skipDuplicates: true,
      })
    }

    // Join communities
    if (joinedCommunities && joinedCommunities.length > 0) {
      await prisma.communityMember.createMany({
        data: joinedCommunities.map((communityId: string) => ({
          userId: user.id,
          communityId,
          role: "MEMBER",
        })),
        skipDuplicates: true,
      })

      // Update community member counts
      for (const communityId of joinedCommunities) {
        await prisma.community.update({
          where: { id: communityId },
          data: {
            memberCount: {
              increment: 1,
            },
          },
        })
      }
    }

    // TODO: Mark onboarding as completed
    // Add onboardingCompleted: true field to User model
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { onboardingCompleted: true },
    // })

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
