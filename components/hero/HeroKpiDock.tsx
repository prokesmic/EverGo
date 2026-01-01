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
        "w-full rounded-2xl",
        "bg-white/10 backdrop-blur-md border border-white/15",
        "shadow-xl shadow-black/10",
        className
      )}
      data-testid="hero-kpi-dock"
    >
      {/* Desktop: 4-column grid */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:divide-x lg:divide-white/10">
        {/* Column 1: Sport Index */}
        <div className="p-4">
          <SportIndexCard
            value={sportIndex}
            delta={sportIndexDelta}
          />
        </div>

        {/* Column 2: Rank with Scope Switcher */}
        <div className="p-4">
          <RankCard
            activeScope={activeScope}
            onScopeChange={setActiveScope}
            rank={activeRank}
          />
        </div>

        {/* Column 3: Streak + Weekly Stats */}
        <div className="p-4">
          <MomentumCard
            streakDays={streakDays}
            weeklyStats={weeklyStats}
          />
        </div>

        {/* Column 4: CTA */}
        <div className="p-4 flex items-center justify-center">
          <CtaCard
            primaryHref={primaryCtaHref}
            secondaryHref={secondaryHref}
          />
        </div>
      </div>

      {/* Mobile: 2-row stacked layout */}
      <div className="lg:hidden">
        {/* Row 1: Sport Index + Rank */}
        <div className="grid grid-cols-2 divide-x divide-white/10">
          <div className="p-3">
            <SportIndexCard
              value={sportIndex}
              delta={sportIndexDelta}
              compact
            />
          </div>
          <div className="p-3">
            <RankCard
              activeScope={activeScope}
              onScopeChange={setActiveScope}
              rank={activeRank}
              compact
            />
          </div>
        </div>

        {/* Row 2: Streak + CTA */}
        <div className="grid grid-cols-2 divide-x divide-white/10 border-t border-white/10">
          <div className="p-3">
            <MomentumCard
              streakDays={streakDays}
              weeklyStats={weeklyStats}
              compact
            />
          </div>
          <div className="p-3 flex items-center justify-center">
            <CtaCard
              primaryHref={primaryCtaHref}
              secondaryHref={secondaryHref}
              compact
            />
          </div>
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
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-orange-500/20",
        compact ? "w-10 h-10" : "w-12 h-12"
      )}>
        <Trophy className={cn("text-orange-400", compact ? "w-5 h-5" : "w-6 h-6")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "font-bold text-white tabular-nums",
            compact ? "text-xl" : "text-2xl"
          )}>
            {value}
          </span>
          {hasDelta && (
            <span className={cn(
              "flex items-center gap-0.5 font-medium",
              compact ? "text-xs" : "text-sm",
              delta > 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {delta > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
        </div>
        <p className={cn(
          "uppercase tracking-wider text-slate-400",
          compact ? "text-[9px]" : "text-[10px]"
        )}>
          Sport Index
        </p>
      </div>
    </div>
  )
}

// Rank Card with Scope Switcher
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
    <div className="space-y-2">
      {/* Scope Switcher - Desktop shows all 4, Mobile shows active with dropdown feel */}
      <div className={cn(
        "flex rounded-lg bg-white/5 p-0.5",
        compact ? "gap-0.5" : "gap-1"
      )}>
        {(Object.keys(SCOPE_CONFIG) as ScopeId[]).map((scope) => {
          const scopeConfig = SCOPE_CONFIG[scope]
          const ScopeIcon = scopeConfig.icon
          const isActive = scope === activeScope

          return (
            <button
              key={scope}
              onClick={() => onScopeChange(scope)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 rounded-md transition-all",
                compact ? "py-1 px-1.5" : "py-1.5 px-2",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              data-testid={`scope-${scope}`}
            >
              <ScopeIcon className={cn(
                compact ? "w-3 h-3" : "w-3.5 h-3.5",
                isActive && scopeConfig.color
              )} />
              {!compact && (
                <span className="text-[10px] font-medium">
                  {scopeConfig.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Rank Display */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center justify-center rounded-xl",
          compact ? "w-10 h-10" : "w-12 h-12",
          hasRank ? "bg-white/10" : "bg-white/5"
        )}>
          <Icon className={cn(
            compact ? "w-5 h-5" : "w-6 h-6",
            hasRank ? config.color : "text-slate-500"
          )} />
        </div>
        <div className="flex-1 min-w-0">
          {hasRank ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className={cn(
                  "font-bold text-white tabular-nums",
                  compact ? "text-xl" : "text-2xl"
                )}>
                  #{rank.rank}
                </span>
                <span className={cn(
                  "text-slate-400",
                  compact ? "text-[10px]" : "text-xs"
                )}>
                  of {rank.total.toLocaleString()}
                </span>
              </div>
              <p className={cn(
                "text-slate-400 truncate",
                compact ? "text-[9px]" : "text-[10px]"
              )}>
                {rank.scopeValue || rank.label}
              </p>
            </>
          ) : (
            <>
              <Link
                href="/settings/profile"
                className={cn(
                  "font-medium text-orange-400 hover:text-orange-300 transition-colors",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                {rank.missingField === "country" && "Set location"}
                {rank.missingField === "city" && "Add city"}
                {rank.missingField === "team" && "Join a team"}
                {!rank.missingField && "Complete profile"}
              </Link>
              <p className={cn(
                "text-slate-500",
                compact ? "text-[9px]" : "text-[10px]"
              )}>
                to see your rank
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Momentum Card (Streak + Weekly Stats)
function MomentumCard({
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
    <div className={cn("flex items-center gap-3", compact && "gap-2")}>
      {/* Streak */}
      <div className={cn(
        "flex items-center justify-center rounded-xl bg-orange-500/20",
        compact ? "w-10 h-10" : "w-12 h-12"
      )}>
        <Flame className={cn("text-orange-400", compact ? "w-5 h-5" : "w-6 h-6")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            "font-bold text-white tabular-nums",
            compact ? "text-xl" : "text-2xl"
          )}>
            {streakDays}
          </span>
          <span className={cn(
            "text-slate-400",
            compact ? "text-[10px]" : "text-xs"
          )}>
            day streak
          </span>
        </div>

        {/* Weekly mini stats - only on desktop */}
        {!compact && weeklyStats && (
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {Math.round(weeklyStats.minutes)}m
            </span>
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3" />
              {weeklyStats.distance.toFixed(1)}km
            </span>
          </div>
        )}

        {compact && (
          <p className="text-[9px] uppercase tracking-wider text-slate-500">
            Keep it going
          </p>
        )}
      </div>
    </div>
  )
}

// CTA Card
function CtaCard({
  primaryHref,
  secondaryHref,
  compact = false,
}: {
  primaryHref: string
  secondaryHref: string
  compact?: boolean
}) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2",
      compact && "w-full"
    )}>
      <Link
        href={primaryHref}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-full",
          "bg-gradient-to-r from-orange-500 to-orange-600",
          "text-white font-semibold",
          "shadow-lg shadow-orange-500/30",
          "hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5",
          "transition-all duration-200",
          compact ? "px-4 py-2 text-sm w-full" : "px-6 py-3 text-sm"
        )}
        data-testid="log-activity-cta"
      >
        <Plus className={cn(compact ? "w-4 h-4" : "w-4 h-4")} />
        Log Activity
        {!compact && <ChevronRight className="w-4 h-4 -mr-1 opacity-70" />}
      </Link>

      {!compact && (
        <Link
          href={secondaryHref}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          View stats <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}
