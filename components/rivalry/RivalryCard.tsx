"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Swords,
  Trophy,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RivalryStatus, RivalryMetric } from "@prisma/client"

interface Participant {
  id: string
  userId: string
  isCreator: boolean
  isAccepted: boolean
  scoreValue: number | null
  user: {
    id: string
    displayName: string
    username: string
    avatarUrl: string | null
  }
}

interface RivalryCardProps {
  id: string
  status: RivalryStatus
  sportSlug: string
  metric: RivalryMetric
  windowStart: Date
  windowEnd: Date
  participants: Participant[]
  currentUserId: string
  onAccept?: () => void
  onDecline?: () => void
  className?: string
}

export function RivalryCard({
  id,
  status,
  sportSlug,
  metric,
  windowStart,
  windowEnd,
  participants,
  currentUserId,
  onAccept,
  onDecline,
  className,
}: RivalryCardProps) {
  // Determine my participant and opponent
  const myParticipant = participants.find((p) => p.userId === currentUserId)
  const opponent = participants.find((p) => p.userId !== currentUserId)

  if (!opponent) return null

  const myScore = myParticipant?.scoreValue ?? 0
  const theirScore = opponent.scoreValue ?? 0
  const delta = myScore - theirScore

  const isPending = status === RivalryStatus.PENDING
  const isActive = status === RivalryStatus.ACTIVE
  const isCompleted = status === RivalryStatus.COMPLETED
  const isInvite = isPending && !myParticipant?.isCreator && !myParticipant?.isAccepted

  // Time remaining
  const now = new Date()
  const timeRemaining = isActive
    ? formatDistanceToNow(windowEnd, { addSuffix: false })
    : null

  // Status styling
  let statusBadge = null
  if (isPending) {
    statusBadge = (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        Pending
      </span>
    )
  } else if (isCompleted) {
    const won = delta > 0
    const tied = delta === 0
    statusBadge = (
      <span
        className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          won && "bg-green-100 text-green-700",
          tied && "bg-slate-100 text-slate-600",
          !won && !tied && "bg-red-100 text-red-700"
        )}
      >
        {won ? "Won" : tied ? "Tied" : "Lost"}
      </span>
    )
  }

  // Metric label
  const metricLabel = {
    [RivalryMetric.DISTANCE]: "km",
    [RivalryMetric.DURATION]: "min",
    [RivalryMetric.SESSIONS]: "sessions",
    [RivalryMetric.TIME]: "sec",
    [RivalryMetric.REPS]: "reps",
    [RivalryMetric.SCORE]: "pts",
  }[metric]

  // Format score for display
  function formatScore(value: number): string {
    if (metric === RivalryMetric.DISTANCE) {
      return (value / 1000).toFixed(1) // meters to km
    }
    if (metric === RivalryMetric.DURATION) {
      return Math.round(value / 60).toString() // seconds to minutes
    }
    return value.toString()
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm",
        isActive && "border-orange-200",
        isPending && "border-amber-200",
        isCompleted && "border-slate-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              isActive && "bg-orange-50",
              isPending && "bg-amber-50",
              isCompleted && "bg-slate-50"
            )}
          >
            <Swords
              className={cn(
                "h-4 w-4",
                isActive && "text-orange-500",
                isPending && "text-amber-500",
                isCompleted && "text-slate-400"
              )}
            />
          </div>
          <div>
            <div className="text-sm font-semibold capitalize">{sportSlug}</div>
            <div className="text-xs text-muted-foreground">
              {metricLabel} challenge
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge}
          {timeRemaining && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeRemaining}
            </span>
          )}
        </div>
      </div>

      {/* Scores */}
      <div className="flex items-center justify-between gap-4 py-3 border-y border-slate-100">
        {/* Me */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={myParticipant?.user.avatarUrl || undefined} />
            <AvatarFallback>
              {myParticipant?.user.displayName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">You</div>
            <div className="text-lg font-bold">
              {formatScore(myScore)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {metricLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Delta indicator */}
        <div className="flex flex-col items-center">
          {delta > 0 && (
            <>
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-xs font-medium text-green-600">
                +{formatScore(Math.abs(delta))}
              </span>
            </>
          )}
          {delta < 0 && (
            <>
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-xs font-medium text-red-600">
                -{formatScore(Math.abs(delta))}
              </span>
            </>
          )}
          {delta === 0 && (
            <>
              <Minus className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Tied</span>
            </>
          )}
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{opponent.user.displayName}</div>
            <div className="text-lg font-bold">
              {formatScore(theirScore)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {metricLabel}
              </span>
            </div>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={opponent.user.avatarUrl || undefined} />
            <AvatarFallback>
              {opponent.user.displayName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3">
        {isInvite ? (
          <div className="flex gap-2">
            <Button
              onClick={onAccept}
              className="flex-1 bg-green-500 hover:bg-green-600"
              size="sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              onClick={onDecline}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        ) : (
          <Link href={`/rivalries/${id}`}>
            <Button variant="outline" className="w-full" size="sm">
              View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
