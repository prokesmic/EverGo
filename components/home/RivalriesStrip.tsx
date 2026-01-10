"use client"

/**
 * V6 Rivalries Strip
 *
 * Horizontal scrollable strip of rivalry cards
 */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Flame } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface RivalryData {
  rivalryId: string
  opponent: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
  }
  wins: number
  losses: number
  ties: number
  isIntense: boolean
}

interface RivalriesStripProps {
  rivalries: RivalryData[]
}

export function RivalriesStrip({ rivalries }: RivalriesStripProps) {
  if (rivalries.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Your Rivalries</h2>
        <Link
          href="/profile?tab=rivalries"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {rivalries.map((rivalry) => (
          <RivalryChip key={rivalry.rivalryId} rivalry={rivalry} />
        ))}
      </div>
    </section>
  )
}

function RivalryChip({ rivalry }: { rivalry: RivalryData }) {
  const { opponent, wins, losses, ties, isIntense } = rivalry
  const isWinning = wins > losses
  const isLosing = losses > wins

  const record = `${wins}-${losses}${ties > 0 ? `-${ties}` : ""}`

  return (
    <Link
      href={`/profile/${opponent.username ?? opponent.id}`}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card",
        "hover:border-primary/30 transition-colors flex-shrink-0",
        isIntense && "border-primary/30 bg-primary/5"
      )}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={opponent.avatarUrl ?? undefined} />
        <AvatarFallback className="text-xs">
          {(opponent.displayName ?? opponent.username ?? "?")[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-card-foreground truncate max-w-[80px]">
          {opponent.displayName ?? opponent.username}
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            isWinning && "text-emerald-600",
            isLosing && "text-destructive",
            !isWinning && !isLosing && "text-muted-foreground"
          )}
        >
          {record}
        </span>
      </div>

      {isIntense && <Flame className="w-4 h-4 text-primary flex-shrink-0" />}
    </Link>
  )
}
