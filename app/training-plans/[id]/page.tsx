import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { TrainingPlanDetail } from "@/components/training/training-plan-detail"

interface TrainingPlanPageProps {
  params: Promise<{ id: string }>
}

export default async function TrainingPlanPage({ params }: TrainingPlanPageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

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
    notFound()
  }

  // Check if user is following this plan
  let userPlan = null
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (user) {
      userPlan = await prisma.userTrainingPlan.findUnique({
        where: {
          userId_planId: {
            userId: user.id,
            planId: id,
          },
        },
      })
    }
  }

  return (
    <TrainingPlanDetail
      plan={plan}
      userPlan={userPlan}
      isAuthenticated={!!session}
    />
  )
}
