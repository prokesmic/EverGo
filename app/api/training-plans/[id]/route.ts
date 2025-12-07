import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        weeks: {
          include: {
            workouts: {
              orderBy: { dayOfWeek: "asc" },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Training plan not found" }, { status: 404 })
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error fetching training plan:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
