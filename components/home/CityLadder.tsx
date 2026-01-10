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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-card-foreground">{city}</span>
          </div>
          <span className="text-xs text-muted-foreground">This Week</span>
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-border">
        {entries.map((entry) => (
          <Link
            key={entry.userId}
            href={`/profile/${entry.username ?? entry.userId}`}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors",
              entry.isCurrentUser && "bg-primary/5 hover:bg-primary/10"
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                "w-6 text-center font-bold text-sm",
                entry.rank === 1 && "text-amber-500",
                entry.rank === 2 && "text-muted-foreground",
                entry.rank === 3 && "text-amber-700",
                entry.rank > 3 && "text-muted-foreground"
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
                  entry.isCurrentUser ? "text-primary" : "text-card-foreground"
                )}
              >
                {entry.displayName ?? entry.username}
                {entry.isCurrentUser && (
                  <span className="ml-1 text-xs text-primary/80">(you)</span>
                )}
              </span>
            </div>

            {/* Power */}
            <div className="text-sm font-semibold text-card-foreground">
              {entry.power.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/50">
        <Link
          href={`/rankings?scope=city&city=${encodeURIComponent(city)}`}
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View Full Rankings
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
