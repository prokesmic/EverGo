"use client"

/**
 * HomeHeroRibbon - Stunning floating glass ribbon with data visualizations
 *
 * Features:
 * - Glassmorphism design that overlaps the hero
 * - Radial progress for Sport Index
 * - Visual streak dots for Day Streak
 * - Sparkline for activity trend
 */

import { Zap, Flame, Route, Clock, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

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
    ? "text-emerald-500"
    : metrics.sportIndexDelta < 0
      ? "text-red-500"
      : "text-muted-foreground"

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

            {/* Day Streak with Flame Dots */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:px-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Day Streak
              </span>
              <StreakDots streak={metrics.dayStreak} />
              <div className="flex items-center gap-1.5 mt-2">
                <Flame className={cn(
                  "w-5 h-5",
                  metrics.dayStreak > 0 ? "text-orange-500" : "text-muted-foreground/40"
                )} />
                <span className="text-2xl font-bold text-foreground">{metrics.dayStreak}</span>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            </div>

            {/* This Week Distance */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:px-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                This Week
              </span>
              <div className="relative">
                <Route className="w-8 h-8 text-primary/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Route className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-foreground">{metrics.thisWeekKm.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">km</span>
              </div>
            </div>

            {/* Active Time */}
            <div className="flex flex-col items-center md:border-r border-gray-200/50 dark:border-gray-700/50 md:px-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Active Time
              </span>
              <TimeDisplay minutes={metrics.activeTimeMinutes} />
            </div>

            {/* Week Activities with mini bar chart */}
            <div className="flex flex-col items-center md:pl-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Activities
              </span>
              <ActivityBars count={metrics.weekActivities} />
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-foreground">{metrics.weekActivities}</span>
                <span className="text-xs text-muted-foreground">this week</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
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
            stroke="url(#gradient)"
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
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
 * Visual Streak Dots - 7 dots representing the week
 */
function StreakDots({ streak }: { streak: number }) {
  const days = Array.from({ length: 7 }, (_, i) => i < streak)

  return (
    <div className="flex items-center gap-1">
      {days.map((isActive, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 + i * 0.05 }}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-colors",
            isActive
              ? "bg-gradient-to-r from-orange-400 to-red-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]"
              : "bg-gray-200 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  )
}

/**
 * Time Display with clock visual
 */
function TimeDisplay({ minutes }: { minutes: number }) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

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
        {hours > 0 && (
          <>
            <span className="text-2xl font-bold text-foreground">{hours}</span>
            <span className="text-xs text-muted-foreground">h</span>
          </>
        )}
        <span className={cn("font-bold text-foreground", hours > 0 ? "text-lg" : "text-2xl")}>
          {mins}
        </span>
        <span className="text-xs text-muted-foreground">min</span>
      </div>
    </div>
  )
}

/**
 * Mini bar chart for activities
 */
function ActivityBars({ count }: { count: number }) {
  // Create 7 bars representing potential daily activities
  const maxBars = 7
  const filledBars = Math.min(count, maxBars)

  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: maxBars }, (_, i) => {
        const isFilled = i < filledBars
        const height = isFilled ? 60 + Math.random() * 40 : 20
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
            className={cn(
              "w-1.5 rounded-full",
              isFilled
                ? "bg-gradient-to-t from-primary/60 to-primary"
                : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        )
      })}
    </div>
  )
}
