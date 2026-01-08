"use client"

/**
 * PaceBot Rivalry Card Component
 *
 * Displays an active rivalry with a PaceBot virtual competitor.
 */

import { cn } from "@/lib/utils"
import { Bot, TrendingUp, TrendingDown, Trophy, Target } from "lucide-react"
import type { PaceBotRivalryCard as RivalryCardType } from "@/lib/pacebot/types"
import Link from "next/link"

interface PaceBotRivalryCardProps {
  rivalry: RivalryCardType
  className?: string
}

export function PaceBotRivalryCard({
  rivalry,
  className,
}: PaceBotRivalryCardProps) {
  const isAhead = rivalry.delta >= 0
  const { paceBot } = rivalry.rivalry

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4",
        "bg-gradient-to-br from-purple-500/10 via-background to-background",
        "border-purple-500/20 hover:border-purple-500/40 transition-all",
        className
      )}
      data-testid="pacebot-rivalry-card"
    >
      {/* Bot indicator */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-medium">
          <Bot className="h-3 w-3" />
          <span>PaceBot</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Bot className="h-6 w-6 text-purple-400" />
          </div>
          {isAhead && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
          )}
          {!isAhead && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
              <TrendingDown className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{paceBot.name}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {rivalry.benchmark.name}
          </div>
          <div
            className={cn(
              "text-sm font-medium mt-0.5",
              isAhead ? "text-emerald-500" : "text-rose-400"
            )}
          >
            {rivalry.friendlyMessage}
          </div>
        </div>

        {/* Action */}
        <Link
          href={`/challenges/discover?benchmark=${rivalry.benchmark.id}`}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition",
            isAhead
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
          )}
        >
          {isAhead ? (
            <>
              <Trophy className="h-3.5 w-3.5" />
              Stay ahead
            </>
          ) : (
            <>
              <Target className="h-3.5 w-3.5" />
              Beat them
            </>
          )}
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isAhead ? "bg-emerald-500" : "bg-rose-500"
          )}
          style={{
            width: `${Math.min(100, Math.max(10, 50 + (rivalry.delta / rivalry.rivalry.paceBotValue) * 100))}%`,
          }}
        />
      </div>
    </div>
  )
}

/**
 * Empty state when user has no PaceBot rivalries
 */
export function PaceBotEmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-6 text-center",
        "border-purple-500/30 bg-purple-500/5",
        className
      )}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
        <Bot className="h-6 w-6 text-purple-400" />
      </div>
      <h3 className="font-semibold text-sm">No PaceBot Rivals</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Log a benchmark to get matched with a virtual competitor!
      </p>
      <Link
        href="/challenges/discover"
        className="inline-flex mt-3 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition"
      >
        Find a challenge
      </Link>
    </div>
  )
}

/**
 * CTA Card encouraging PaceBot engagement
 */
export function PaceBotCTA({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        "bg-gradient-to-br from-purple-600/20 to-pink-600/10",
        "border-purple-500/30",
        className
      )}
      data-testid="pacebot-cta"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Challenge a PaceBot</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            No nearby rivals? Compete against our AI-powered virtual athletes!
          </p>
          <Link
            href="/challenges/discover"
            className="inline-flex mt-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition"
          >
            Start a rivalry →
          </Link>
        </div>
      </div>
    </div>
  )
}
