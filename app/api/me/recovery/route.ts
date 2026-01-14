import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  getRecoveryModeStatus,
  activateRecoveryMode,
  deactivateRecoveryMode,
  RECOVERY_CONFIG,
} from "@/lib/competition/recoveryMode"

/**
 * GET /api/me/recovery
 *
 * V11: Returns the user's recovery mode status
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

    const status = await getRecoveryModeStatus(user.id)

    return NextResponse.json({
      ...status,
      config: {
        minDurationDays: RECOVERY_CONFIG.minDurationDays,
        maxDurationDays: RECOVERY_CONFIG.maxDurationDays,
        maxUsesPerSeason: RECOVERY_CONFIG.maxUsesPerSeason,
        cooldownDays: RECOVERY_CONFIG.cooldownDays,
      },
    })
  } catch (error) {
    console.error("[recovery] Error:", error)
    return NextResponse.json(
      { error: "Failed to get recovery mode status" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/me/recovery
 *
 * V11: Activate recovery mode
 *
 * Body:
 * - durationDays: number (3-14)
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const durationDays = body.durationDays ?? RECOVERY_CONFIG.minDurationDays

    const result = await activateRecoveryMode(user.id, durationDays)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, activated: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      activated: true,
      recoveryEndsAt: result.recoveryEndsAt,
    })
  } catch (error) {
    console.error("[recovery] Activation error:", error)
    return NextResponse.json(
      { error: "Failed to activate recovery mode" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/me/recovery
 *
 * V11: Deactivate recovery mode early
 */
export async function DELETE() {
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

    const result = await deactivateRecoveryMode(user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, deactivated: false },
        { status: 400 }
      )
    }

    return NextResponse.json({ deactivated: true })
  } catch (error) {
    console.error("[recovery] Deactivation error:", error)
    return NextResponse.json(
      { error: "Failed to deactivate recovery mode" },
      { status: 500 }
    )
  }
}
