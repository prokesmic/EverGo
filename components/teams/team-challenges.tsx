"use client"

import { useState, useEffect } from "react"
import { format, differenceInDays, differenceInHours } from "date-fns"
import {
  Trophy,
  Users,
  Target,
  Clock,
  Plus,
  ChevronRight,
  Flame,
  Medal,
  Crown,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TeamChallengesProps {
  teamId: string
  teamName: string
  isAdmin?: boolean
  currentUserId?: string
}

interface Challenge {
  id: string
  title: string
  description: string
  imageUrl?: string
  startDate: string
  endDate: string
  targetType: string
  targetValue: number
  targetUnit: string
  sport?: { name: string; icon: string }
  badge?: { name: string; iconUrl: string }
  participation?: {
    currentValue: number
    isCompleted: boolean
  }
  leaderboard: Array<{
    rank: number
    currentValue: number
    isCompleted: boolean
    user: {
      id: string
      displayName: string
      username: string
      avatarUrl?: string
    }
  }>
  _count: { participants: number }
}

export function TeamChallenges({ teamId, teamName, isAdmin, currentUserId }: TeamChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "completed">("active")

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/teams/${teamId}/challenges?status=${activeTab}`)
        const data = await res.json()
        setChallenges(data.challenges || [])
      } catch (error) {
        console.error("Error fetching team challenges:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChallenges()
  }, [teamId, activeTab])

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const days = differenceInDays(end, now)
    const hours = differenceInHours(end, now) % 24

    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return "Ending soon!"
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />
    return <span className="text-xs font-bold text-text-muted">#{rank}</span>
  }

  const getTargetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DISTANCE: "Distance",
      DURATION: "Time",
      ACTIVITIES: "Activities",
      CALORIES: "Calories",
      ELEVATION: "Elevation",
      STREAK: "Streak"
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Trophy className="w-6 h-6 text-brand-primary" />
            Team Challenges
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Compete with your teammates and achieve goals together
          </p>
        </div>
        {isAdmin && (
          <Link href={`/teams/${teamId}/challenges/create`}>
            <Button className="bg-brand-primary hover:bg-brand-primary-dark">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-light pb-2">
        {(["active", "upcoming", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-brand-primary text-white"
                : "text-text-secondary hover:bg-surface-secondary"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      )}

      {/* Challenges Grid */}
      {!isLoading && challenges.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {challenges.map((challenge) => {
            const progress = challenge.participation
              ? (challenge.participation.currentValue / challenge.targetValue) * 100
              : 0
            const isCompleted = challenge.participation?.isCompleted

            return (
              <Card
                key={challenge.id}
                className={cn(
                  "overflow-hidden transition-all hover:shadow-lg",
                  isCompleted && "ring-2 ring-green-500"
                )}
              >
                {/* Challenge Header */}
                <div className="h-32 bg-gradient-to-r from-brand-blue to-blue-600 relative">
                  {challenge.imageUrl && (
                    <img
                      src={challenge.imageUrl}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {isCompleted ? (
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : activeTab === "active" ? (
                      <Badge className="bg-orange-500 text-white">
                        <Flame className="w-3 h-3 mr-1" />
                        {getTimeRemaining(challenge.endDate)}
                      </Badge>
                    ) : null}
                  </div>

                  {/* Sport Icon */}
                  <div className="absolute top-3 right-3 text-3xl">
                    {challenge.sport?.icon || "🏆"}
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg truncate">
                      {challenge.title}
                    </h3>
                    <p className="text-white/80 text-xs">
                      {format(new Date(challenge.startDate), "MMM d")} - {format(new Date(challenge.endDate), "MMM d")}
                    </p>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Target */}
                  <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-brand-primary" />
                      <span className="text-sm text-text-secondary">
                        {getTargetTypeLabel(challenge.targetType)} Goal
                      </span>
                    </div>
                    <span className="font-bold text-text-primary">
                      {challenge.targetValue} {challenge.targetUnit}
                    </span>
                  </div>

                  {/* Progress (if participating) */}
                  {challenge.participation && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Your Progress</span>
                        <span className="font-medium text-text-primary">
                          {challenge.participation.currentValue.toFixed(1)} / {challenge.targetValue} {challenge.targetUnit}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(progress, 100)}
                        className={cn(
                          "h-3",
                          isCompleted && "[&>div]:bg-green-500"
                        )}
                      />
                    </div>
                  )}

                  {/* Mini Leaderboard */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-secondary flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Top Performers
                      </span>
                      <span className="text-xs text-text-muted">
                        {challenge._count.participants} participants
                      </span>
                    </div>
                    <div className="space-y-2">
                      {challenge.leaderboard.slice(0, 5).map((entry) => (
                        <div
                          key={entry.user.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg transition-colors",
                            entry.user.id === currentUserId
                              ? "bg-brand-primary/10 border border-brand-primary/20"
                              : "hover:bg-surface-secondary"
                          )}
                        >
                          <div className="w-6 flex justify-center">
                            {getRankIcon(entry.rank)}
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={entry.user.avatarUrl || undefined} />
                            <AvatarFallback className="text-xs bg-brand-primary text-white">
                              {entry.user.displayName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              entry.user.id === currentUserId && "text-brand-primary"
                            )}>
                              {entry.user.displayName}
                              {entry.user.id === currentUserId && " (You)"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-text-primary">
                              {entry.currentValue.toFixed(1)}
                            </span>
                            <span className="text-xs text-text-muted ml-1">
                              {challenge.targetUnit}
                            </span>
                          </div>
                          {entry.isCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Full Challenge Link */}
                  <Link
                    href={`/challenges/${challenge.id}`}
                    className="flex items-center justify-center gap-1 text-sm text-brand-primary hover:underline"
                  >
                    View Full Challenge
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && challenges.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No {activeTab} challenges
          </h3>
          <p className="text-text-secondary mb-4">
            {activeTab === "active"
              ? "Your team doesn't have any active challenges right now."
              : activeTab === "upcoming"
              ? "No upcoming challenges scheduled."
              : "No completed challenges yet."}
          </p>
          {isAdmin && activeTab !== "completed" && (
            <Link href={`/teams/${teamId}/challenges/create`}>
              <Button className="bg-brand-primary hover:bg-brand-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                Create First Challenge
              </Button>
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}
