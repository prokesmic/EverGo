import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getUserMoments, dismissMoment, celebrateMoment } from "@/lib/moments/detect"

/**
 * GET /api/me/moments
 *
 * V11: Returns the user's recent moments
 *
 * Query params:
 * - limit: number (default 10)
 * - includeDissmissed: boolean (default false)
 */
export async function GET(req: NextRequest) {
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

    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10")
    const includeDissmissed = req.nextUrl.searchParams.get("includeDissmissed") === "true"

    const moments = await getUserMoments(user.id, { limit, includeDissmissed })

    return NextResponse.json({ moments })
  } catch (error) {
    console.error("[moments] Error:", error)
    return NextResponse.json(
      { error: "Failed to get moments" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/me/moments
 *
 * V11: Dismiss or celebrate a moment
 *
 * Body:
 * - momentId: string
 * - action: "dismiss" | "celebrate"
 */
export async function PATCH(req: NextRequest) {
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
    const { momentId, action } = body

    if (!momentId || !action) {
      return NextResponse.json(
        { error: "Missing momentId or action" },
        { status: 400 }
      )
    }

    if (action === "dismiss") {
      await dismissMoment(momentId, user.id)
    } else if (action === "celebrate") {
      await celebrateMoment(momentId, user.id)
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'dismiss' or 'celebrate'" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[moments] Update error:", error)
    return NextResponse.json(
      { error: "Failed to update moment" },
      { status: 500 }
    )
  }
}
