"use client"

/**
 * V6 Profile Rivalries Component
 *
 * Shows user's head-to-head rivalries on their profile
 */

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Swords, Flame, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RivalryUser {
  id: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
}

interface Rivalry {
  opponent: RivalryUser | undefined
  totalMatches: number
  userWins: number
  opponentWins: number
  ties: number
  currentStreak: number
  lastMatchDate: Date | null
  isLeading: boolean
}

interface ProfileRivalriesProps {
  rivalries: Rivalry[]
  isCurrentUser: boolean
  userId: string // Used for future features like direct challenge
}

export function ProfileRivalries({ rivalries, isCurrentUser, userId: _userId }: ProfileRivalriesProps) {
  const [showAll, setShowAll] = useState(false)
  const displayRivalries = showAll ? rivalries : rivalries.slice(0, 5)

  if (rivalries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Swords className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          No Rivalries Yet
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-4">
          {isCurrentUser
            ? "Rivalries are formed when you compete in Gauntlets. Throw your first Gauntlet to start a rivalry!"
            : "This athlete hasn't competed in any head-to-head competitions yet."}
        </p>
        {isCurrentUser && (
          <Link href="/gauntlets/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Swords className="w-4 h-4 mr-2" />
              Throw Gauntlet
            </Button>
          </Link>
        )}
      </div>
    )
  }

  // Calculate stats
  const totalWins = rivalries.reduce((sum, r) => sum + r.userWins, 0)
  const totalLosses = rivalries.reduce((sum, r) => sum + r.opponentWins, 0)
  const totalTies = rivalries.reduce((sum, r) => sum + r.ties, 0)
  const totalMatches = totalWins + totalLosses + totalTies
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{rivalries.length}</div>
          <div className="text-sm text-slate-500">Rivals</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{totalWins}</div>
          <div className="text-sm text-slate-500">Wins</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{totalLosses}</div>
          <div className="text-sm text-slate-500">Losses</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{winRate}%</div>
          <div className="text-sm text-slate-500">Win Rate</div>
        </div>
      </div>

      {/* Rivalries List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-violet-600" />
            <h3 className="font-semibold text-slate-900">Head-to-Head Records</h3>
          </div>
          {isCurrentUser && (
            <Link href="/gauntlets/new">
              <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                New Gauntlet
              </Button>
            </Link>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {displayRivalries.map((rivalry) => {
            if (!rivalry.opponent) return null

            const { opponent, userWins, opponentWins, ties, currentStreak, isLeading, totalMatches } = rivalry
            const isIntense = totalMatches >= 5
            const isOnStreak = Math.abs(currentStreak) >= 2

            return (
              <Link
                key={opponent.id}
                href={`/profile/${opponent.username || opponent.id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-white shadow">
                    <AvatarImage src={opponent.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-700">
                      {(opponent.displayName ?? opponent.username ?? "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isIntense && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <Flame className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate">
                      {opponent.displayName ?? opponent.username}
                    </span>
                    {isOnStreak && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          currentStreak > 0
                            ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                            : "border-red-200 text-red-700 bg-red-50"
                        )}
                      >
                        {Math.abs(currentStreak)} streak
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">
                    {totalMatches} match{totalMatches !== 1 ? "es" : ""}
                  </div>
                </div>

                {/* Record */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <span className="text-emerald-600">{userWins}W</span>
                      <span className="text-slate-400">-</span>
                      <span className="text-red-600">{opponentWins}L</span>
                      {ties > 0 && (
                        <>
                          <span className="text-slate-400">-</span>
                          <span className="text-slate-500">{ties}T</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      {isLeading ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">Leading</span>
                        </>
                      ) : userWins === opponentWins ? (
                        <>
                          <Minus className="w-3 h-3 text-slate-400" />
                          <span>Tied</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-red-500" />
                          <span className="text-red-600">Behind</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Show more button */}
        {rivalries.length > 5 && (
          <div className="p-4 border-t border-slate-100">
            <Button
              variant="ghost"
              className="w-full text-slate-600"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show less" : `Show all ${rivalries.length} rivals`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
