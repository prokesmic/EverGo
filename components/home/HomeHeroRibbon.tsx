"use client"

/**
 * HomeHeroRibbon - Premium glass ribbon that overlaps the hero bottom
 *
 * Shows key athlete metrics in a cohesive, high-end design
 */

import { Zap, Flame, Route, Clock, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface HomeHeroRibbonProps {
  metrics: {
    sportIndex: number
    sportIndexDelta: number
    dayStreak: number
    thisWeekKm: number
    activeTimeMinutes: number
    weekActivities: number
  }
}

export function HomeHeroRibbon({ metrics }: HomeHeroRibbonProps) {
  const TrendIcon = metrics.sportIndexDelta > 0
    ? TrendingUp
    : metrics.sportIndexDelta < 0
      ? TrendingDown
      : Minus

  const trendClass = metrics.sportIndexDelta > 0
    ? "text-emerald-600"
    : metrics.sportIndexDelta < 0
      ? "text-destructive"
      : "text-muted-foreground"

  return (
    <div className="relative z-20 -mt-10 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Glass ribbon container */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-md shadow-sm p-4">
          {/* Tiles grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Sport Index */}
            <MetricTile
              icon={Zap}
              label="Sport Index"
              value={metrics.sportIndex.toString()}
              delta={
                <span className={cn("flex items-center gap-0.5", trendClass)}>
                  <TrendIcon className="w-3 h-3" />
                  {metrics.sportIndexDelta > 0 ? "+" : ""}{metrics.sportIndexDelta}
                </span>
              }
              highlight
            />

            {/* Day Streak */}
            <MetricTile
              icon={Flame}
              label="Day Streak"
              value={metrics.dayStreak.toString()}
              suffix="days"
            />

            {/* This Week Distance */}
            <MetricTile
              icon={Route}
              label="This Week"
              value={metrics.thisWeekKm.toFixed(1)}
              suffix="km"
            />

            {/* Active Time */}
            <MetricTile
              icon={Clock}
              label="Active Time"
              value={metrics.activeTimeMinutes.toString()}
              suffix="min"
            />

            {/* Week Activities */}
            <MetricTile
              icon={Activity}
              label="Activities"
              value={metrics.weekActivities.toString()}
              suffix="this week"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricTileProps {
  icon: React.ElementType
  label: string
  value: string
  suffix?: string
  delta?: React.ReactNode
  highlight?: boolean
}

function MetricTile({ icon: Icon, label, value, suffix, delta, highlight }: MetricTileProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background/60 p-3",
        highlight && "bg-primary/5 border-primary/20"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        {delta && <span className="text-xs ml-auto">{delta}</span>}
      </div>
    </div>
  )
}
