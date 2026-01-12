"use client"

/**
 * HeroRibbon - Sport-Aware Unified ribbon with period switcher
 *
 * V8: Fixed height dock that never causes layout shift.
 *
 * Features:
 * - Glassmorphism design that integrates with hero
 * - Period switcher (Week/Month/Year/All)
 * - Sport-aware metrics that change based on primary sport
 * - Tile #1 is ALWAYS Global Rank
 * - URL-synced range state (?range=week|month|year|all)
 *
 * LAYOUT STABILITY:
 * - Fixed height (h-[100px]) for docked variant
 * - No entrance animations that affect position
 * - Header always rendered (no conditional rows)
 * - Values change but structure stays identical
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

// Fixed height for docked ribbon - must match exactly in SSR and client
const DOCKED_HEIGHT = "h-[100px]"

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

  // Get sport name with fallback for loading state
  const sportName = viewModel?.sportName ?? ""

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
        {/*
          FIXED HEIGHT RIBBON - NO LAYOUT SHIFT
          Height is locked to DOCKED_HEIGHT for docked variant.
          No entrance animations that affect position/size.
        */}
        <div
          className={cn(
            "overflow-hidden",
            isDocked
              ? [
                  // Docked variant: dark glass inside hero
                  "rounded-b-3xl",
                  "border-t border-white/10",
                  "bg-black/30 backdrop-blur-md",
                  DOCKED_HEIGHT, // Fixed height - critical for no layout shift
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
          {/* Range Switcher Header - ALWAYS rendered, fixed height */}
          <div className={cn(
            "h-[32px] px-3 md:px-4 flex items-center border-b",
            isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
          )}>
            <div className="flex items-center justify-between w-full">
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
                      "px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full transition-colors duration-200",
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

              {/* Sport Badge + Caption - fixed height container */}
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider h-[20px]">
                {/* Sport badge - reserve space even when empty */}
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase min-w-[60px] text-center",
                  isDocked ? "bg-white/10 text-white/80" : "bg-primary/10 text-primary",
                  !sportName && "opacity-0" // Invisible but takes space
                )}>
                  {sportName || "Sport"}
                </span>
                <Calendar className={cn("w-3 h-3 shrink-0", isDocked ? "text-white/50" : "text-muted-foreground/60")} />
                <span className={cn("uppercase whitespace-nowrap", isDocked ? "text-white/60" : "text-muted-foreground")}>
                  {currentCaption}
                </span>
                {(isLoading || isPending) && (
                  <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Stats Grid - fixed height */}
          <div className="h-[68px] px-3 md:px-4 flex items-center">
            {error ? (
              <div className={cn("text-center w-full py-4", isDocked ? "text-white/60" : "text-muted-foreground")}>
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-0 w-full">
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
              </div>
            )}
          </div>
        </div>
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
      "flex flex-col items-center justify-center h-full",
      !isLast && "border-r",
      isDocked ? "border-white/10" : "border-black/5 dark:border-white/5"
    )}>
      {/* Label - fixed height */}
      <span className={cn(
        "text-[9px] font-bold uppercase tracking-widest mb-1 h-[12px]",
        isDocked ? "text-white/50" : "text-muted-foreground/70"
      )}>
        {metric.label}
      </span>

      {/* Icon + Value - fixed height */}
      <div className="relative flex items-center gap-1.5 h-[24px]">
        {/* Icon */}
        {!isGlobalRank && (
          <Icon className={cn(
            "w-4 h-4",
            isStreak && (metric.value as number) > 0 && "text-orange-500",
            isPower && "text-primary",
            !isStreak && !isPower && (isDocked ? "text-white/40" : "text-muted-foreground/50")
          )} />
        )}

        {/* Value */}
        <span className={cn(
          "text-xl font-black font-mono transition-opacity duration-200",
          isLoading && "opacity-50",
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

      {/* Unit label - fixed height (only shown for metrics with units) */}
      <span className={cn(
        "text-[9px] uppercase tracking-wider mt-0.5 h-[12px]",
        isDocked ? "text-white/40" : "text-muted-foreground/50",
        (!metric.unit || isGlobalRank) && "opacity-0" // Invisible but takes space
      )}>
        {metric.unit || "—"}
      </span>
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
