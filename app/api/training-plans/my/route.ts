import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

// GET /api/training-plans/my - Get user's active training plans
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userPlans = await prisma.userTrainingPlan.findMany({
      where: { userId: user.id },
      include: {
        plan: {
          include: {
            weeks: {
              include: {
                workouts: {
                  orderBy: { dayOfWeek: "asc" }
                }
              },
              orderBy: { weekNumber: "asc" }
            }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    })

    // Get sport info for each plan
    const sportIds = [...new Set(userPlans.map(up => up.plan.sportId))]
    const sports = await prisma.sport.findMany({
      where: { id: { in: sportIds } }
    })
    const sportMap = new Map(sports.map(s => [s.id, s]))

    const enrichedPlans = userPlans.map(userPlan => {
      const completedWorkouts = JSON.parse(userPlan.completedWorkouts || "[]")
      const totalWorkouts = userPlan.plan.weeks.reduce((acc, week) => acc + week.workouts.length, 0)
      const completedCount = completedWorkouts.length
      const progressPercentage = totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0

      // Calculate current week's workouts
      const currentWeekData = userPlan.plan.weeks.find(w => w.weekNumber === userPlan.currentWeek)
      const currentWeekWorkouts = currentWeekData?.workouts || []
      const currentWeekCompleted = completedWorkouts.filter(
        (cw: any) => cw.weekNumber === userPlan.currentWeek
      )

      return {
        ...userPlan,
        sport: sportMap.get(userPlan.plan.sportId),
        totalWorkouts,
        completedCount,
        progressPercentage,
        completedWorkoutsList: completedWorkouts,
        currentWeekWorkouts,
        currentWeekCompleted: currentWeekCompleted.length,
        currentWeekTotal: currentWeekWorkouts.length
      }
    })

    return NextResponse.json({ userPlans: enrichedPlans })
  } catch (error) {
    console.error("Error fetching user training plans:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
