"use client"

/**
 * V6 Season Leaderboard
 *
 * Full leaderboard for season detail page
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Zap, Medal } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  userId: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  totalPower: number
  activityCount: number
  rank: number
  isCurrentUser?: boolean
}

interface SeasonLeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

export function SeasonLeaderboard({
  entries,
  currentUserId,
}: SeasonLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No participants yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-900">Leaderboard</h2>
      </div>

      {/* Entries */}
      <div className="divide-y divide-slate-100">
        {entries.map((entry) => {
          const isCurrentUser = entry.userId === currentUserId
          return (
            <Link
              key={entry.userId}
              href={`/profile/${entry.username ?? entry.userId}`}
              className={cn(
                "flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors",
                isCurrentUser && "bg-emerald-50 hover:bg-emerald-100"
              )}
            >
              {/* Rank */}
              <div className="w-10 text-center">
                {entry.rank <= 3 ? (
                  <Medal
                    className={cn(
                      "w-6 h-6 mx-auto",
                      entry.rank === 1 && "text-amber-500",
                      entry.rank === 2 && "text-slate-400",
                      entry.rank === 3 && "text-amber-700"
                    )}
                  />
                ) : (
                  <span className="text-lg font-bold text-slate-400">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {(entry.displayName ?? entry.username ?? "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "font-medium truncate",
                    isCurrentUser ? "text-emerald-700" : "text-slate-900"
                  )}
                >
                  {entry.displayName ?? entry.username}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-emerald-600">(you)</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {entry.activityCount} activities
                </div>
              </div>

              {/* Power */}
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-900">
                  {entry.totalPower.toLocaleString()}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
