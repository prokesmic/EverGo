"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Trophy,
  Flame,
  TrendingUp,
  TrendingDown,
  Plus,
  ChevronRight,
  Globe,
  MapPin,
  Building2,
  Users,
  Timer,
  Route,
  ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRankScopes, RankScopeData } from "@/lib/leaderboards"

type ScopeId = "global" | "country" | "city" | "team"

const SCOPE_CONFIG: Record<ScopeId, { icon: typeof Globe; label: string; color: string }> = {
  global: { icon: Globe, label: "Global", color: "text-emerald-400" },
  country: { icon: MapPin, label: "Country", color: "text-sky-400" },
  city: { icon: Building2, label: "City", color: "text-amber-400" },
  team: { icon: Users, label: "Team", color: "text-violet-400" },
}

interface HeroKpiDockProps {
  sportIndex: number
  sportIndexDelta?: number | null
  streakDays: number
  ranks: UserRankScopes
  weeklyStats?: {
    sessions: number
    minutes: number
    distance: number // km
  }
  primaryCtaHref?: string
  secondaryHref?: string
  className?: string
}

export function HeroKpiDock({
  sportIndex,
  sportIndexDelta,
  streakDays,
  ranks,
  weeklyStats,
  primaryCtaHref = "/activity/create",
  secondaryHref = "/profile/me",
  className,
}: HeroKpiDockProps) {
  const [activeScope, setActiveScope] = useState<ScopeId>("global")
  const activeRank = ranks[activeScope]

  return (
    <div
      className={cn(
        // Premium centered glass dock
        "mx-auto w-full max-w-[1100px]",
        "rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl",
        "shadow-2xl shadow-black/20",
        "overflow-hidden",
        className
      )}
      data-testid="hero-kpi-dock"
    >
      {/* Desktop: Clean grid layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 divide-x divide-white/10">
          {/* Sport Index - 3 cols */}
          <div className="col-span-3 p-5">
            <SportIndexCard value={sportIndex} delta={sportIndexDelta} />
          </div>

          {/* Rank with Scope Switcher - 5 cols */}
          <div className="col-span-5 p-5">
            <RankCard
              activeScope={activeScope}
              onScopeChange={setActiveScope}
              rank={activeRank}
            />
          </div>

          {/* Streak - 2 cols */}
          <div className="col-span-2 p-5">
            <StreakCard streakDays={streakDays} weeklyStats={weeklyStats} />
          </div>

          {/* CTA - 2 cols */}
          <div className="col-span-2 p-5 flex items-center justify-center">
            <CtaCard primaryHref={primaryCtaHref} secondaryHref={secondaryHref} />
          </div>
        </div>
      </div>

      {/* Mobile: Clean stacked layout */}
      <div className="lg:hidden">
        {/* Top row: Sport Index + Streak */}
        <div className="grid grid-cols-2 divide-x divide-white/10">
          <div className="p-4">
            <SportIndexCard value={sportIndex} delta={sportIndexDelta} compact />
          </div>
          <div className="p-4">
            <StreakCard streakDays={streakDays} compact />
          </div>
        </div>

        {/* Rank section - full width */}
        <div className="border-t border-white/10 p-4">
          <RankCard
            activeScope={activeScope}
            onScopeChange={setActiveScope}
            rank={activeRank}
            compact
          />
        </div>

        {/* CTA - full width */}
        <div className="border-t border-white/10 p-4">
          <Link
            href={primaryCtaHref}
            className={cn(
              "flex w-full items-center justify-center gap-2",
              "rounded-2xl bg-orange-500 px-5 py-3",
              "text-sm font-semibold text-white",
              "shadow-lg shadow-orange-500/20",
              "hover:bg-orange-400 hover:-translate-y-0.5",
              "transition-all duration-200"
            )}
            data-testid="log-activity-cta"
          >
            <Plus className="h-4 w-4" />
            Log Activity
          </Link>
        </div>
      </div>
    </div>
  )
}

