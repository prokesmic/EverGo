"use client"

/**
 * V6 Team Crew Wars Component
 *
 * Shows active crew war, pending challenges, and history
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Swords,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"

interface TeamInfo {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  memberCount?: number
}

interface CrewWar {
  id: string
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DECLINED" | "CANCELLED"
  duration: "ONE_WEEK" | "TWO_WEEKS" | "ONE_MONTH"
  message?: string | null
  challengerTeam: TeamInfo
  opponentTeam: TeamInfo
  challengerPower: number
  opponentPower: number
  challengerParticipants: number
  opponentParticipants: number
  winnerTeamId?: string | null
  winnerTeam?: { id: string; name: string } | null
  createdAt: string | Date
  startedAt?: string | Date | null
  endsAt?: string | Date | null
}

interface TeamCrewWarsProps {
  teamId: string
  teamSlug: string
  isAdmin: boolean
  activeWar: CrewWar | null
  pendingChallenges: CrewWar[]
  history: CrewWar[]
  stats: {
    totalWars: number
    wins: number
    losses: number
    ties: number
    winRate: number
  }
}

export function TeamCrewWars({
  teamId,
  teamSlug,
  isAdmin,
  activeWar,
  pendingChallenges,
  history,
  stats,
}: TeamCrewWarsProps) {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleAccept = async (warId: string) => {
    setLoadingAction(`accept-${warId}`)
    try {
      const res = await fetch(`/api/crew-wars/${warId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", teamId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDecline = async (warId: string) => {
    setLoadingAction(`decline-${warId}`)
    try {
      const res = await fetch(`/api/crew-wars/${warId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", teamId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setLoadingAction(null)
    }
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case "ONE_WEEK":
        return "1 Week"
      case "TWO_WEEKS":
        return "2 Weeks"
      case "ONE_MONTH":
        return "1 Month"
      default:
        return duration
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats.totalWars > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-xl font-bold text-slate-900">{stats.totalWars}</div>
            <div className="text-xs text-slate-500">Total Wars</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-xl font-bold text-emerald-600">{stats.wins}</div>
            <div className="text-xs text-slate-500">Wins</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-xl font-bold text-red-600">{stats.losses}</div>
            <div className="text-xs text-slate-500">Losses</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <div className="text-xl font-bold text-amber-600">{stats.winRate}%</div>
            <div className="text-xs text-slate-500">Win Rate</div>
          </div>
        </div>
      )}

      {/* Active War */}
      {activeWar && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-violet-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-slate-900">Active Crew War</span>
            </div>
            <Badge className="bg-violet-100 text-violet-700">In Progress</Badge>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Challenger Team */}
              <div className="flex-1 text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-white shadow-lg">
                  <AvatarImage src={activeWar.challengerTeam.logoUrl ?? undefined} />
                  <AvatarFallback className="text-lg font-bold bg-violet-100 text-violet-700">
                    {activeWar.challengerTeam.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-slate-900 truncate">
                  {activeWar.challengerTeam.name}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-bold text-slate-900">
                    {activeWar.challengerPower.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {activeWar.challengerParticipants} participants
                </div>
              </div>

              {/* VS */}
              <div className="text-center px-4">
                <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-400">VS</span>
                </div>
              </div>

              {/* Opponent Team */}
              <div className="flex-1 text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-white shadow-lg">
                  <AvatarImage src={activeWar.opponentTeam.logoUrl ?? undefined} />
                  <AvatarFallback className="text-lg font-bold bg-slate-100 text-slate-700">
                    {activeWar.opponentTeam.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-slate-900 truncate">
                  {activeWar.opponentTeam.name}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-bold text-slate-900">
                    {activeWar.opponentPower.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {activeWar.opponentParticipants} participants
                </div>
              </div>
            </div>

            {/* Power Bar */}
            {(activeWar.challengerPower > 0 || activeWar.opponentPower > 0) && (
              <div className="mt-4">
                <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-violet-500 transition-all"
                    style={{
                      width: `${
                        (activeWar.challengerPower /
                          (activeWar.challengerPower + activeWar.opponentPower)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Time remaining */}
            {activeWar.endsAt && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4" />
                <span>Ends {formatDistanceToNow(new Date(activeWar.endsAt), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Challenges */}
      {pendingChallenges.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-slate-900">Pending Challenges</span>
            <Badge variant="outline" className="ml-auto">
              {pendingChallenges.length}
            </Badge>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingChallenges.map((war) => (
              <div key={war.id} className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={war.challengerTeam.logoUrl ?? undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-700">
                      {war.challengerTeam.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900">
                      {war.challengerTeam.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {getDurationLabel(war.duration)} challenge
                    </div>
                  </div>
                </div>

                {war.message && (
                  <p className="text-sm text-slate-600 italic mb-3">
                    &quot;{war.message}&quot;
                  </p>
                )}

                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleAccept(war.id)}
                      disabled={loadingAction !== null}
                    >
                      {loadingAction === `accept-${war.id}` ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDecline(war.id)}
                      disabled={loadingAction !== null}
                    >
                      {loadingAction === `decline-${war.id}` ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* War History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-slate-900">War History</span>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 5).map((war) => {
              const isWinner = war.winnerTeamId === teamId
              const isTie = !war.winnerTeamId
              const opponent =
                war.challengerTeam.id === teamId
                  ? war.opponentTeam
                  : war.challengerTeam
              const ourPower =
                war.challengerTeam.id === teamId
                  ? war.challengerPower
                  : war.opponentPower
              const theirPower =
                war.challengerTeam.id === teamId
                  ? war.opponentPower
                  : war.challengerPower

              return (
                <div
                  key={war.id}
                  className={cn(
                    "flex items-center gap-3 p-4",
                    isWinner && "bg-emerald-50/50",
                    !isWinner && !isTie && "bg-red-50/50"
                  )}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={opponent.logoUrl ?? undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-700">
                      {opponent.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      vs {opponent.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {war.startedAt && format(new Date(war.startedAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {ourPower.toLocaleString()} - {theirPower.toLocaleString()}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        isWinner && "border-emerald-200 text-emerald-700",
                        !isWinner && !isTie && "border-red-200 text-red-700",
                        isTie && "border-slate-200 text-slate-600"
                      )}
                    >
                      {isWinner ? "Victory" : isTie ? "Tie" : "Defeat"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!activeWar && pendingChallenges.length === 0 && history.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Swords className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Crew Wars Yet
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Challenge another team to a Crew War to compete head-to-head!
          </p>
        </div>
      )}
    </div>
  )
}
