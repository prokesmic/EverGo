'use client'

import { cn } from '@/lib/utils'
import { ChevronUp, Swords, Target, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { AlmostThereInsight } from '@/lib/almost-there'

interface AlmostThereCardProps {
  insights: AlmostThereInsight[]
  className?: string
}

const iconMap = {
  rank_up: ChevronUp,
  battle: Swords,
  weekly_goal: Target,
}

const colorMap = {
  high: {
    bg: 'bg-gradient-to-r from-orange-500 to-red-500',
    badge: 'bg-red-100 text-red-700',
    text: 'text-white',
  },
  medium: {
    bg: 'bg-gradient-to-r from-amber-400 to-orange-400',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-white',
  },
  low: {
    bg: 'bg-gradient-to-r from-sky-400 to-blue-500',
    badge: 'bg-sky-100 text-sky-700',
    text: 'text-white',
  },
}

export function AlmostThereCard({ insights, className }: AlmostThereCardProps) {
  if (insights.length === 0) return null

  // Show the most urgent insight prominently
  const primary = insights[0]
  const secondary = insights.slice(1, 3)

  const PrimaryIcon = iconMap[primary.type]
  const primaryColors = colorMap[primary.urgency]

  return (
    <div className={cn("space-y-2", className)}>
      {/* Primary insight - full featured */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-xl overflow-hidden",
          primaryColors.bg
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <PrimaryIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", primaryColors.text)}>
                  {primary.title}
                </p>
                <p className="text-xs text-white/80">
                  Almost there!
                </p>
              </div>
            </div>

            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              primaryColors.badge
            )}>
              {primary.pointsNeeded} pts
            </span>
          </div>

          <p className={cn("text-sm mb-4", primaryColors.text, "opacity-90")}>
            {primary.message}
          </p>

          <Link
            href={primary.actionUrl}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white rounded-lg text-sm font-semibold text-slate-900 hover:bg-white/90 transition-colors"
          >
            <Zap className="w-4 h-4" />
            {primary.actionLabel}
          </Link>
        </div>
      </motion.div>

      {/* Secondary insights - compact */}
      {secondary.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {secondary.map((insight) => {
            const Icon = iconMap[insight.type]
            const colors = colorMap[insight.urgency]

            return (
              <Link
                key={insight.id}
                href={insight.actionUrl}
                className="bg-white rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded-full",
                    colors.badge
                  )}>
                    {insight.pointsNeeded} pts
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate">
                  {insight.message}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
