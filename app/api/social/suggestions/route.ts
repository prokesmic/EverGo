import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getSuggestedAthletes } from "@/lib/discover/getSuggestedAthletes"

type FilterMode = "near" | "sport" | "fof"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, city: true, country: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Parse query params
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get("limit") || "12", 10)
    const mode = (url.searchParams.get("mode") as FilterMode) || undefined

    // Use unified scoring function with mode-based prioritization
    const suggestions = await getSuggestedAthletes(currentUser.id, {
      limit: Math.min(limit, 50), // Cap at 50
      minScore: 5,
      mode,
    })

    return NextResponse.json({
      suggestions,
      userHasCity: !!currentUser.city,
    })
  } catch (error) {
    console.error("Error fetching follow suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}
