import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      displayName,
      username,
      bio,
      city,
      country,
      countryCode,
      countryName,
      cityId,
      cityName,
      gender,
      avatarUrl,
      coverPhotoUrl,
      primarySportId,
    } = body

    // Find current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If username is being updated, check if it's already taken
    if (username && username !== currentUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    // If primarySportId is changing, also update UserSport priorities
    // This syncs User.primarySportId with UserSport.priority system
    if (primarySportId !== undefined && primarySportId !== currentUser.primarySportId) {
      const newPrimarySportId = primarySportId === "" ? null : primarySportId

      if (newPrimarySportId) {
        // Find or create the UserSport record for this sport
        let userSport = await prisma.userSport.findFirst({
          where: {
            userId: currentUser.id,
            sportId: newPrimarySportId,
          },
        })

        if (!userSport) {
          // User doesn't have this sport - create it as primary
          // First, shift all existing sports down by 1
          await prisma.userSport.updateMany({
            where: {
              userId: currentUser.id,
              status: "ACTIVE",
            },
            data: { priority: { increment: 1 } },
          })

          // Create new UserSport with priority 0 (primary)
          userSport = await prisma.userSport.create({
            data: {
              userId: currentUser.id,
              sportId: newPrimarySportId,
              status: "ACTIVE",
              priority: 0,
            },
          })
        } else if (userSport.status !== "ACTIVE") {
          // Reactivate inactive sport and make primary
          await prisma.$transaction(async (tx) => {
            // Shift all active sports down
            await tx.userSport.updateMany({
              where: {
                userId: currentUser.id,
                status: "ACTIVE",
              },
              data: { priority: { increment: 1 } },
            })

            // Reactivate and set as primary
            await tx.userSport.update({
              where: { id: userSport!.id },
              data: { status: "ACTIVE", priority: 0 },
            })
          })
        } else if (userSport.priority !== 0) {
          // Sport exists and is active, just need to make it primary
          await prisma.$transaction(async (tx) => {
            // Increment priority of all sports that have priority < this sport's priority
            await tx.userSport.updateMany({
              where: {
                userId: currentUser.id,
                status: "ACTIVE",
                priority: { lt: userSport!.priority ?? 999, gte: 0 },
              },
              data: { priority: { increment: 1 } },
            })

            // Set this sport as primary (priority = 0)
            await tx.userSport.update({
              where: { id: userSport!.id },
              data: { priority: 0 },
            })
          })
        }
        // If userSport exists and already has priority 0, no changes needed
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(countryCode !== undefined && { countryCode }),
        ...(countryName !== undefined && { countryName }),
        ...(cityId !== undefined && { cityId }),
        ...(cityName !== undefined && { cityName }),
        ...(gender !== undefined && { gender }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(coverPhotoUrl !== undefined && { coverPhotoUrl }),
        // Handle primarySportId - empty string means clear, otherwise set
        ...(primarySportId !== undefined && {
          primarySportId: primarySportId === "" ? null : primarySportId,
        }),
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        city: true,
        country: true,
        countryCode: true,
        countryName: true,
        cityId: true,
        cityName: true,
        gender: true,
        primarySportId: true,
      },
    })

    // Revalidate pages that depend on primary sport
    revalidatePath("/home")
    revalidatePath("/profile/[username]", "page")
    revalidatePath("/settings/profile")

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverPhotoUrl: true,
        city: true,
        country: true,
        dateOfBirth: true,
        gender: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}
