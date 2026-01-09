"use client"

/**
 * V6 Gauntlet Detail Component
 *
 * Full gauntlet details with actions
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Swords,
  Clock,
  Zap,
  Trophy,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

interface GauntletUser {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
}

interface GauntletData {
  id: string
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "FORFEITED" | "DECLINED" | "EXPIRED" | "CANCELLED"
  duration: string
  message?: string | null
  challenger: GauntletUser
  opponent: GauntletUser
  challengerPower: number
  opponentPower: number
  winnerId?: string | null
  createdAt: string | Date
  startedAt?: string | Date | null
  endsAt?: string | Date | null
}

interface GauntletDetailProps {
  gauntlet: GauntletData
  currentUserId: string
}

export function GauntletDetail({ gauntlet, currentUserId }: GauntletDetailProps) {
  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const {
    challenger,
    opponent,
    challengerPower,
    opponentPower,
    status,
    message,
    createdAt,
    startedAt,
    endsAt,
    winnerId,
  } = gauntlet

  const isChallenger = currentUserId === challenger.id
  const isOpponent = currentUserId === opponent.id
  const isPending = status === "PENDING"
  const isActive = status === "ACTIVE"
  const isCompleted = status === "COMPLETED"
  const canRespond = isPending && isOpponent

  const totalPower = challengerPower + opponentPower
  const challengerPercent =
    totalPower > 0 ? (challengerPower / totalPower) * 100 : 50

  const isWinner = winnerId === currentUserId
  const isTie = isCompleted && !winnerId

  // Handle accept
  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      const res = await fetch(`/api/gauntlet/${gauntlet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setIsAccepting(false)
    }
  }

  // Handle decline
  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      const res = await fetch(`/api/gauntlet/${gauntlet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      })
      if (res.ok) {
        router.push("/gauntlets")
      }
    } finally {
      setIsDeclining(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-100 text-amber-700">Pending Response</Badge>
      case "ACTIVE":
        return <Badge className="bg-violet-100 text-violet-700">In Progress</Badge>
      case "COMPLETED":
        if (isTie) return <Badge className="bg-slate-100 text-slate-700">Tie</Badge>
        if (isWinner)
          return <Badge className="bg-emerald-100 text-emerald-700">Victory!</Badge>
        return <Badge className="bg-red-100 text-red-700">Defeat</Badge>
      case "DECLINED":
        return <Badge className="bg-slate-100 text-slate-600">Declined</Badge>
      case "EXPIRED":
        return <Badge className="bg-slate-100 text-slate-600">Expired</Badge>
      case "FORFEITED":
        return <Badge className="bg-slate-100 text-slate-600">Forfeited</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/gauntlets"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Gauntlets
      </Link>

      {/* Main Card */}
      <div
        className={cn(
          "bg-white rounded-xl border overflow-hidden",
          isActive && "border-violet-200",
          isCompleted && isWinner && "border-emerald-200",
          isCompleted && !isWinner && !isTie && "border-red-200"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "px-6 py-4 border-b",
            isActive && "bg-gradient-to-r from-violet-50 to-purple-50",
            isCompleted && isWinner && "bg-emerald-50",
            isCompleted && !isWinner && !isTie && "bg-red-50",
            isTie && "bg-slate-50"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-slate-900">Gauntlet</span>
            </div>
            {getStatusBadge()}
          </div>
        </div>

        {/* VS Display */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Challenger */}
            <div className="flex-1 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-white shadow-lg">
                <AvatarImage src={challenger.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl">
                  {(challenger.displayName ?? challenger.username ?? "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link href={`/profile/${challenger.username ?? challenger.id}`}>
                <div className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                  {challenger.displayName ?? challenger.username}
                </div>
              </Link>
              {isChallenger && (
                <div className="text-xs text-emerald-600 font-medium">(You)</div>
              )}
              <div className="flex items-center justify-center gap-1 mt-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-slate-900">
                  {challengerPower.toLocaleString()}
                </span>
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-400">VS</span>
              </div>
            </div>

            {/* Opponent */}
            <div className="flex-1 text-center">
              <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-white shadow-lg">
                <AvatarImage src={opponent.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl">
                  {(opponent.displayName ?? opponent.username ?? "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link href={`/profile/${opponent.username ?? opponent.id}`}>
                <div className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                  {opponent.displayName ?? opponent.username}
                </div>
              </Link>
              {isOpponent && (
                <div className="text-xs text-emerald-600 font-medium">(You)</div>
              )}
              <div className="flex items-center justify-center gap-1 mt-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-slate-900">
                  {opponentPower.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Power Bar */}
          {(isActive || isCompleted) && totalPower > 0 && (
            <div className="mt-8">
              <div className="relative h-4 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full transition-all duration-500",
                    isCompleted && winnerId === challenger.id
                      ? "bg-emerald-500"
                      : "bg-violet-500"
                  )}
                  style={{ width: `${challengerPercent}%` }}
                />
                <div
                  className={cn(
                    "absolute right-0 top-0 h-full transition-all duration-500",
                    isCompleted && winnerId === opponent.id
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  )}
                  style={{ width: `${100 - challengerPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-slate-500">
                <span>{Math.round(challengerPercent)}%</span>
                <span>{Math.round(100 - challengerPercent)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-600 italic">"{message}"</p>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-slate-500 mb-1">Duration</div>
              <div className="font-medium text-slate-900">
                {gauntlet.duration === "ONE_DAY" && "1 Day"}
                {gauntlet.duration === "THREE_DAYS" && "3 Days"}
                {gauntlet.duration === "ONE_WEEK" && "1 Week"}
              </div>
            </div>
            {isActive && endsAt && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time Left
                </div>
                <div className="font-medium text-slate-900">
                  {formatDistanceToNow(new Date(endsAt))}
                </div>
              </div>
            )}
            {startedAt && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 mb-1">Started</div>
                <div className="font-medium text-slate-900">
                  {format(new Date(startedAt), "MMM d, yyyy")}
                </div>
              </div>
            )}
            {isCompleted && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 mb-1 flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Winner
                </div>
                <div className="font-medium text-slate-900">
                  {winnerId === challenger.id
                    ? challenger.displayName ?? challenger.username
                    : winnerId === opponent.id
                    ? opponent.displayName ?? opponent.username
                    : "Tie"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {canRespond && (
          <div className="px-6 pb-6 flex gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAccept}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Accept Challenge
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
