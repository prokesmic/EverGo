"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Swords, Trophy, Users } from "lucide-react"
import { prioritizeCompeteItems, CompeteItem } from "@/lib/home/prioritizeCompeteItems"
import { ActiveRivalryCard } from "@/components/home/ActiveRivalryCard"
import { cn } from "@/lib/utils"

interface CompeteNowDeckProps {
  items: CompeteItem[]
  onLogForRivalry?: (rivalryId: string) => void
  className?: string
}

export function CompeteNowDeck({
  items,
  onLogForRivalry,
  className,
}: CompeteNowDeckProps) {
  const sorted = prioritizeCompeteItems(items)
  const top3 = sorted.slice(0, 3)

  // Check if we only have teaser or no items
  const hasRealContent = top3.some((item) => item.kind !== "teaser")

  return (
    <section className={cn("mt-4", className)} data-testid="home-compete-now">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-foreground">Compete now</div>
        <Link
          href="/rivalries"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
          data-testid="home-compete-all"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Show teaser if no real content */}
        {!hasRealContent && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                <Swords className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  Start a rivalry
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  Challenge someone in your primary sport and track the battle.
                </div>
                <Link
                  href="/rivalries/new"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-800 transition"
                  data-testid="home-start-rivalry"
                >
                  Find a rival
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Render actual compete items */}
        {top3.map((item) => {
          if (item.kind === "rivalry") {
            return (
              <ActiveRivalryCard
                key={`r-${item.id}`}
                id={item.id}
                opponentName={item.opponentName}
                opponentAvatarUrl={item.opponentAvatarUrl}
                sportLabel={item.sportSlug ?? null}
                delta={item.delta ?? null}
                status={item.status ?? "UNKNOWN"}
                endsAt={item.endsAt ?? null}
                onLogForRivalry={() => onLogForRivalry?.(item.id)}
                href="/rivalries"
              />
            )
          }

          // Challenge card (compact, premium)
          if (item.kind === "challenge") {
            return (
              <Link
                key={`c-${item.id}`}
                href={`/challenges/${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                data-testid="home-challenge-card"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Trophy className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {item.progress !== null && item.progress !== undefined
                        ? `${Math.round(item.progress * 100)}% complete`
                        : "Tap to view progress"}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition shrink-0" />
                </div>
              </Link>
            )
          }

          // Team battle card (compact, premium)
          if (item.kind === "teamBattle") {
            return (
              <Link
                key={`t-${item.id}`}
                href={`/teams/${item.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                data-testid="home-teambattle-card"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {item.teamName
                        ? `Team: ${item.teamName}`
                        : "Tap to see standings"}
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition shrink-0" />
                </div>
              </Link>
            )
          }

          return null
        })}
      </div>
    </section>
  )
}
