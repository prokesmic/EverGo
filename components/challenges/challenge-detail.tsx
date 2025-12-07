"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Flame,
  Medal,
  Clock,
  Activity as ActivityIcon,
  Share2,
  Loader2,
  Check,
} from "lucide-react"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ChallengeDetailProps {
  challenge: any
  leaderboard: any[]
  isParticipating: boolean
  currentUserProgress: any
  currentUserId?: string
}

export function ChallengeDetail({
  challenge,
  leaderboard,
  isParticipating,
  currentUserProgress,
  currentUserId,
}: ChallengeDetailProps) {
  const router = useRouter()
  const [isJoining, setIsJoining] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/challenges/${challenge.id}/join`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to join challenge")

      toast.success("Successfully joined the challenge!")
      router.refresh()
    } catch (error) {
      console.error("Error joining challenge:", error)
      toast.error("Failed to join challenge")
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this challenge?")) return

    setIsLeaving(true)
    try {
      const response = await fetch(`/api/challenges/${challenge.id}/leave`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to leave challenge")

      toast.success("Left the challenge")
      router.refresh()
    } catch (error) {
      console.error("Error leaving challenge:", error)
      toast.error("Failed to leave challenge")
    } finally {
      setIsLeaving(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/challenges/${challenge.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: challenge.title,
          text: `Join me in the "${challenge.title}" challenge on EverGo!`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success("Challenge link copied!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const getStatusBadge = () => {
    switch (challenge.status) {
      case "upcoming":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">Upcoming</Badge>
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Active</Badge>
      case "completed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Completed</Badge>
    }
  }

  const getChallengeTypeLabel = () => {
    switch (challenge.challengeType) {
      case "DISTANCE":
        return "km"
      case "DURATION":
        return "hours"
      case "ACTIVITY_COUNT":
        return "activities"
    }
  }

  const daysRemaining = differenceInDays(new Date(challenge.endDate), new Date())
  const totalDays = differenceInDays(new Date(challenge.endDate), new Date(challenge.startDate))
  const daysProgress = ((totalDays - daysRemaining) / totalDays) * 100

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-black text-text-primary">{challenge.title}</h1>
                {getStatusBadge()}
              </div>
              <p className="text-text-muted text-lg">{challenge.description}</p>
            </div>

            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Challenge Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Goal</p>
                    <p className="text-xl font-bold text-text-primary">
                      {challenge.targetValue} {getChallengeTypeLabel()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Participants</p>
                    <p className="text-xl font-bold text-text-primary">
                      {challenge.participantsCount}
                      {challenge.maxParticipants && ` / ${challenge.maxParticipants}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">
                      {challenge.status === "upcoming" ? "Starts" : challenge.status === "active" ? "Ends" : "Ended"}
                    </p>
                    <p className="text-xl font-bold text-text-primary">
                      {challenge.status === "upcoming"
                        ? formatDistanceToNow(new Date(challenge.startDate), { addSuffix: true })
                        : formatDistanceToNow(new Date(challenge.endDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ActivityIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Sport</p>
                    <p className="text-xl font-bold text-text-primary">{challenge.sport.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Join/Leave Button */}
          {challenge.status !== "completed" && (
            <div className="mt-6">
              {isParticipating ? (
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleLeave} disabled={isLeaving} className="flex-1">
                    {isLeaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Leaving...
                      </>
                    ) : (
                      "Leave Challenge"
                    )}
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/activity/track">
                      <Trophy className="w-4 h-4 mr-2" />
                      Log Activity
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button onClick={handleJoin} disabled={isJoining} size="lg" className="w-full">
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Join Challenge
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* User Progress (if participating) */}
        {isParticipating && currentUserProgress && (
          <Card className="mb-6 border-brand-primary bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-primary" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-brand-primary">
                  {currentUserProgress.progress.toFixed(1)} / {challenge.targetValue} {getChallengeTypeLabel()}
                </span>
                <Badge variant={currentUserProgress.isCompleted ? "default" : "outline"} className="text-lg px-4 py-2">
                  {currentUserProgress.isCompleted ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Completed!
                    </>
                  ) : (
                    `${currentUserProgress.progressPercentage.toFixed(0)}%`
                  )}
                </Badge>
              </div>
              <Progress value={currentUserProgress.progressPercentage} className="h-3" />
              <div className="flex items-center justify-between text-sm text-text-muted">
                <span>Rank: #{currentUserProgress.rank}</span>
                <span>{currentUserProgress.activitiesCount} activities logged</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">No participants yet</p>
                <p className="text-sm">Be the first to join this challenge!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId
                  const initials = entry.user.displayName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)

                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md",
                        isCurrentUser ? "bg-gradient-to-r from-brand-primary/10 to-brand-secondary/5 border-2 border-brand-primary" : "bg-surface-secondary",
                        entry.rank === 1 && "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400",
                        entry.rank === 2 && "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400",
                        entry.rank === 3 && "bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-600"
                      )}
                    >
                      {/* Rank */}
                      <div className="w-12 h-12 flex items-center justify-center">
                        {entry.rank === 1 ? (
                          <Medal className="w-10 h-10 text-yellow-500" />
                        ) : entry.rank === 2 ? (
                          <Medal className="w-10 h-10 text-gray-400" />
                        ) : entry.rank === 3 ? (
                          <Medal className="w-10 h-10 text-orange-600" />
                        ) : (
                          <span className="text-2xl font-black text-text-muted">#{entry.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Link href={`/profile/${entry.user.username || entry.userId}`}>
                        <Avatar className="w-12 h-12 border-2 border-white shadow-md hover:scale-110 transition-transform">
                          <AvatarImage src={entry.user.avatarUrl || undefined} alt={entry.user.displayName} />
                          <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={`/profile/${entry.user.username || entry.userId}`}
                            className="font-bold text-text-primary hover:underline truncate"
                          >
                            {entry.user.displayName}
                          </Link>
                          {isCurrentUser && (
                            <Badge variant="outline" className="bg-brand-primary text-white border-brand-primary">
                              You
                            </Badge>
                          )}
                          {entry.isCompleted && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              <Check className="w-3 h-3 mr-1" />
                              Done
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <span className="font-semibold text-brand-primary">
                            {entry.progress.toFixed(1)} {getChallengeTypeLabel()}
                          </span>
                          <span>·</span>
                          <span>{entry.activitiesCount} activities</span>
                          <span>·</span>
                          <span>{entry.progressPercentage.toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-32 hidden md:block">
                        <Progress value={entry.progressPercentage} className="h-2" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Challenge Creator */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-muted">Created by</span>
              <Link href={`/profile/${challenge.creator.username || challenge.creator.id}`} className="flex items-center gap-3 hover:opacity-80">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={challenge.creator.avatarUrl || undefined} />
                  <AvatarFallback>{challenge.creator.displayName[0]}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-text-primary">{challenge.creator.displayName}</span>
              </Link>
              <span className="text-sm text-text-muted">
                {format(new Date(challenge.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
