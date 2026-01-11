"use client"

/**
 * ProfileHeroRibbon - Lifetime/historical stats display
 *
 * Unlike HomeHeroRibbon which shows weekly competition data,
 * this component shows lifetime achievements and historical stats:
 * - Sport Index (overall)
 * - Total activities (all-time)
 * - Total distance (all-time)
 * - Total time (all-time)
 * - Member since
 *
 * This aligns with Phase 3: Profile = historical, Home = current competition
 */

import { Zap, Route, Clock, Activity, Calendar, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface ProfileHeroRibbonProps {
  metrics: {
    sportIndex: number
    sportIndexDelta: number
    totalActivities: number
    totalDistanceKm: number
    totalTimeMinutes: number
    memberSince: Date | string
    personalRecordsCount?: number
  }
}

export function ProfileHeroRibbon({ metrics }: ProfileHeroRibbonProps) {
  const TrendIcon = metrics.sportIndexDelta > 0
    ? TrendingUp
    : metrics.sportIndexDelta < 0
      ? TrendingDown
      : Minus

  const trendClass = metrics.sportIndexDelta > 0
    ? "text-emerald-500"
    : metrics.sportIndexDelta < 0
      ? "text-red-500"
      : "text-muted-foreground"

  const memberDate = new Date(metrics.memberSince)

  return (
    <div className="relative z-20 -mt-6 px-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Floating glass ribbon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl p-4 md:p-5"
        >
          {/* Stats grid with vertical dividers */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-0">
            {/* Sport Index with Radial Progress */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:pr-4">
              <RadialProgress
                value={Math.min(metrics.sportIndex, 1000)}
                max={1000}
                label="Sport Index"
              >
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                  {metrics.sportIndex}
                </span>
              </RadialProgress>
              <div className={cn("flex items-center gap-1 text-xs font-medium mt-1", trendClass)}>
                <TrendIcon className="w-3 h-3" />
                {metrics.sportIndexDelta > 0 ? "+" : ""}{metrics.sportIndexDelta}
              </div>
            </div>

            {/* Total Activities (Lifetime) */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:px-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Total Activities
              </span>
              <div className="relative">
                <Activity className="w-8 h-8 text-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-foreground">
                  {metrics.totalActivities.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">all time</span>
            </div>

            {/* Total Distance (Lifetime) */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:px-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Total Distance
              </span>
              <div className="relative">
                <Route className="w-8 h-8 text-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Route className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-foreground">
                  {formatDistance(metrics.totalDistanceKm)}
                </span>
                <span className="text-xs text-muted-foreground">km</span>
              </div>
            </div>

            {/* Total Time (Lifetime) */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:px-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Total Time
              </span>
              <TotalTimeDisplay minutes={metrics.totalTimeMinutes} />
            </div>

            {/* Member Since / PRs */}
            <div className="flex flex-col items-center md:pl-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Member Since
              </span>
              <div className="relative">
                <Calendar className="w-8 h-8 text-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-foreground">
                  {format(memberDate, "MMM yyyy")}
                </span>
              </div>
              {metrics.personalRecordsCount !== undefined && metrics.personalRecordsCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  <span>{metrics.personalRecordsCount} PRs</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Format large distances nicely (e.g., 1,234 or 12.3k)
 */
function formatDistance(km: number): string {
  if (km >= 10000) {
    return `${(km / 1000).toFixed(1)}k`
  }
  if (km >= 1000) {
    return km.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }
  return km.toFixed(1)
}

/**
 * Radial Progress Ring for Sport Index
 */
function RadialProgress({
  value,
  max,
  label,
  children,
}: {
  value: number
  max: number
  label: string
  children: React.ReactNode
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const circumference = 2 * Math.PI * 36 // radius = 36
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        {label}
      </span>
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            stroke="url(#profile-gradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            style={{
              strokeDasharray: circumference,
            }}
          />
          <defs>
            <linearGradient id="profile-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Total Time Display - shows hours for lifetime totals
 */
function TotalTimeDisplay({ minutes }: { minutes: number }) {
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Clock className="w-8 h-8 text-primary/20" />
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Clock className="w-5 h-5 text-primary" />
        </motion.div>
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        {days > 0 ? (
          <>
            <span className="text-2xl font-bold text-foreground">{days}</span>
            <span className="text-xs text-muted-foreground">d</span>
            <span className="text-lg font-bold text-foreground">{hours % 24}</span>
            <span className="text-xs text-muted-foreground">h</span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold text-foreground">{hours}</span>
            <span className="text-xs text-muted-foreground">h</span>
          </>
        )}
      </div>
    </div>
  )
}
