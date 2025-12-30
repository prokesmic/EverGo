"use client"

import Link from "next/link"
import { Trophy, TrendingUp, TrendingDown, Minus, Users, ChevronRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper functions extracted to avoid nested component definitions
function getTrendIcon(delta: number) {
  if (delta < 0) return TrendingUp
  if (delta > 0) return TrendingDown
  return Minus
}

function getTrendColor(delta: number, compact: boolean) {
  if (delta < 0) return compact ? "text-emerald-400" : "text-emerald-400"
  if (delta > 0) return compact ? "text-red-400" : "text-red-400"
  return "text-slate-400"
}

function getTrendLabel(delta: number) {
  if (delta === 0) return "No change"
  if (delta < 0) return `+${Math.abs(delta)}`
  return `-${delta}`
}

interface RankingSpotlightProps {
  globalRank: number
  globalRankChange: number
  cityRank: number
  cityRankChange: number
  cityName: string
  sportIndex: number
  sportIndexChange: number
  percentile: number
  variant?: "compact" | "prominent"
}

export function RankingSpotlight({
  globalRank,
  globalRankChange,
  cityRank,
  cityRankChange,
  cityName,
  sportIndex,
  sportIndexChange,
  percentile,
  variant = "compact",
}: RankingSpotlightProps) {
  const GlobalTrendIcon = getTrendIcon(globalRankChange)
  const CityTrendIcon = getTrendIcon(cityRankChange)
  const compact = variant === "compact"

  if (compact) {
    return (
      <div
        className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-lg"
        data-testid="ranking-spotlight"
      >
        {/* Subtle accent glows */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-500/15 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="relative p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white text-sm">Your Rankings</span>
            </div>
            <Link
              href="/rankings"
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-0.5 transition-colors"
              data-testid="cta-view-rankings"
            >
              Compare <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Compact stats row */}
          <div className="flex items-center gap-3">
            {/* Global Rank */}
            <div className="flex-1 rounded-lg bg-white/5 border border-white/5 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Global</p>
                  <p className="text-xl font-bold text-white tabular-nums">
                    #{globalRank.toLocaleString()}
                  </p>
                </div>
                <div className={cn("flex items-center gap-0.5 text-xs", getTrendColor(globalRankChange, true))}>
                  <GlobalTrendIcon className="w-3 h-3" />
                  <span className="font-medium">{getTrendLabel(globalRankChange)}</span>
                </div>
              </div>
            </div>

            {/* City Rank */}
            <div className="flex-1 rounded-lg bg-white/5 border border-white/5 px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{cityName}</p>
                  <p className="text-xl font-bold text-white tabular-nums">
                    #{cityRank.toLocaleString()}
                  </p>
                </div>
                <div className={cn("flex items-center gap-0.5 text-xs", getTrendColor(cityRankChange, true))}>
                  <CityTrendIcon className="w-3 h-3" />
                  <span className="font-medium">{getTrendLabel(cityRankChange)}</span>
                </div>
              </div>
            </div>

            {/* Sport Index - compact pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500/15 to-emerald-500/10 border border-orange-500/15 px-3 py-2">
              <div>
                <p className="text-[10px] text-slate-300 uppercase tracking-wide">Index</p>
                <p className="text-xl font-bold text-white tabular-nums">{sportIndex}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400">Top {percentile}%</p>
                {sportIndexChange !== 0 && (
                  <p className={cn(
                    "text-xs font-medium flex items-center justify-end gap-0.5",
                    sportIndexChange > 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {sportIndexChange > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {sportIndexChange > 0 ? '+' : ''}{sportIndexChange}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prominent variant (original design)
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl"
      data-testid="ranking-spotlight"
    >
      {/* Accent glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Your Rankings</h3>
              <p className="text-xs text-slate-400">Updated today</p>
            </div>
          </div>
          <Link
            href="/rankings"
            className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition-colors"
            data-testid="cta-view-rankings"
          >
            Compare <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Rank Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Global Rank */}
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Global
            </p>
            <p className="text-3xl font-bold text-white tabular-nums">
              #{globalRank.toLocaleString()}
            </p>
            <div className={cn("flex items-center gap-1 text-xs mt-1", getTrendColor(globalRankChange, false))}>
              <GlobalTrendIcon className="w-3 h-3" />
              <span>{globalRankChange === 0 ? "No change" : (globalRankChange < 0 ? `+${Math.abs(globalRankChange)} places` : `-${globalRankChange} places`)}</span>
            </div>
          </div>

          {/* City Rank */}
          <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4">
            <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> {cityName}
            </p>
            <p className="text-3xl font-bold text-white tabular-nums">
              #{cityRank.toLocaleString()}
            </p>
            <div className={cn("flex items-center gap-1 text-xs mt-1", getTrendColor(cityRankChange, false))}>
              <CityTrendIcon className="w-3 h-3" />
              <span>{cityRankChange === 0 ? "No change" : (cityRankChange < 0 ? `+${Math.abs(cityRankChange)} places` : `-${cityRankChange} places`)}</span>
            </div>
          </div>
        </div>

        {/* Sport Index Footer */}
        <div className="rounded-xl bg-gradient-to-r from-orange-500/20 to-emerald-500/10 border border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-300 font-medium">Sport Index</p>
              <p className="text-2xl font-bold text-white tabular-nums">{sportIndex}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-300 font-medium">Top {percentile}%</p>
              {sportIndexChange !== 0 && (
                <p className={cn(
                  "text-sm font-semibold flex items-center justify-end gap-1",
                  sportIndexChange > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {sportIndexChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {sportIndexChange > 0 ? '+' : ''}{sportIndexChange} this week
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
