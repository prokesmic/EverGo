import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: planId } = await params

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if plan exists
    const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } })
    if (!plan) {
      return NextResponse.json({ error: "Training plan not found" }, { status: 404 })
    }

    // Check if user already follows this plan
    const existing = await prisma.userTrainingPlan.findUnique({
      where: {
        userId_planId: {
          userId: user.id,
          planId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "You are already following this plan" },
        { status: 400 }
      )
    }

    // Create user training plan
    const userPlan = await prisma.userTrainingPlan.create({
      data: {
        userId: user.id,
        planId,
        startDate: new Date(),
        currentWeek: 1,
        status: "ACTIVE",
        completedWorkouts: "[]",
      },
    })

    return NextResponse.json({ userPlan })
  } catch (error) {
    console.error("Error following training plan:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
