import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

// POST /api/training-plans/my/[userPlanId]/workout - Mark workout as complete
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userPlanId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userPlanId } = await params

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's training plan
    const userPlan = await prisma.userTrainingPlan.findUnique({
      where: { id: userPlanId },
      include: {
        plan: {
          include: {
            weeks: {
              include: { workouts: true },
              orderBy: { weekNumber: "asc" }
            }
          }
        }
      }
    })

    if (!userPlan || userPlan.userId !== user.id) {
      return NextResponse.json({ error: "Training plan not found" }, { status: 404 })
    }

    const body = await request.json()
    const { weekNumber, dayOfWeek, activityId } = body

    // Validate workout exists
    const weekData = userPlan.plan.weeks.find(w => w.weekNumber === weekNumber)
    const workoutExists = weekData?.workouts.some(w => w.dayOfWeek === dayOfWeek)

    if (!workoutExists) {
      return NextResponse.json({ error: "Workout not found in plan" }, { status: 400 })
    }

    // Parse existing completed workouts
    const completedWorkouts = JSON.parse(userPlan.completedWorkouts || "[]")

    // Check if already completed
    const alreadyCompleted = completedWorkouts.some(
      (cw: any) => cw.weekNumber === weekNumber && cw.dayOfWeek === dayOfWeek
    )

    if (alreadyCompleted) {
      return NextResponse.json({ error: "Workout already completed" }, { status: 400 })
    }

    // Add to completed workouts
    completedWorkouts.push({
      weekNumber,
      dayOfWeek,
      activityId: activityId || null,
      completedAt: new Date().toISOString()
    })

    // Calculate if we should advance to next week
    const currentWeekWorkouts = weekData?.workouts || []
    const currentWeekCompleted = completedWorkouts.filter(
      (cw: any) => cw.weekNumber === weekNumber
    )

    let newCurrentWeek = userPlan.currentWeek
    let newStatus = userPlan.status
    let completedAt = null

    // If all workouts in current week are done, advance to next week
    if (currentWeekCompleted.length >= currentWeekWorkouts.length && weekNumber === userPlan.currentWeek) {
      const nextWeek = userPlan.plan.weeks.find(w => w.weekNumber === weekNumber + 1)
      if (nextWeek) {
        newCurrentWeek = weekNumber + 1
      } else {
        // Plan completed!
        newStatus = "COMPLETED"
        completedAt = new Date()
      }
    }

    // Update user plan
    const updatedPlan = await prisma.userTrainingPlan.update({
      where: { id: userPlanId },
      data: {
        completedWorkouts: JSON.stringify(completedWorkouts),
        currentWeek: newCurrentWeek,
        status: newStatus,
        completedAt
      }
    })

    return NextResponse.json({
      success: true,
      userPlan: updatedPlan,
      message: newStatus === "COMPLETED" ? "Congratulations! You completed the training plan!" : "Workout marked as complete"
    })
  } catch (error) {
    console.error("Error marking workout complete:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/training-plans/my/[userPlanId]/workout - Unmark workout
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userPlanId: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userPlanId } = await params

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userPlan = await prisma.userTrainingPlan.findUnique({
      where: { id: userPlanId }
    })

    if (!userPlan || userPlan.userId !== user.id) {
      return NextResponse.json({ error: "Training plan not found" }, { status: 404 })
    }

    const body = await request.json()
    const { weekNumber, dayOfWeek } = body

    const completedWorkouts = JSON.parse(userPlan.completedWorkouts || "[]")
    const filteredWorkouts = completedWorkouts.filter(
      (cw: any) => !(cw.weekNumber === weekNumber && cw.dayOfWeek === dayOfWeek)
    )

    const updatedPlan = await prisma.userTrainingPlan.update({
      where: { id: userPlanId },
      data: {
        completedWorkouts: JSON.stringify(filteredWorkouts),
        status: "ACTIVE",
        completedAt: null
      }
    })

    return NextResponse.json({ success: true, userPlan: updatedPlan })
  } catch (error) {
    console.error("Error unmarking workout:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
