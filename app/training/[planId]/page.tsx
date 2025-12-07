"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  Trophy,
  Users,
  Play,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Flame
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WeeklySchedule } from "@/components/training/weekly-schedule"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ planId: string }>
}

export default function TrainingPlanDetailPage({ params }: PageProps) {
  const { planId } = use(params)
  const router = useRouter()
  const { data: session } = useSession()

  const [plan, setPlan] = useState<any>(null)
  const [userPlan, setUserPlan] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set())
  const [sport, setSport] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch plan details
        const planRes = await fetch(`/api/training-plans/${planId}`)
        const planData = await planRes.json()
        setPlan(planData.plan)

        // Fetch sport info
        if (planData.plan?.sportId) {
          const sportsRes = await fetch("/api/sports")
          const sportsData = await sportsRes.json()
          const foundSport = sportsData.sports?.find((s: any) => s.id === planData.plan.sportId)
          setSport(foundSport)
        }

        // Fetch user's enrollment if logged in
        if (session?.user) {
          const userPlansRes = await fetch("/api/training-plans/my")
          const userPlansData = await userPlansRes.json()
          const enrolled = userPlansData.userPlans?.find((up: any) => up.planId === planId)
          setUserPlan(enrolled)

          // Auto-expand current week
          if (enrolled) {
            setExpandedWeeks(new Set([enrolled.currentWeek]))
          }
        }
      } catch (error) {
        console.error("Error fetching training plan:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [planId, session])

  const handleEnroll = async () => {
    if (!session?.user) {
      toast.error("Please sign in to enroll")
      return
    }

    setIsEnrolling(true)
    try {
      const res = await fetch(`/api/training-plans/${planId}/follow`, {
        method: "POST"
      })
      const data = await res.json()

      if (data.userPlan) {
        toast.success("Successfully enrolled! Let's start training!")
        // Refresh user plan
        const userPlansRes = await fetch("/api/training-plans/my")
        const userPlansData = await userPlansRes.json()
        const enrolled = userPlansData.userPlans?.find((up: any) => up.planId === planId)
        setUserPlan(enrolled)
        setExpandedWeeks(new Set([1]))
      } else if (data.error) {
        toast.error(data.error)
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      toast.error("Failed to enroll")
    } finally {
      setIsEnrolling(false)
    }
  }

  const handleCompleteWorkout = async (weekNumber: number, dayOfWeek: number) => {
    if (!userPlan) return

    try {
      const res = await fetch(`/api/training-plans/my/${userPlan.id}/workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber, dayOfWeek })
      })
      const data = await res.json()

      if (data.success) {
        toast.success(data.message)
        // Refresh user plan
        const userPlansRes = await fetch("/api/training-plans/my")
        const userPlansData = await userPlansRes.json()
        const enrolled = userPlansData.userPlans?.find((up: any) => up.planId === planId)
        setUserPlan(enrolled)
      } else {
        toast.error(data.error || "Failed to mark workout complete")
      }
    } catch (error) {
      console.error("Error completing workout:", error)
      toast.error("Failed to mark workout complete")
    }
  }

  const handleUncompleteWorkout = async (weekNumber: number, dayOfWeek: number) => {
    if (!userPlan) return

    try {
      const res = await fetch(`/api/training-plans/my/${userPlan.id}/workout`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekNumber, dayOfWeek })
      })
      const data = await res.json()

      if (data.success) {
        toast.success("Workout unmarked")
        // Refresh user plan
        const userPlansRes = await fetch("/api/training-plans/my")
        const userPlansData = await userPlansRes.json()
        const enrolled = userPlansData.userPlans?.find((up: any) => up.planId === planId)
        setUserPlan(enrolled)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const toggleWeekExpanded = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber)
    } else {
      newExpanded.add(weekNumber)
    }
    setExpandedWeeks(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Plan not found</h2>
          <Link href="/training">
            <Button>Back to Training Plans</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const totalWorkouts = plan.weeks?.reduce(
    (acc: number, week: any) => acc + (week.workouts?.length || 0),
    0
  ) || 0

  const completedWorkouts = userPlan?.completedWorkoutsList || []
  const progressPercentage = userPlan?.progressPercentage || 0

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-700"
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-700"
      case "ADVANCED":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      {/* Hero Header */}
      <div className="h-64 bg-gradient-to-r from-brand-blue to-blue-600 relative">
        {plan.imageUrl && (
          <img
            src={plan.imageUrl}
            alt={plan.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <Link
          href="/training"
          className="absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </Link>

        {/* Sport Icon */}
        <div className="absolute top-4 right-4 text-5xl opacity-80">
          {sport?.icon || "🏃"}
        </div>

        {/* Title */}
        <div className="absolute bottom-6 left-6 right-6">
          <Badge className={cn("mb-2", getLevelColor(plan.level))}>
            {plan.level.charAt(0) + plan.level.slice(1).toLowerCase()}
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">{plan.name}</h1>
          <p className="text-white/80 max-w-2xl">{plan.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-brand-primary" />
                <p className="text-2xl font-bold text-text-primary">{plan.duration}</p>
                <p className="text-xs text-text-muted">Weeks</p>
              </Card>
              <Card className="p-4 text-center">
                <Dumbbell className="w-6 h-6 mx-auto mb-2 text-brand-primary" />
                <p className="text-2xl font-bold text-text-primary">{totalWorkouts}</p>
                <p className="text-xs text-text-muted">Workouts</p>
              </Card>
              <Card className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-brand-primary" />
                <p className="text-2xl font-bold text-text-primary">{plan._count?.userPlans || 0}</p>
                <p className="text-xs text-text-muted">Enrolled</p>
              </Card>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-text-primary">Weekly Schedule</h2>

              {plan.weeks?.map((week: any) => {
                const isExpanded = expandedWeeks.has(week.weekNumber)
                const isCurrentWeek = userPlan?.currentWeek === week.weekNumber

                return (
                  <div key={week.id}>
                    {/* Week Header - Collapsible */}
                    <button
                      onClick={() => toggleWeekExpanded(week.weekNumber)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border transition-all",
                        isCurrentWeek
                          ? "bg-brand-primary/10 border-brand-primary"
                          : "bg-white border-border-light hover:border-brand-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          isCurrentWeek ? "bg-brand-primary text-white" : "bg-surface-secondary text-text-primary"
                        )}>
                          {week.weekNumber}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-text-primary">
                            Week {week.weekNumber}
                            {week.title && ` - ${week.title}`}
                          </p>
                          <p className="text-sm text-text-muted">
                            {week.workouts?.length || 0} workouts
                            {isCurrentWeek && (
                              <Badge className="ml-2 bg-brand-primary text-white text-xs">
                                Current
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                      )}
                    </button>

                    {/* Week Content */}
                    {isExpanded && userPlan && (
                      <div className="mt-4">
                        <WeeklySchedule
                          weekNumber={week.weekNumber}
                          totalWeeks={plan.duration}
                          weekTitle={week.title}
                          weekDescription={week.description}
                          workouts={week.workouts || []}
                          completedWorkouts={completedWorkouts}
                          onCompleteWorkout={(dayOfWeek) => handleCompleteWorkout(week.weekNumber, dayOfWeek)}
                          onUncompleteWorkout={(dayOfWeek) => handleUncompleteWorkout(week.weekNumber, dayOfWeek)}
                          startDate={new Date(userPlan.startDate)}
                          isCurrentWeek={isCurrentWeek}
                        />
                      </div>
                    )}

                    {/* Show preview if not enrolled */}
                    {isExpanded && !userPlan && (
                      <Card className="mt-4 p-6 text-center bg-surface-secondary">
                        <p className="text-text-muted mb-4">
                          Enroll in this plan to track your progress
                        </p>
                        <Button onClick={handleEnroll} disabled={isEnrolling}>
                          {isEnrolling ? "Enrolling..." : "Start This Plan"}
                        </Button>
                      </Card>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="overflow-hidden">
              {userPlan ? (
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-600">Enrolled</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-bold text-text-primary">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-surface-secondary rounded-lg">
                      <p className="text-2xl font-bold text-text-primary">
                        {completedWorkouts.length}
                      </p>
                      <p className="text-xs text-text-muted">Completed</p>
                    </div>
                    <div className="p-3 bg-surface-secondary rounded-lg">
                      <p className="text-2xl font-bold text-text-primary">
                        {totalWorkouts - completedWorkouts.length}
                      </p>
                      <p className="text-xs text-text-muted">Remaining</p>
                    </div>
                  </div>

                  <div className="p-3 bg-brand-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-brand-primary">
                      <Flame className="w-5 h-5" />
                      <span className="font-medium">Week {userPlan.currentWeek}</span>
                    </div>
                    <p className="text-sm text-text-muted mt-1">
                      {userPlan.currentWeekCompleted}/{userPlan.currentWeekTotal} workouts this week
                    </p>
                  </div>

                  {userPlan.status === "COMPLETED" && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <p className="font-bold text-green-700">Plan Completed!</p>
                      <p className="text-sm text-green-600">Great job finishing this plan!</p>
                    </div>
                  )}
                </CardContent>
              ) : (
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-text-primary mb-2">Ready to start?</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Follow this plan to track your workouts and reach your goals.
                  </p>
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling || !session?.user}
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark"
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start This Plan
                      </>
                    )}
                  </Button>
                  {!session?.user && (
                    <p className="text-xs text-text-muted text-center mt-2">
                      Please sign in to enroll
                    </p>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Plan Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-muted">Sport</span>
                  <span className="font-medium">{sport?.name || "General"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Level</span>
                  <Badge className={getLevelColor(plan.level)}>
                    {plan.level.charAt(0) + plan.level.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Duration</span>
                  <span className="font-medium">{plan.duration} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Workouts</span>
                  <span className="font-medium">{totalWorkouts} total</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
