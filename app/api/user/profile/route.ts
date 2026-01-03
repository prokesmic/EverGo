import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
      },
    })

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
