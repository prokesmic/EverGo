import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sportId = searchParams.get("sportId")
    const level = searchParams.get("level")

    const where: any = { isPublic: true }

    if (sportId) {
      where.sportId = sportId
    }

    if (level) {
      where.level = level
    }

    const plans = await prisma.trainingPlan.findMany({
      where,
      include: {
        weeks: {
          include: {
            workouts: true,
          },
        },
      },
      orderBy: [{ level: "asc" }, { duration: "asc" }],
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("Error fetching training plans:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