// Sport Index Card
function SportIndexCard({
  value,
  delta,
  compact = false,
}: {
  value: number
  delta?: number | null
  compact?: boolean
}) {
  const hasDelta = delta !== null && delta !== undefined && delta !== 0

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10",
          compact ? "h-10 w-10" : "h-11 w-11"
        )}
      >
        <Trophy className={cn("text-white/90", compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-white/60">
          Sport Index
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span
            className={cn(
              "font-semibold tabular-nums text-white",
              compact ? "text-xl" : "text-2xl"
            )}
          >
            {value}
          </span>
          {hasDelta && (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                compact ? "text-xs" : "text-sm",
                delta! > 0 ? "text-emerald-300" : "text-red-400"
              )}
            >
              {delta! > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {delta! > 0 ? "+" : ""}
              {delta}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Rank Card with robust scope tabs
function RankCard({
  activeScope,
  onScopeChange,
  rank,
  compact = false,
}: {
  activeScope: ScopeId
  onScopeChange: (scope: ScopeId) => void
  rank: RankScopeData
  compact?: boolean
}) {
  const config = SCOPE_CONFIG[activeScope]
  const Icon = config.icon
  const hasRank = rank.rank !== null

  return (
    <div className="space-y-3">
      {/* Header with link */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-white/60">
          Your Rank
        </div>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
        >
          Full rankings <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Scope Tabs - FIXED overflow */}
      <div
        className={cn(
          // CRITICAL: overflow-hidden keeps tabs inside the rounded container
          "max-w-full overflow-hidden rounded-full",
          "border border-white/10 bg-white/10 p-1 backdrop-blur-md"
        )}
      >
        {/* overflow-x-auto as fallback for very narrow widths */}
        <div className="flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap">
          {(Object.keys(SCOPE_CONFIG) as ScopeId[]).map((scope) => {
            const scopeConfig = SCOPE_CONFIG[scope]
            const ScopeIcon = scopeConfig.icon
            const isActive = scope === activeScope

            return (
              <button
                key={scope}
                type="button"
                onClick={() => onScopeChange(scope)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full transition-all",
                  "min-w-0", // Critical: allows button to shrink inside flex
                  compact ? "px-2 py-1.5" : "px-3 py-1.5",
                  isActive
                    ? "bg-white/15 text-white shadow-sm ring-1 ring-white/15"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
                aria-pressed={isActive}
                data-testid={`scope-${scope}`}
              >
                <ScopeIcon
                  className={cn(
                    "shrink-0 opacity-90",
                    compact ? "h-3 w-3" : "h-3.5 w-3.5",
                    isActive && scopeConfig.color
                  )}
                />
                {/* truncate prevents label from spilling out */}
                <span
                  className={cn(
                    "font-medium truncate",
                    compact ? "text-[10px] max-w-[48px]" : "text-xs max-w-[72px] sm:max-w-none"
                  )}
                >
                  {scopeConfig.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Rank Display */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl ring-1 ring-white/10",
            compact ? "h-10 w-10" : "h-11 w-11",
            hasRank ? "bg-white/10" : "bg-white/5"
          )}
        >
          <Icon
            className={cn(
              compact ? "h-4 w-4" : "h-5 w-5",
              hasRank ? config.color : "text-slate-500"
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          {hasRank ? (
            <>
              <div
                className={cn(
                  "font-semibold tabular-nums text-white",
                  compact ? "text-xl" : "text-2xl"
                )}
              >
                #{rank.rank}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/60">
                <span>of {rank.total.toLocaleString()}</span>
                <span className="text-white/30">•</span>
                <span className="truncate max-w-[120px]">
                  {rank.scopeValue || rank.label}
                </span>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/settings/profile"
                className={cn(
                  "font-medium text-orange-400 hover:text-orange-300 transition-colors",
                  compact ? "text-sm" : "text-base"
                )}
              >
                {rank.missingField === "country" && "Set location"}
                {rank.missingField === "city" && "Add city"}
                {rank.missingField === "team" && "Join a team"}
                {!rank.missingField && "Complete profile"}
              </Link>
              <p className="text-sm text-white/50">to see your rank</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Streak Card
function StreakCard({
  streakDays,
  weeklyStats,
  compact = false,
}: {
  streakDays: number
  weeklyStats?: {
    sessions: number
    minutes: number
    distance: number
  }
  compact?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10",
          compact ? "h-10 w-10" : "h-11 w-11"
        )}
      >
        <Flame className={cn("text-white/90", compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-white/60">
          Streak
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-semibold tabular-nums text-white",
              compact ? "text-xl" : "text-2xl"
            )}
          >
            {streakDays}
          </span>
          <span className="text-sm text-white/60">days</span>
        </div>
        {/* Weekly mini stats - only on desktop */}
        {!compact && weeklyStats && (
          <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {Math.round(weeklyStats.minutes)}m
            </span>
            <span className="flex items-center gap-1">
              <Route className="h-3 w-3" />
              {weeklyStats.distance.toFixed(1)}km
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Desktop CTA Card
function CtaCard({
  primaryHref,
  secondaryHref,
}: {
  primaryHref: string
  secondaryHref: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Link
        href={primaryHref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-2xl bg-orange-500 px-5 py-3",
          "text-sm font-semibold text-white",
          "shadow-lg shadow-orange-500/20",
          "hover:bg-orange-400 hover:-translate-y-0.5",
          "transition-all duration-200"
        )}
        data-testid="log-activity-cta-desktop"
      >
        <Plus className="h-4 w-4" />
        Log Activity
      </Link>
      <Link
        href={secondaryHref}
        className="flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
      >
        View stats <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
