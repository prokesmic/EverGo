"use client"

/**
 * HeroRibbon - Unified ribbon with period switcher
 *
 * PROJECT AURORA UI - Premium glassmorphism bento design
 *
 * Features:
 * - Glassmorphism design that overlaps the hero
 * - Period switcher (Week/Month/Year/All)
 * - Range-based metrics that update without page reload
 * - Always-current metrics (Streak, Sport Index)
 * - URL-synced range state (?range=week|month|year|all)
 * - Enhanced visualizations (gauge, sparkline, flame animation)
 */

import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Zap, Flame, Clock, Activity, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import type { RibbonRange } from "@/lib/stats/getRibbonStats"
import { SportIndexGauge } from "@/components/benchmarks/SportIndexGauge"

// =============================================================================
// TYPES
// =============================================================================

interface RibbonStats {
  range: RibbonRange
  rangeStart: string
  rangeEnd: string
  rangeBased: {
    powerTotal: number
    activitiesCount: number
    activeTimeSeconds: number
    daysActiveCount: number
    distanceMeters: number
    elevationMeters: number
  }
  always: {
    currentStreakDays: number
    sportIndex: number
    sportIndexDelta: number
  }
  user: {
    createdAt: string
  }
}

interface HeroRibbonProps {
  /** Default range for this page */
  defaultRange?: RibbonRange
  /** Initial stats (server-rendered for faster FCP) */
  initialStats?: RibbonStats
  /** Page context for analytics */
  context?: "home" | "profile"
  /** Variant: "docked" (inside hero) or "floating" (overlapping card) */
  variant?: "docked" | "floating"
}

// =============================================================================
// CONSTANTS
// =============================================================================

