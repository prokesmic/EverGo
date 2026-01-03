import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST - Add a sport to user's profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { sportId, skillLevel } = await request.json()

    if (!sportId) {
      return NextResponse.json({ error: "Sport ID required" }, { status: 400 })
    }

    // Check if sport exists
    const sport = await prisma.sport.findUnique({
      where: { id: sportId }
    })

    if (!sport) {
      return NextResponse.json({ error: "Sport not found" }, { status: 404 })
    }

    // Check if user already has this sport
    const existing = await prisma.userSport.findUnique({
      where: {
        userId_sportId: {
          userId: user.id,
          sportId: sportId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Sport already added" }, { status: 400 })
    }

    // Get the next priority (this will be the first if no sports exist, making it priority 0 = primary)
    const maxPriority = await prisma.userSport.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { priority: "desc" },
      select: { priority: true }
    })

    const nextPriority = maxPriority?.priority != null ? maxPriority.priority + 1 : 0

    const userSport = await prisma.userSport.create({
      data: {
        userId: user.id,
        sportId: sportId,
        skillLevel: skillLevel || null,
        status: "ACTIVE",
        priority: nextPriority,
      }
    })

    return NextResponse.json(userSport)
  } catch (error) {
    console.error("Error adding sport:", error)
    return NextResponse.json({ error: "Failed to add sport" }, { status: 500 })
  }
}

// PATCH - Update a user sport (skill level)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { userSportId, skillLevel } = await request.json()

    if (!userSportId) {
      return NextResponse.json({ error: "UserSport ID required" }, { status: 400 })
    }

    // Verify ownership
    const userSport = await prisma.userSport.findFirst({
      where: {
        id: userSportId,
        userId: user.id
      }
    })

    if (!userSport) {
      return NextResponse.json({ error: "Sport not found" }, { status: 404 })
    }

    const updated = await prisma.userSport.update({
      where: { id: userSportId },
      data: { skillLevel }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating sport:", error)
    return NextResponse.json({ error: "Failed to update sport" }, { status: 500 })
  }
}

// DELETE - Remove a sport from user's profile
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const userSportId = searchParams.get("id")

    if (!userSportId) {
      return NextResponse.json({ error: "UserSport ID required" }, { status: 400 })
    }

    // Verify ownership
    const userSport = await prisma.userSport.findFirst({
      where: {
        id: userSportId,
        userId: user.id
      }
    })

    if (!userSport) {
      return NextResponse.json({ error: "Sport not found" }, { status: 404 })
    }

    await prisma.userSport.delete({
      where: { id: userSportId }
    })

    // Recompute priorities for remaining active sports
    const remainingActive = await prisma.userSport.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { priority: "asc" }
    })

    await prisma.$transaction(
      remainingActive.map((sport, index) =>
        prisma.userSport.update({
          where: { id: sport.id },
          data: { priority: index }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing sport:", error)
    return NextResponse.json({ error: "Failed to remove sport" }, { status: 500 })
  }
}
