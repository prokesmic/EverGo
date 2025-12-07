"use client"

import { useState } from "react"
import { format, addDays, startOfWeek } from "date-fns"
import {
  CheckCircle2,
  Circle,
  Play,
  Coffee,
  Flame,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Workout {
  id: string
  dayOfWeek: number
  title: string
  description?: string
  targetType: string
  targetValue?: number
  targetUnit?: string
  intensity?: string
  notes?: string
}

interface WeeklyScheduleProps {
  weekNumber: number
  totalWeeks: number
  weekTitle?: string
  weekDescription?: string
  workouts: Workout[]
  completedWorkouts: Array<{ weekNumber: number; dayOfWeek: number; completedAt: string }>
  onCompleteWorkout: (dayOfWeek: number) => Promise<void>
  onUncompleteWorkout?: (dayOfWeek: number) => Promise<void>
  startDate: Date
  isCurrentWeek: boolean
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WeeklySchedule({
  weekNumber,
  totalWeeks,
  weekTitle,
  weekDescription,
  workouts,
  completedWorkouts,
  onCompleteWorkout,
  onUncompleteWorkout,
  startDate,
  isCurrentWeek
}: WeeklyScheduleProps) {
  const [loadingDay, setLoadingDay] = useState<number | null>(null)

  const weekStartDate = addDays(startDate, (weekNumber - 1) * 7)

  const getIntensityColor = (intensity?: string) => {
    switch (intensity) {
      case "EASY":
        return "bg-green-100 text-green-700 border-green-200"
      case "MODERATE":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "HARD":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "RACE_PACE":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const isWorkoutCompleted = (dayOfWeek: number) => {
    return completedWorkouts.some(
      cw => cw.weekNumber === weekNumber && cw.dayOfWeek === dayOfWeek
    )
  }

  const handleToggleWorkout = async (dayOfWeek: number) => {
    setLoadingDay(dayOfWeek)
    try {
      if (isWorkoutCompleted(dayOfWeek) && onUncompleteWorkout) {
        await onUncompleteWorkout(dayOfWeek)
      } else {
        await onCompleteWorkout(dayOfWeek)
      }
    } finally {
      setLoadingDay(null)
    }
  }

  // Create a map of workouts by day
  const workoutsByDay = new Map<number, Workout>()
  workouts.forEach(w => workoutsByDay.set(w.dayOfWeek, w))

  const completedCount = workouts.filter(w => isWorkoutCompleted(w.dayOfWeek)).length

  return (
    <Card className={cn(
      "transition-all",
      isCurrentWeek && "ring-2 ring-brand-primary shadow-lg"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                Week {weekNumber} of {totalWeeks}
              </CardTitle>
              {isCurrentWeek && (
                <Badge className="bg-brand-primary text-white">Current Week</Badge>
              )}
            </div>
            {weekTitle && (
              <p className="text-sm font-medium text-text-primary mt-1">{weekTitle}</p>
            )}
            {weekDescription && (
              <p className="text-sm text-text-muted mt-1">{weekDescription}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-text-primary">
              {completedCount}/{workouts.length}
            </p>
            <p className="text-xs text-text-muted">workouts done</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {DAY_NAMES.map((dayName, index) => {
            const workout = workoutsByDay.get(index)
            const isCompleted = workout ? isWorkoutCompleted(index) : false
            const isRest = !workout
            const dayDate = addDays(weekStartDate, index)
            const isLoading = loadingDay === index

            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-all",
                  isCompleted
                    ? "bg-green-50 border-green-200"
                    : isRest
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-border-light hover:border-brand-primary/50"
                )}
              >
                {/* Day Info */}
                <div className="w-20 text-center">
                  <p className="text-xs text-text-muted uppercase">{DAY_NAMES_SHORT[index]}</p>
                  <p className="text-sm font-medium text-text-primary">
                    {format(dayDate, "MMM d")}
                  </p>
                </div>

                {/* Workout Content */}
                <div className="flex-1 min-w-0">
                  {isRest ? (
                    <div className="flex items-center gap-2 text-text-muted">
                      <Coffee className="w-4 h-4" />
                      <span className="text-sm font-medium">Rest Day</span>
                    </div>
                  ) : workout ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "font-medium text-sm",
                          isCompleted ? "text-green-700" : "text-text-primary"
                        )}>
                          {workout.title}
                        </h4>
                        {workout.intensity && (
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getIntensityColor(workout.intensity))}
                          >
                            {workout.intensity.toLowerCase().replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      {workout.targetValue && (
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {workout.targetValue} {workout.targetUnit}
                          </span>
                          {workout.description && (
                            <span className="truncate">{workout.description}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Action Button */}
                {!isRest && workout && (
                  <Button
                    size="sm"
                    variant={isCompleted ? "outline" : "default"}
                    onClick={() => handleToggleWorkout(index)}
                    disabled={isLoading}
                    className={cn(
                      "min-w-[100px]",
                      isCompleted
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : "bg-brand-primary hover:bg-brand-primary-dark"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Done
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
