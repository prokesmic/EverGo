"use client"

/**
 * SportIndexGauge - Semi-circular gauge visualization
 *
 * Part of Project Aurora UI Overhaul
 * Visual: Semi-circle track with gradient fill (Amber → Orange → Red)
 */

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SportIndexGaugeProps {
  /** Score value (0-1000) */
  score: number
  /** Maximum value (default: 1000) */
  max?: number
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Show label inside */
  showValue?: boolean
  /** Custom class */
  className?: string
}

const sizeConfig = {
  sm: { width: 80, height: 40, stroke: 6, radius: 32 },
  md: { width: 120, height: 60, stroke: 8, radius: 48 },
  lg: { width: 160, height: 80, stroke: 10, radius: 64 },
}

export function SportIndexGauge({
  score,
  max = 1000,
  size = "md",
  showValue = false,
  className,
}: SportIndexGaugeProps) {
  const config = sizeConfig[size]
  const percentage = Math.min((score / max) * 100, 100)

  // Semi-circle arc calculation
  const circumference = Math.PI * config.radius // Half circle
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Determine color based on score tier
  const getGradientId = () => {
    if (score >= 800) return "gauge-gradient-elite"
    if (score >= 500) return "gauge-gradient-advanced"
    if (score >= 200) return "gauge-gradient-intermediate"
    return "gauge-gradient-beginner"
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        width={config.width}
        height={config.height + 10}
        viewBox={`0 0 ${config.width} ${config.height + 10}`}
        className="overflow-visible"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gauge-gradient-beginner" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="gauge-gradient-intermediate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="gauge-gradient-advanced" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="gauge-gradient-elite" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          {/* Glow filter for active state */}
          <filter id="gauge-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track (ghost) */}
        <path
          d={`M ${config.stroke / 2} ${config.height} A ${config.radius} ${config.radius} 0 0 1 ${config.width - config.stroke / 2} ${config.height}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          className="text-gray-200 dark:text-gray-700/50"
        />

        {/* Progress arc */}
        {score > 0 && (
          <motion.path
            d={`M ${config.stroke / 2} ${config.height} A ${config.radius} ${config.radius} 0 0 1 ${config.width - config.stroke / 2} ${config.height}`}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            filter={score >= 500 ? "url(#gauge-glow)" : undefined}
          />
        )}

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (tick / 100) * Math.PI
          const x1 = config.width / 2 + (config.radius - config.stroke) * Math.cos(angle)
          const y1 = config.height - (config.radius - config.stroke) * Math.sin(angle)
          const x2 = config.width / 2 + (config.radius + 4) * Math.cos(angle)
          const y2 = config.height - (config.radius + 4) * Math.sin(angle)

          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={1}
              className="text-gray-300 dark:text-gray-600"
            />
          )
        })}
      </svg>

      {/* Center value display */}
      {showValue && (
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-lg font-mono font-bold text-foreground">
            {score}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact inline gauge for ribbon/cards
 */
export function SportIndexGaugeInline({
  score,
  max = 1000,
  className,
}: {
  score: number
  max?: number
  className?: string
}) {
  const percentage = Math.min((score / max) * 100, 100)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
