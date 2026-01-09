'use client'

import { cn } from '@/lib/utils'
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PowerCardProps {
  currentPower: number
  delta: number
  percentChange: number
  breakdown: {
    easy: number
    moderate: number
    hard: number
    race: number
  }
  activityCount: number
  className?: string
}

export function PowerCard({
  currentPower,
  delta,
  percentChange,
  breakdown,
  activityCount,
  className
}: PowerCardProps) {
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
  const trendColor = delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-500' : 'text-slate-400'

  const totalMinutes = breakdown.easy + breakdown.moderate + breakdown.hard + breakdown.race

  return (
    <div className={cn(
      "rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10",
      "border border-violet-500/20 p-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-medium text-slate-600">This Week</span>
        </div>
        <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
          <TrendIcon className="w-4 h-4" />
          <span>{delta > 0 ? '+' : ''}{delta}</span>
        </div>
      </div>

      {/* Main Score */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-slate-900">
            {currentPower.toLocaleString()}
          </span>
          <span className="text-lg text-slate-500">Power</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {activityCount} activities · {totalMinutes} min
        </p>
      </div>

      {/* Breakdown Bar */}
      <div className="space-y-2">
        <div className="flex h-3 rounded-full overflow-hidden bg-slate-200">
          {breakdown.easy > 0 && totalMinutes > 0 && (
            <div
              className="bg-emerald-400 transition-all"
              style={{ width: `${(breakdown.easy / totalMinutes) * 100}%` }}
            />
          )}
          {breakdown.moderate > 0 && totalMinutes > 0 && (
            <div
              className="bg-amber-400 transition-all"
              style={{ width: `${(breakdown.moderate / totalMinutes) * 100}%` }}
            />
          )}
          {breakdown.hard > 0 && totalMinutes > 0 && (
            <div
              className="bg-orange-500 transition-all"
              style={{ width: `${(breakdown.hard / totalMinutes) * 100}%` }}
            />
          )}
          {breakdown.race > 0 && totalMinutes > 0 && (
            <div
              className="bg-red-500 transition-all"
              style={{ width: `${(breakdown.race / totalMinutes) * 100}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Easy {breakdown.easy}m
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            Moderate {breakdown.moderate}m
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            Hard {breakdown.hard}m
          </div>
          {breakdown.race > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Race {breakdown.race}m
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Legacy export for backward compatibility
export const EffortScoreCard = PowerCard