const RANGE_OPTIONS: { value: RibbonRange; label: string; caption: (createdAt?: Date) => string }[] = [
  { value: "week", label: "Week", caption: () => "Last 7 days" },
  { value: "month", label: "Month", caption: () => "Last 30 days" },
  { value: "year", label: "Year", caption: () => "Last 365 days" },
  { value: "all", label: "All", caption: (createdAt) => createdAt ? `Since ${format(createdAt, "MMM yyyy")}` : "All time" },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function HeroRibbon({
  defaultRange = "week",
  initialStats,
  context = "home",
  variant = "docked",
}: HeroRibbonProps) {
  const isDocked = variant === "docked"
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get range from URL or use default
  const urlRange = searchParams.get("range") as RibbonRange | null
  const currentRange = urlRange && isValidRange(urlRange) ? urlRange : defaultRange

  // Stats state
  const [stats, setStats] = useState<RibbonStats | null>(initialStats ?? null)
  const [isLoading, setIsLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)

  // Fetch stats when range changes
  const fetchStats = useCallback(async (range: RibbonRange) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/me/ribbon?range=${range}`)
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error("Failed to fetch ribbon stats:", err)
      setError("Failed to load stats")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount and when range changes
  useEffect(() => {
    fetchStats(currentRange)
  }, [currentRange, fetchStats])

  // Handle range change
  const handleRangeChange = (newRange: RibbonRange) => {
    if (newRange === currentRange) return

    startTransition(() => {
      // Update URL without full page reload
      const params = new URLSearchParams(searchParams.toString())
      params.set("range", newRange)
      router.replace(`?${params.toString()}`, { scroll: false })
    })
  }

  // Calculate caption for current range
  const currentCaption = RANGE_OPTIONS.find((o) => o.value === currentRange)?.caption(
    stats?.user.createdAt ? new Date(stats.user.createdAt) : undefined
  ) ?? ""

  // Trend indicator
  const TrendIcon = (stats?.always.sportIndexDelta ?? 0) > 0
    ? TrendingUp
    : (stats?.always.sportIndexDelta ?? 0) < 0
      ? TrendingDown
      : Minus

  const trendClass = (stats?.always.sportIndexDelta ?? 0) > 0
    ? "text-emerald-500"
    : (stats?.always.sportIndexDelta ?? 0) < 0
      ? "text-red-500"
      : "text-muted-foreground"

  return (
    <div className={cn(
      isDocked
        ? "" // Docked: No wrapper styling, fits inside hero
        : "relative z-20 -mt-6 px-4 md:px-6" // Floating: overlaps hero
    )}>
      <div className={cn(
        isDocked
          ? "" // Docked: full width inside hero
          : "mx-auto max-w-5xl" // Floating: centered with max width
      )}>
        {/* Aurora Glass Ribbon - Premium frosted glass effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className={cn(
            "overflow-hidden",
            isDocked
              ? [
                  // Docked variant: dark glass inside hero
                  "border-t border-white/10",
                  "bg-black/35 backdrop-blur-md",
                ]
              : [
                  // Floating variant: light glass card
                  "rounded-2xl",
                  "bg-white/70 dark:bg-slate-900/70",
                  "backdrop-blur-xl backdrop-saturate-150",
                  "border border-white/40 dark:border-white/10",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
                  "ring-1 ring-inset ring-white/20 dark:ring-white/5",
                ]
          )}
        >
          {/* Range Switcher Header - Compact Aurora style */}
          <div className={cn(
            "px-3 md:px-4 pt-2 pb-1.5 border-b",
            isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
          )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Segmented Control - Pill style */}
              <nav
                className={cn(
                  "inline-flex items-center rounded-full p-0.5",
                  isDocked ? "bg-white/10" : "bg-black/5 dark:bg-white/5"
                )}
                role="tablist"
                aria-label="Select time range"
              >
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    role="tab"
                    aria-selected={currentRange === option.value}
                    aria-current={currentRange === option.value ? "true" : undefined}
                    onClick={() => handleRangeChange(option.value)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      currentRange === option.value
                        ? "bg-primary text-primary-foreground shadow-md"
                        : isDocked
                          ? "text-white/70 hover:text-white hover:bg-white/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </nav>

              {/* Caption - Mono style */}
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider">
                <Calendar className={cn("w-3 h-3", isDocked ? "text-white/50" : "text-muted-foreground/60")} />
                <span className={cn("uppercase", isDocked ? "text-white/60" : "text-muted-foreground")}>
                  {currentCaption}
                </span>
                {(isLoading || isPending) && (
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-3 py-2 md:px-4 md:py-2.5">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn("text-center py-4", isDocked ? "text-white/60" : "text-muted-foreground")}
                >
                  {error}
                </motion.div>
              ) : (
                <motion.div
                  key={currentRange}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-0"
                >
                  {/* Sport Index (always current) - Compact Bento Style */}
                  <div className={cn(
                    "flex flex-col items-center md:border-r md:pr-3",
                    isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
                  )}>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mb-1",
                      isDocked ? "text-white/50" : "text-muted-foreground/70"
                    )}>
                      Sport Index
                    </span>
                    <div className="relative flex items-center gap-2">
                      <div className="text-center">
                        <span className="text-2xl md:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-rose-600">
                          {isLoading ? "—" : stats?.always.sportIndex ?? 0}
                        </span>
                        <span className={cn(
                          "text-sm font-mono",
                          isDocked ? "text-white/40" : "text-muted-foreground/50"
                        )}>/1000</span>
                      </div>
                      <SportIndexGauge
                        score={stats?.always.sportIndex ?? 0}
                        size="sm"
                        className="hidden sm:block"
                      />
                    </div>
                    <div className={cn("flex items-center gap-1 text-[10px] font-mono font-medium", trendClass)}>
                      <TrendIcon className="w-2.5 h-2.5" />
                      {(stats?.always.sportIndexDelta ?? 0) > 0 ? "+" : ""}
                      {stats?.always.sportIndexDelta ?? 0}
                    </div>
                  </div>

                  {/* Day Streak (always current) - Animated Flame */}
                  <div className={cn(
                    "flex flex-col items-center md:border-r md:px-3 relative overflow-hidden",
                    isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
                  )}>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mb-1",
                      isDocked ? "text-white/50" : "text-muted-foreground/70"
                    )}>
                      Streak
                    </span>
                    <StreakDots streak={stats?.always.currentStreakDays ?? 0} isLoading={isLoading} isDocked={isDocked} />
                    <div className="flex items-center gap-1 mt-1">
                      <motion.div
                        animate={(stats?.always.currentStreakDays ?? 0) > 0 ? {
                          scale: [1, 1.1, 1],
                          opacity: [1, 0.8, 1],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Flame className={cn(
                          "w-4 h-4",
                          (stats?.always.currentStreakDays ?? 0) > 0
                            ? "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                            : isDocked ? "text-white/30" : "text-muted-foreground/40"
                        )} />
                      </motion.div>
                      <span className={cn(
                        "text-xl font-black font-mono",
                        isDocked ? "text-white" : "text-foreground"
                      )}>
                        {isLoading ? "—" : stats?.always.currentStreakDays ?? 0}
                      </span>
                      <span className={cn(
                        "text-[9px] uppercase tracking-wider",
                        isDocked ? "text-white/50" : "text-muted-foreground"
                      )}>days</span>
                    </div>
                    {/* Subtle flame glow background */}
                    {(stats?.always.currentStreakDays ?? 0) > 0 && (
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                    )}
                  </div>

                  {/* Power (range-based) - Bold mono display */}
                  <div className={cn(
                    "flex flex-col items-center md:border-r md:px-3",
                    isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
                  )}>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mb-1",
                      isDocked ? "text-white/50" : "text-muted-foreground/70"
                    )}>
                      Power
                    </span>
                    <div className="relative mb-0.5">
                      <Zap className={cn("w-6 h-6", isDocked ? "text-primary/30" : "text-primary/20")} />
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={!isLoading && (stats?.rangeBased.powerTotal ?? 0) > 0 ? {
                          scale: [1, 1.15, 1],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Zap className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" />
                      </motion.div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-xl font-black font-mono",
                        isDocked ? "text-white" : "text-foreground"
                      )}>
                        {isLoading ? "—" : (stats?.rangeBased.powerTotal ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Active Time (range-based) - Time display */}
                  <div className={cn(
                    "flex flex-col items-center md:border-r md:px-3",
                    isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
                  )}>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mb-1",
                      isDocked ? "text-white/50" : "text-muted-foreground/70"
                    )}>
                      Active Time
                    </span>
                    <TimeDisplay seconds={stats?.rangeBased.activeTimeSeconds ?? 0} isLoading={isLoading} isDocked={isDocked} />
                  </div>

                  {/* Activities (range-based) - Bar visualization */}
                  <div className="flex flex-col items-center md:pl-3">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest mb-1",
                      isDocked ? "text-white/50" : "text-muted-foreground/70"
                    )}>
                      Activities
                    </span>
                    <ActivityBars count={stats?.rangeBased.activitiesCount ?? 0} isLoading={isLoading} isDocked={isDocked} />
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={cn(
                        "text-xl font-black font-mono",
                        isDocked ? "text-white" : "text-foreground"
                      )}>
                        {isLoading ? "—" : stats?.rangeBased.activitiesCount ?? 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function isValidRange(range: string): range is RibbonRange {
  return ["week", "month", "year", "all"].includes(range)
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// StatValue removed - using inline font-mono styles instead

function StreakDots({ streak, isLoading, isDocked }: { streak: number; isLoading?: boolean; isDocked?: boolean }) {
  const days = Array.from({ length: 7 }, (_, i) => i < streak)

  return (
    <div className="flex items-center gap-0.5">
      {days.map((isActive, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: isLoading ? 0 : 0.1 + i * 0.05 }}
          className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isLoading
              ? isDocked ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
              : isActive
                ? "bg-gradient-to-r from-orange-400 to-red-500 shadow-[0_0_4px_rgba(249,115,22,0.5)]"
                : isDocked ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  )
}

function TimeDisplay({ seconds, isLoading, isDocked }: { seconds: number; isLoading?: boolean; isDocked?: boolean }) {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-0.5">
        <Clock className={cn("w-6 h-6", isDocked ? "text-primary/30" : "text-primary/20")} />
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isLoading ? 0 : 360 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Clock className="w-4 h-4 text-primary" />
        </motion.div>
      </div>
      <div className="flex items-baseline gap-0.5">
        {isLoading ? (
          <span className={cn("text-xl font-black font-mono", isDocked ? "text-white" : "text-foreground")}>—</span>
        ) : hours > 0 ? (
          <>
            <span className={cn("text-xl font-black font-mono", isDocked ? "text-white" : "text-foreground")}>{hours}</span>
            <span className={cn("text-[9px] uppercase", isDocked ? "text-white/50" : "text-muted-foreground")}>h</span>
            <span className={cn("text-base font-black font-mono", isDocked ? "text-white" : "text-foreground")}>{mins}</span>
            <span className={cn("text-[9px] uppercase", isDocked ? "text-white/50" : "text-muted-foreground")}>m</span>
          </>
        ) : (
          <>
            <span className={cn("text-xl font-black font-mono", isDocked ? "text-white" : "text-foreground")}>{mins}</span>
            <span className={cn("text-[9px] uppercase", isDocked ? "text-white/50" : "text-muted-foreground")}>min</span>
          </>
        )}
      </div>
    </div>
  )
}

function ActivityBars({ count, isLoading, isDocked }: { count: number; isLoading?: boolean; isDocked?: boolean }) {
  const maxBars = 7
  const filledBars = Math.min(count, maxBars)

  return (
    <div className="flex items-end gap-0.5 h-6">
      {Array.from({ length: maxBars }, (_, i) => {
        const isFilled = !isLoading && i < filledBars
        const height = isFilled ? 60 + (i * 5) : 20
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: isLoading ? 0 : 0.2 + i * 0.05, duration: 0.3 }}
            className={cn(
              "w-1 rounded-full",
              isFilled
                ? "bg-gradient-to-t from-primary/60 to-primary"
                : isDocked ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        )
      })}
    </div>
  )
}
