"use client"

import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react"

type RankingInsights = {
  globalRank?: number
  globalRankChange?: number
  cityRank?: number
  cityRankChange?: number
  countryRank?: number
  countryRankChange?: number
}

type RankingDeltaProps = {
  insights: RankingInsights
}

export function AuroraRankingDeltaWidget({ insights }: RankingDeltaProps) {
  const globalDelta = insights.globalRankChange ?? 0
  const cityDelta = insights.cityRankChange ?? 0

  const TrendIcon = ({ delta }: { delta: number }) => {
    if (delta < 0) return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
    if (delta > 0) return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
    return <Minus className="w-3.5 h-3.5 text-slate-400" />
  }

  const trendLabel = (delta: number) => {
    if (delta === 0) return "No change"
    if (delta < 0) return `+${Math.abs(delta)} places`
    return `-${delta} places`
  }

  const trendColor = (delta: number) => {
    if (delta < 0) return "text-emerald-600"
    if (delta > 0) return "text-red-500"
    return "text-slate-500"
  }

  return (
    <div className="eg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="eg-widget-title">Ranking movement</p>
          <p className="text-lg font-semibold text-slate-900">
            This week&apos;s climb
          </p>
        </div>
        <div className="eg-icon-box-sky">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="eg-stat-box">
          <p className="eg-stat-label">Global rank</p>
          <p className="eg-stat-value">
            #{insights.globalRank?.toLocaleString() ?? "-"}
          </p>
          <div className={`flex items-center gap-1 text-xs ${trendColor(globalDelta)}`}>
            <TrendIcon delta={globalDelta} />
            <span>{trendLabel(globalDelta)}</span>
          </div>
        </div>

        <div className="eg-stat-box">
          <p className="eg-stat-label">City rank</p>
          <p className="eg-stat-value">
            #{insights.cityRank?.toLocaleString() ?? "-"}
          </p>
          <div className={`flex items-center gap-1 text-xs ${trendColor(cityDelta)}`}>
            <TrendIcon delta={cityDelta} />
            <span>{trendLabel(cityDelta)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Rankings update daily based on your Sport Index and activity volume.
      </p>
    </div>
  )
}
