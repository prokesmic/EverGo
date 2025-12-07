"use client"

import { format } from "date-fns"
import {
  Calendar,
  Clock,
  Target,
  Users,
  ChevronRight,
  Dumbbell,
  Play,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TrainingPlanCardProps {
  plan: {
    id: string
    name: string
    description: string
    duration: number
    level: string
    imageUrl?: string
    tags: string
    sport?: { name: string; icon: string }
    totalWorkouts: number
    enrolledCount: number
  }
  isEnrolled?: boolean
  progress?: number
  onEnroll?: () => void
  isEnrolling?: boolean
}

export function TrainingPlanCard({
  plan,
  isEnrolled,
  progress = 0,
  onEnroll,
  isEnrolling
}: TrainingPlanCardProps) {
  const tags = JSON.parse(plan.tags || "[]")

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-700 border-green-200"
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "ADVANCED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getLevelLabel = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase()
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      {/* Header Image */}
      <div className="h-40 bg-gradient-to-r from-brand-blue to-blue-600 relative overflow-hidden">
        {plan.imageUrl && (
          <img
            src={plan.imageUrl}
            alt={plan.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Sport Icon */}
        <div className="absolute top-3 right-3 text-4xl opacity-80">
          {plan.sport?.icon || "🏃"}
        </div>

        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn("border", getLevelColor(plan.level))}>
            {getLevelLabel(plan.level)}
          </Badge>
        </div>

        {/* Enrolled Badge */}
        {isEnrolled && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-green-500 text-white">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Enrolled
            </Badge>
          </div>
        )}

        {/* Title */}
        <div className="absolute bottom-3 left-3 right-16">
          <h3 className="text-white font-bold text-lg leading-tight">
            {plan.name}
          </h3>
          {plan.sport && (
            <p className="text-white/80 text-sm">{plan.sport.name}</p>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2">
          {plan.description}
        </p>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{plan.duration} weeks</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{plan.totalWorkouts} workouts</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{plan.enrolledCount}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-surface-secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Progress (if enrolled) */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Progress</span>
              <span className="font-medium text-text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isEnrolled ? (
            <Link href={`/training/${plan.id}`} className="flex-1">
              <Button className="w-full bg-brand-primary hover:bg-brand-primary-dark">
                <Play className="w-4 h-4 mr-2" />
                Continue Training
              </Button>
            </Link>
          ) : (
            <>
              <Link href={`/training/${plan.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Plan
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Button
                onClick={onEnroll}
                disabled={isEnrolling}
                className="bg-brand-primary hover:bg-brand-primary-dark"
              >
                {isEnrolling ? "..." : "Start"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
