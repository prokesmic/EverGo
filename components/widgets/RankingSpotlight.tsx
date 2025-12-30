"use client"

import Link from "next/link"
import { Trophy, TrendingUp, TrendingDown, Minus, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Helper functions extracted to avoid nested component definitions
function getTrendIcon(delta: number) {
  if (delta < 0) return TrendingUp
  if (delta > 0) return TrendingDown
  return Minus
}

function getTrendColor(delta: number) {
  if (delta < 0) return "text-emerald-400"
  if (delta > 0) return "text-red-400"
  return "text-slate-400"
}

function getTrendLabel(delta: number) {
  if (delta === 0) return "No change"
  if (delta < 0) return `+${Math.abs(delta)} places`
  return `-${delta} places`
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
}: RankingSpotlightProps) {
  const GlobalTrendIcon = getTrendIcon(globalRankChange)
  const CityTrendIcon = getTrendIcon(cityRankChange)

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl">
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
            <div className={cn("flex items-center gap-1 text-xs mt-1", getTrendColor(globalRankChange))}>
              <GlobalTrendIcon className="w-3 h-3" />
              <span>{getTrendLabel(globalRankChange)}</span>
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
            <div className={cn("flex items-center gap-1 text-xs mt-1", getTrendColor(cityRankChange))}>
              <CityTrendIcon className="w-3 h-3" />
              <span>{getTrendLabel(cityRankChange)}</span>
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
