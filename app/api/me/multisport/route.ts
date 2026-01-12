import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getMultiSportIndex } from "@/lib/metrics/multisportIndex"

/**
 * GET /api/me/multisport
 *
 * V11: Returns the user's MultiSport Index (Podium Points)
 *
 * Query params:
 * - range: "week" | "month" | "year" | "all" (default: "all")
 * - refresh: "true" to force recomputation
 */
export async function GET(req: Request) {
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

    const url = new URL(req.url)
    const range = (url.searchParams.get("range") ?? "all") as "week" | "month" | "year" | "all"
    const refresh = url.searchParams.get("refresh") === "true"

    // Get MultiSport Index
    const result = await getMultiSportIndex(user.id, {
      range,
      forceRefresh: refresh,
    })

    // Update UserStats if refreshed
    if (refresh) {
      await prisma.userStats.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          multisportIndex: result.index,
          eligibleSportsCount: result.eligibleSports,
        },
        update: {
          multisportIndex: result.index,
          eligibleSportsCount: result.eligibleSports,
        },
      })
    }

    return NextResponse.json({
      index: result.index,
      sports: result.sports,
      eligibleSports: result.eligibleSports,
      varietyBonus: result.varietyBonus,
      range,
    })
  } catch (error) {
    console.error("[multisport] Error:", error)
    return NextResponse.json(
      { error: "Failed to compute MultiSport Index" },
      { status: 500 }
    )
  }
}
