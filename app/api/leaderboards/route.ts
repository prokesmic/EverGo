import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { getLeaderboard, getUserTeams, getUserLocationInfo, type ScopeInput } from "@/lib/leaderboards"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const url = new URL(req.url)
    const metricKey = url.searchParams.get("metricKey") ?? "activity:score"
    const scope = url.searchParams.get("scope") ?? "GLOBAL"
    const teamId = url.searchParams.get("teamId") ?? undefined
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "20")))

    // Parse scope input
    let scopeInput: ScopeInput
    switch (scope) {
      case "COUNTRY":
        scopeInput = { scope: "COUNTRY" }
        break
      case "CITY":
        scopeInput = { scope: "CITY" }
        break
      case "TEAM":
        if (!teamId) {
          return NextResponse.json({ error: "teamId required for TEAM scope" }, { status: 400 })
        }
        scopeInput = { scope: "TEAM", teamId }
        break
      default:
        scopeInput = { scope: "GLOBAL" }
    }

    const data = await getLeaderboard({
      viewerId: user.id,
      metricKey,
      scope: scopeInput,
      limit,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leaderboards/context
 * Returns user's teams and location info for scope selection
 */
export async function POST(req: Request) {
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

    const [teams, locationInfo] = await Promise.all([
      getUserTeams(user.id),
      getUserLocationInfo(user.id),
    ])

    return NextResponse.json({
      teams,
      locationInfo,
    })
  } catch (error) {
    console.error("Leaderboard context error:", error)
    return NextResponse.json(
      { error: "Failed to fetch context" },
      { status: 500 }
    )
  }
}
