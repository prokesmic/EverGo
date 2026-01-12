"use client"

/**
 * HeroRibbon - Sport-Aware Unified ribbon with period switcher
 *
 * V7: Dynamic metrics based on user's primary sport.
 *
 * Features:
 * - Glassmorphism design that integrates with hero
 * - Period switcher (Week/Month/Year/All)
 * - Sport-aware metrics that change based on primary sport
 * - Tile #1 is ALWAYS Global Rank
 * - URL-synced range state (?range=week|month|year|all)
 */

import { useCallback, useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Zap,
  Flame,
  Clock,
  Activity,
  Calendar,
  TrendingUp,
  Trophy,
  Mountain,
  MapPin,
  Target,
  Award,
  Dumbbell,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import type { RibbonRange, RibbonMetricKey, MetricFormat } from "@/lib/ribbon/ribbonConfig"

// =============================================================================
// TYPES
// =============================================================================

interface RibbonMetricValue {
  key: RibbonMetricKey
  label: string
  value: number | string | null
  formatted: string
  unit?: string
  format: MetricFormat
}

interface RibbonViewModel {
  range: RibbonRange
  sportSlug: string
  sportName: string
  metrics: RibbonMetricValue[]
  userCreatedAt: string
}

interface HeroRibbonProps {
  /** Default range for this page */
  defaultRange?: RibbonRange
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

// Metric key to icon mapping
const METRIC_ICONS: Record<RibbonMetricKey, LucideIcon> = {
  GLOBAL_RANK: Trophy,
  SPORT_INDEX: Target,
  POWER: Zap,
  SESSIONS: Activity,
  ACTIVITIES: Activity,
  ACTIVE_TIME: Clock,
  DISTANCE: MapPin,
  ELEVATION: Mountain,
  DAYS_ACTIVE: Calendar,
  VARIETY: Target,
  ELO: Award,
  WIN_RATE: TrendingUp,
  STREAK: Flame,
  PR_COUNT: Award,
  VOLUME: Dumbbell,
  AVG_PACE: Clock,
  AVG_HEART_RATE: Activity,
  CALORIES: Flame,
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HeroRibbon({
  defaultRange = "week",
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
  const [viewModel, setViewModel] = useState<RibbonViewModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      setViewModel(data)
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
    viewModel?.userCreatedAt ? new Date(viewModel.userCreatedAt) : undefined
  ) ?? ""

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn(
            "overflow-hidden",
            isDocked
              ? [
                  // Docked variant: dark glass inside hero - rounded bottom to match hero
                  "rounded-b-3xl",
                  "border-t border-white/10",
                  "bg-black/30 backdrop-blur-md",
                  "min-h-[100px]", // Fixed height to prevent layout shift
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

              {/* Sport Badge + Caption */}
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider min-h-[20px]">
                {viewModel?.sportName && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                    isDocked ? "bg-white/10 text-white/80" : "bg-primary/10 text-primary"
                  )}>
                    {viewModel.sportName}
                  </span>
                )}
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

          {/* Dynamic Stats Grid */}
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
                  {(viewModel?.metrics ?? getPlaceholderMetrics()).map((metric, index) => (
                    <MetricTile
                      key={metric.key}
                      metric={metric}
                      isLoading={isLoading}
                      isDocked={isDocked}
                      isFirst={index === 0}
                      isLast={index === 4}
                    />
                  ))}
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
// METRIC TILE COMPONENT
// =============================================================================

interface MetricTileProps {
  metric: RibbonMetricValue
  isLoading: boolean
  isDocked: boolean
  isFirst: boolean
  isLast: boolean
}

function MetricTile({ metric, isLoading, isDocked, isFirst, isLast }: MetricTileProps) {
  const Icon = METRIC_ICONS[metric.key] ?? Activity
  const isGlobalRank = metric.key === "GLOBAL_RANK"
  const isStreak = metric.key === "STREAK"
  const isPower = metric.key === "POWER"

  return (
    <div className={cn(
      "flex flex-col items-center relative overflow-hidden",
      !isLast && "md:border-r md:pr-3",
      !isFirst && "md:pl-3",
      isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
    )}>
      {/* Label */}
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-widest mb-1",
        isDocked ? "text-white/50" : "text-muted-foreground/70"
      )}>
        {metric.label}
      </span>

      {/* Icon + Value */}
      <div className="relative flex items-center gap-1.5">
        {/* Animated icon for special metrics */}
        {isStreak && (
          <motion.div
            animate={!isLoading && (metric.value as number) > 0 ? {
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className={cn(
              "w-4 h-4",
              (metric.value as number) > 0
                ? "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                : isDocked ? "text-white/30" : "text-muted-foreground/40"
            )} />
          </motion.div>
        )}

        {isPower && (
          <motion.div
            animate={!isLoading && (metric.value as number) > 0 ? {
              scale: [1, 1.15, 1],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className="w-4 h-4 text-primary drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" />
          </motion.div>
        )}

        {!isStreak && !isPower && !isGlobalRank && (
          <Icon className={cn(
            "w-4 h-4",
            isDocked ? "text-white/40" : "text-muted-foreground/50"
          )} />
        )}

        {/* Value */}
        <span className={cn(
          "text-xl font-black font-mono",
          isGlobalRank && "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500",
          !isGlobalRank && (isDocked ? "text-white" : "text-foreground")
        )}>
          {isLoading ? "—" : metric.formatted}
        </span>

        {/* Trophy icon for Global Rank */}
        {isGlobalRank && (
          <Trophy className={cn(
            "w-4 h-4",
            metric.value ? "text-amber-500" : isDocked ? "text-white/30" : "text-muted-foreground/40"
          )} />
        )}
      </div>

      {/* Unit label if present */}
      {metric.unit && !isGlobalRank && (
        <span className={cn(
          "text-[9px] uppercase tracking-wider mt-0.5",
          isDocked ? "text-white/40" : "text-muted-foreground/50"
        )}>
          {metric.unit}
        </span>
      )}

      {/* Subtle glow for streak */}
      {isStreak && (metric.value as number) > 0 && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  )
}

// =============================================================================
// HELPERS
// =============================================================================

function isValidRange(range: string): range is RibbonRange {
  return ["week", "month", "year", "all"].includes(range)
}

function getPlaceholderMetrics(): RibbonMetricValue[] {
  return [
    { key: "GLOBAL_RANK", label: "Global Rank", value: null, formatted: "—", format: "rank" },
    { key: "SPORT_INDEX", label: "Sport Index", value: null, formatted: "—", format: "score" },
    { key: "ACTIVITIES", label: "Activities", value: null, formatted: "—", format: "int" },
    { key: "ACTIVE_TIME", label: "Active Time", value: null, formatted: "—", format: "duration" },
    { key: "POWER", label: "Power", value: null, formatted: "—", format: "int" },
  ]
}
