import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { TrainingPlansList } from "@/components/training/training-plans-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function TrainingPlansPage() {
  const session = await getServerSession(authOptions)

  const plans = await prisma.trainingPlan.findMany({
    where: { isPublic: true },
    include: {
      weeks: {
        include: {
          workouts: true,
        },
      },
    },
    orderBy: [{ level: "asc" }, { duration: "asc" }],
  })

  const sports = await prisma.sport.findMany({
    orderBy: { name: "asc" },
  })

  // Get user's active plans
  let userPlans: any[] = []
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (user) {
      userPlans = await prisma.userTrainingPlan.findMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        include: {
          plan: true,
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-text-primary mb-2">Training Plans</h1>
          <p className="text-text-muted text-lg">
            Structured training programs to help you reach your fitness goals
          </p>
        </div>

        {userPlans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Your Active Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPlans.map((userPlan) => (
                <Card key={userPlan.id} className="border-brand-primary/50">
                  <CardHeader>
                    <CardTitle>{userPlan.plan.name}</CardTitle>
                    <CardDescription>
                      Week {userPlan.currentWeek} of {userPlan.plan.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        Started: {new Date(userPlan.startDate).toLocaleDateString()}
                      </span>
                      <a
                        href={`/training-plans/${userPlan.plan.id}`}
                        className="text-brand-primary hover:underline font-semibold"
                      >
                        View Plan →
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <TrainingPlansList plans={plans} sports={sports} />
      </div>
    </div>
  )
}
