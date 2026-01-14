import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  getVerificationLadderStatus,
  getVerificationStats,
  upgradeVerificationTier,
} from "@/lib/verification/ladder"

/**
 * GET /api/me/verification
 *
 * V11: Returns the user's verification ladder status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [ladderStatus, stats] = await Promise.all([
      getVerificationLadderStatus(user.id),
      getVerificationStats(user.id),
    ])

    return NextResponse.json({
      ...ladderStatus,
      stats,
    })
  } catch (error) {
    console.error("[verification] Error:", error)
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/me/verification
 *
 * V11: Attempt to upgrade verification tier
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const result = await upgradeVerificationTier(user.id)

    if (!result.upgraded) {
      return NextResponse.json(
        { error: "Not eligible for upgrade", upgraded: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      upgraded: true,
      previousTier: result.previousTier,
      newTier: result.newTier,
    })
  } catch (error) {
    console.error("[verification] Upgrade error:", error)
    return NextResponse.json(
      { error: "Failed to upgrade verification tier" },
      { status: 500 }
    )
  }
}
