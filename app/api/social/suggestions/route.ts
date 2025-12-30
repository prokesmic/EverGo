import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { getSuggestedAthletes } from "@/lib/discover/getSuggestedAthletes"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Parse limit from query params (default 12)
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get("limit") || "12", 10)

    // Use unified scoring function
    const suggestions = await getSuggestedAthletes(currentUser.id, {
      limit: Math.min(limit, 50), // Cap at 50
      minScore: 5,
    })

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching follow suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}
