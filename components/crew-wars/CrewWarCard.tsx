"use client"

/**
 * V6 Crew War Card
 *
 * Displays an active crew war between two teams
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface TeamData {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

interface CrewWarData {
  id: string
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DECLINED" | "CANCELLED"
  duration: string
  message?: string | null
  challengerTeam: TeamData
  opponentTeam: TeamData
  challengerPower: number
  opponentPower: number
  challengerParticipants: number
  opponentParticipants: number
  endsAt?: Date | null
  winnerTeamId?: string | null
}

interface CrewWarCardProps {
  crewWar: CrewWarData
  currentTeamId?: string
}

export function CrewWarCard({ crewWar, currentTeamId }: CrewWarCardProps) {
  const {
    challengerTeam,
    opponentTeam,
    challengerPower,
    opponentPower,
    status,
    endsAt,
    winnerTeamId,
  } = crewWar

  const totalPower = challengerPower + opponentPower
  const challengerPercent = totalPower > 0 ? (challengerPower / totalPower) * 100 : 50
  const isUserTeamChallenger = currentTeamId === challengerTeam.id
  const isUserTeamOpponent = currentTeamId === opponentTeam.id
  const userTeamPower = isUserTeamChallenger ? challengerPower : opponentPower
  const opponentTeamPower = isUserTeamChallenger ? opponentPower : challengerPower

  const isActive = status === "ACTIVE"
  const isCompleted = status === "COMPLETED"
  const isWinner = winnerTeamId === currentTeamId
  const isTie = isCompleted && !winnerTeamId

  return (
    <Link href={`/teams/${isUserTeamChallenger ? challengerTeam.slug : opponentTeam.slug}`}>
      <div
        className={cn(
          "rounded-xl border p-4 transition-all hover:shadow-md",
          isActive && "border-violet-200 bg-gradient-to-br from-violet-50 to-white",
          isCompleted && isWinner && "border-emerald-200 bg-emerald-50",
          isCompleted && !isWinner && !isTie && "border-slate-200 bg-slate-50",
          isTie && "border-amber-200 bg-amber-50"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-slate-900">Crew War</span>
          </div>

          {isActive && endsAt && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(endsAt), { addSuffix: true })}
            </div>
          )}

          {isCompleted && (
            <Badge
              variant="outline"
              className={cn(
                isWinner && "border-emerald-500 text-emerald-600 bg-emerald-50",
                !isWinner && !isTie && "border-slate-500 text-slate-600",
                isTie && "border-amber-500 text-amber-600 bg-amber-50"
              )}
            >
              {isWinner ? "Victory" : isTie ? "Tie" : "Defeat"}
            </Badge>
          )}
        </div>

        {/* Teams VS */}
        <div className="flex items-center justify-between gap-4">
          {/* Challenger Team */}
          <div className="flex-1 text-center">
            <Avatar className="w-12 h-12 mx-auto mb-1 border-2 border-white shadow">
              <AvatarImage src={challengerTeam.logoUrl ?? undefined} />
              <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold">
                {challengerTeam.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium text-slate-900 truncate">
              {challengerTeam.name}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">
                {challengerPower.toLocaleString()}
              </span>
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-slate-400">VS</span>
          </div>

          {/* Opponent Team */}
          <div className="flex-1 text-center">
            <Avatar className="w-12 h-12 mx-auto mb-1 border-2 border-white shadow">
              <AvatarImage src={opponentTeam.logoUrl ?? undefined} />
              <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold">
                {opponentTeam.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium text-slate-900 truncate">
              {opponentTeam.name}
            </div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">
                {opponentPower.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Power Bar */}
        {isActive && (
          <div className="mt-4">
            <div className="relative h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                style={{ width: `${challengerPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500">
              <span>{crewWar.challengerParticipants} active</span>
              <span>{crewWar.opponentParticipants} active</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
