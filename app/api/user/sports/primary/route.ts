import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST - Set a sport as primary (priority = 0)
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

    const { sportId } = await request.json()

    if (!sportId) {
      return NextResponse.json({ error: "Sport ID required" }, { status: 400 })
    }

    // Check if user has this sport and it's active
    const userSport = await prisma.userSport.findFirst({
      where: {
        userId: user.id,
        sportId: sportId,
        status: "ACTIVE"
      }
    })

    if (!userSport) {
      return NextResponse.json({ error: "Active sport not in your profile" }, { status: 404 })
    }

    // If it's already primary (priority 0), nothing to do
    if (userSport.priority === 0) {
      return NextResponse.json({ success: true })
    }

    // Transaction to update priorities
    await prisma.$transaction(async (tx) => {
      // Increment priority of all sports that have priority < current sport's priority
      // (they will shift down by 1)
      await tx.userSport.updateMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
          priority: { lt: userSport.priority ?? 999, gte: 0 },
        },
        data: { priority: { increment: 1 } },
      })

      // Set this sport as primary
      await tx.userSport.update({
        where: { id: userSport.id },
        data: { priority: 0 },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting primary sport:", error)
    return NextResponse.json({ error: "Failed to set primary sport" }, { status: 500 })
  }
}
