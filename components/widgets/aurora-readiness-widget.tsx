"use client"

import { motion } from "framer-motion"
import { Activity, Moon, Zap } from "lucide-react"

type ReadinessProps = {
  stats: {
    sportIndex: number
    sportIndexTrend?: number
    totalDuration: number
    totalActivities: number
    streakDays?: number
  }
}

export function AuroraReadinessWidget({ stats }: ReadinessProps) {
  const readiness = Math.min(100, Math.round((stats.sportIndex / 1000) * 100))
  const trend = stats.sportIndexTrend ?? 0

  return (
    <motion.div
      className="eg-card p-6 space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="eg-widget-title">Today&apos;s readiness</p>
          <p className="eg-widget-value">{readiness}%</p>
          <p className="text-xs text-slate-500 mt-1">
            Based on your recent training load and consistency.
          </p>
        </div>
        <div className="space-y-2 text-right">
          <div className={trend >= 0 ? "eg-trend-up" : "eg-trend-down"}>
            <Zap className="w-3 h-3" />
            <span>
              {trend >= 0 ? "+" : ""}{trend} pts this week
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Sport Index:{" "}
            <span className="eg-number font-semibold text-slate-900">
              {stats.sportIndex}
            </span>
          </div>
        </div>
      </div>

      {/* Ring */}
      <div className="flex items-center justify-between mt-2">
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 36 36" className="transform -rotate-90">
            <path
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3.5"
            />
            <motion.path
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#egAurora)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${readiness}, 100`}
              initial={{ strokeDasharray: "0,100" }}
              animate={{ strokeDasharray: `${readiness}, 100` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="egAurora" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="eg-number text-sm font-semibold text-slate-900">
              {readiness}%
            </span>
          </div>
        </div>

        <div className="flex-1 ml-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" />
            <span className="text-slate-600">
              {Math.round(stats.totalDuration / 60)} min this week
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-600">
              {stats.streakDays ?? 0} day streak
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
