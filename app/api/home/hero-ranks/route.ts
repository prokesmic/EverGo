import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getHeroRankLensSnapshot } from "@/lib/rankings/hero-rank-lens"
import { z } from "zod"

const requestSchema = z.object({
  sportId: z.string().min(1),
  benchmarkId: z.string().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse body
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { sportId, benchmarkId } = parsed.data

    // Get user ID from session (assuming it's stored in session)
    // If not, we need to fetch from DB
    const userId = (session.user as any).id

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      )
    }

    // Fetch the snapshot
    const snapshot = await getHeroRankLensSnapshot({
      userId,
      sportId,
      benchmarkId,
    })

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error("Hero ranks API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
