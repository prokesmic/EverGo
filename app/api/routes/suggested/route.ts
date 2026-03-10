import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getRouteSuggestions } from "@/lib/elite/route-intelligence"

type TimeWindow = "early" | "morning" | "midday" | "evening" | "night"
type Terrain = "flat" | "rolling" | "hilly" | "mixed"

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const sport = searchParams.get("sport") ?? undefined
  const timeWindow = searchParams.get("timeWindow") as TimeWindow | null
  const terrain = searchParams.get("terrain") as Terrain | null
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

  const suggestions = await getRouteSuggestions({
    userId: user.id,
    sportSlug: sport,
    timeWindow: timeWindow ?? undefined,
    terrain: terrain ?? undefined,
    limit: Number.isFinite(limit) ? limit : 10,
  })

  return NextResponse.json({ suggestions })
}
