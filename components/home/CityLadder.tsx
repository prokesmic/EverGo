"use client"

/**
 * V6 City Ladder Widget
 *
 * Shows top athletes in the user's city this week
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LadderEntry {
  rank: number
  userId: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
  power: number
  isCurrentUser: boolean
}

interface CityLadderProps {
  city: string
  entries: LadderEntry[]
  currentUserId: string
}

export function CityLadder({ city, entries, currentUserId }: CityLadderProps) {
  if (entries.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-900">{city}</span>
          </div>
          <span className="text-xs text-slate-500">This Week</span>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-slate-100">
        {entries.map((entry) => (
          <Link
            key={entry.userId}
            href={`/profile/${entry.username ?? entry.userId}`}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors",
              entry.isCurrentUser && "bg-emerald-50 hover:bg-emerald-100"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "w-6 text-center font-bold text-sm",
                entry.rank === 1 && "text-amber-500",
                entry.rank === 2 && "text-slate-400",
                entry.rank === 3 && "text-amber-700",
                entry.rank > 3 && "text-slate-400"
              )}
            >
              {entry.rank}
            </div>

            {/* Avatar */}
            <Avatar className="w-8 h-8">
              <AvatarImage src={entry.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">
                {(entry.displayName ?? entry.username ?? "?")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-sm font-medium truncate",
                  entry.isCurrentUser ? "text-emerald-700" : "text-slate-900"
                )}
              >
                {entry.displayName ?? entry.username}
                {entry.isCurrentUser && (
                  <span className="ml-1 text-xs text-emerald-600">(you)</span>
                )}
              </span>
            </div>

            {/* Power */}
            <div className="text-sm font-semibold text-slate-900">
              {entry.power.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <Link
          href={`/rankings?scope=city&city=${encodeURIComponent(city)}`}
          className="flex items-center justify-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          View Full Rankings
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
