"use client"

/**
 * ActivitySparkline - Tiny area chart for activity visualization
 *
 * Part of Project Aurora UI Overhaul
 * Shows last 7 days of activity with gradient fill
 */

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { cn } from "@/lib/utils"
import { format, subDays } from "date-fns"

interface ActivitySparklineProps {
  /** Array of daily values (e.g., minutes, power, activities) */
  data?: number[]
  /** Number of days to display (default: 7) */
  days?: number
  /** Height of the sparkline */
  height?: number
  /** Color variant */
  variant?: "primary" | "success" | "warning" | "accent"
  /** Show area fill */
  showFill?: boolean
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Custom class */
  className?: string
}

const variantColors = {
  primary: {
    stroke: "#f97316",
    fill: "url(#sparkline-gradient-primary)",
    gradient: ["#f97316", "#f9731600"],
  },
  success: {
    stroke: "#22c55e",
    fill: "url(#sparkline-gradient-success)",
    gradient: ["#22c55e", "#22c55e00"],
  },
  warning: {
    stroke: "#f59e0b",
    fill: "url(#sparkline-gradient-warning)",
    gradient: ["#f59e0b", "#f59e0b00"],
  },
  accent: {
    stroke: "#8b5cf6",
    fill: "url(#sparkline-gradient-accent)",
    gradient: ["#8b5cf6", "#8b5cf600"],
  },
}

export function ActivitySparkline({
  data = [],
  days = 7,
  height = 40,
  variant = "primary",
  showFill = true,
  showTooltip = false,
  className,
}: ActivitySparklineProps) {
  const colors = variantColors[variant]

  // Generate chart data with dates
  const chartData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(now, days - 1 - i)
      return {
        date: format(date, "EEE"),
        fullDate: format(date, "MMM d"),
        value: data[i] ?? 0,
      }
    })
  }, [data, days])

  // Check if all values are zero
  const hasData = data.some((v) => v > 0)

  if (!hasData) {
    // Show ghost sparkline
    return (
      <div className={cn("relative", className)} style={{ height }}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            No Activity
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
        >
          <defs>
            <linearGradient
              id={`sparkline-gradient-${variant}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={colors.gradient[0]} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colors.gradient[1]} stopOpacity={0} />
            </linearGradient>
          </defs>

          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const point = payload[0].payload
                return (
                  <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-2 py-1 shadow-lg">
                    <div className="text-[10px] text-muted-foreground">
                      {point.fullDate}
                    </div>
                    <div className="text-sm font-mono font-bold">
                      {point.value}
                    </div>
                  </div>
                )
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.stroke}
            strokeWidth={2}
            fill={showFill ? colors.fill : "transparent"}
            dot={false}
            activeDot={showTooltip ? { r: 3, fill: colors.stroke } : false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * WeeklyActivityBars - Bar visualization for weekly activity
 */
export function WeeklyActivityBars({
  data = [],
  height = 32,
  className,
}: {
  data?: number[]
  height?: number
  className?: string
}) {
  const maxValue = Math.max(...data, 1)

  return (
    <div
      className={cn("flex items-end gap-1", className)}
      style={{ height }}
    >
      {Array.from({ length: 7 }, (_, i) => {
        const value = data[i] ?? 0
        const heightPercent = (value / maxValue) * 100

        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t-sm transition-all duration-300",
              value > 0
                ? "bg-gradient-to-t from-primary/60 to-primary"
                : "bg-gray-200 dark:bg-gray-700"
            )}
            style={{
              height: value > 0 ? `${Math.max(heightPercent, 15)}%` : "15%",
            }}
          />
        )
      })}
    </div>
  )
}

/**
 * MiniTrendIndicator - Shows trend direction with sparkline
 */
export function MiniTrendIndicator({
  current,
  previous,
  className,
}: {
  current: number
  previous: number
  className?: string
}) {
  const change = current - previous
  const percentChange = previous > 0 ? (change / previous) * 100 : 0
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {!isNeutral && (
        <span
          className={cn(
            "text-xs font-medium",
            isPositive ? "text-emerald-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : ""}
          {Math.round(percentChange)}%
        </span>
      )}
      {isNeutral && (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  )
}
