"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, TrendingUp, Target, Clock } from "lucide-react"
import Link from "next/link"

interface TrainingPlansListProps {
  plans: any[]
  sports: any[]
}

export function TrainingPlansList({ plans, sports }: TrainingPlansListProps) {
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  const filteredPlans = plans.filter((plan) => {
    if (selectedSport !== "all" && plan.sportId !== selectedSport) return false
    if (selectedLevel !== "all" && plan.level !== selectedLevel) return false
    return true
  })

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

  const getTotalWorkouts = (plan: any) => {
    return plan.weeks.reduce((sum: number, week: any) => sum + week.workouts.length, 0)
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const totalWorkouts = getTotalWorkouts(plan)

          return (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge variant="outline" className={getLevelColor(plan.level)}>
                    {getLevelLabel(plan.level)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <span className="text-text-muted">{plan.duration} weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-text-muted" />
                    <span className="text-text-muted">{totalWorkouts} workouts</span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/training-plans/${plan.id}`}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg">No training plans found with the selected filters</p>
        </div>
      )}
    </div>
  )
}
