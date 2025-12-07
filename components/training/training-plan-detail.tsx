"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Trophy,
  Calendar,
  Target,
  TrendingUp,
  Loader2,
  Check,
  Clock,
  Flame,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TrainingPlanDetailProps {
  plan: any
  userPlan: any
  isAuthenticated: boolean
}

export function TrainingPlanDetail({ plan, userPlan, isAuthenticated }: TrainingPlanDetailProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow training plans")
      router.push("/login")
      return
    }

    setIsFollowing(true)
    try {
      const response = await fetch(`/api/training-plans/${plan.id}/follow`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to follow training plan")
      }

      toast.success("Successfully started training plan!")
      router.refresh()
    } catch (error: any) {
      console.error("Error following training plan:", error)
      toast.error(error.message || "Failed to follow training plan")
    } finally {
      setIsFollowing(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-700 border-green-300"
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "ADVANCED":
        return "bg-purple-100 text-purple-700 border-purple-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  const getLevelLabel = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase()
  }

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case "EASY":
        return <Clock className="w-4 h-4" />
      case "MODERATE":
        return <Zap className="w-4 h-4" />
      case "HARD":
      case "RACE_PACE":
        return <Flame className="w-4 h-4" />
      default:
        return null
    }
  }

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "EASY":
        return "text-green-600 bg-green-50"
      case "MODERATE":
        return "text-orange-600 bg-orange-50"
      case "HARD":
      case "RACE_PACE":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getDayName = (dayOfWeek: number) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[dayOfWeek]
  }

  const totalWorkouts = plan.weeks.reduce(
    (sum: number, week: any) => sum + week.workouts.length,
    0
  )

  const completedWorkouts = userPlan
    ? JSON.parse(userPlan.completedWorkouts || "[]").length
    : 0

  const progressPercentage = userPlan
    ? Math.round((completedWorkouts / totalWorkouts) * 100)
    : 0

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-black text-text-primary">{plan.name}</h1>
                <Badge variant="outline" className={getLevelColor(plan.level)}>
                  {getLevelLabel(plan.level)}
                </Badge>
              </div>
              <p className="text-text-muted text-lg">{plan.description}</p>
            </div>
          </div>

          {/* Plan Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-primary/10 rounded-lg">
                    <Calendar className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Duration</p>
                    <p className="text-xl font-bold text-text-primary">{plan.duration} weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Workouts</p>
                    <p className="text-xl font-bold text-text-primary">{totalWorkouts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {userPlan && (
              <>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Current Week</p>
                        <p className="text-xl font-bold text-text-primary">
                          Week {userPlan.currentWeek}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Progress</p>
                        <p className="text-xl font-bold text-text-primary">{progressPercentage}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Progress Bar (if following) */}
          {userPlan && (
            <Card className="mb-6 border-brand-primary bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-text-primary">
                      {completedWorkouts} of {totalWorkouts} workouts completed
                    </span>
                    <span className="text-text-muted">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow Button */}
          {!userPlan && (
            <Button onClick={handleFollow} disabled={isFollowing} size="lg" className="w-full md:w-auto">
              {isFollowing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Plan...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Start Training Plan
                </>
              )}
            </Button>
          )}
        </div>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-primary" />
              Training Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={`week-${userPlan?.currentWeek || 1}`} className="w-full">
              <TabsList className="w-full flex-wrap h-auto gap-2">
                {plan.weeks.map((week: any) => (
                  <TabsTrigger
                    key={week.id}
                    value={`week-${week.weekNumber}`}
                    className={cn(
                      userPlan?.currentWeek === week.weekNumber &&
                        "bg-brand-primary text-white data-[state=active]:bg-brand-primary"
                    )}
                  >
                    Week {week.weekNumber}
                  </TabsTrigger>
                ))}
              </TabsList>

              {plan.weeks.map((week: any) => (
                <TabsContent key={week.id} value={`week-${week.weekNumber}`} className="space-y-4">
                  {week.title && (
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-text-primary">{week.title}</h3>
                      {week.description && (
                        <p className="text-text-muted">{week.description}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {week.workouts.map((workout: any) => (
                      <Card
                        key={workout.id}
                        className={cn(
                          "hover:shadow-md transition-shadow",
                          workout.targetType === "REST" && "border-gray-300 bg-gray-50"
                        )}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-lg">{workout.title}</CardTitle>
                                {workout.intensity && (
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs", getIntensityColor(workout.intensity))}
                                  >
                                    <span className="mr-1">{getIntensityIcon(workout.intensity)}</span>
                                    {workout.intensity}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-text-muted font-semibold">
                                {getDayName(workout.dayOfWeek)}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {workout.description && (
                            <p className="text-sm text-text-muted">{workout.description}</p>
                          )}

                          {workout.targetValue && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
                              <Target className="w-4 h-4" />
                              <span>
                                {workout.targetValue} {workout.targetUnit}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
