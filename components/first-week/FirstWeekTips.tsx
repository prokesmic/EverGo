'use client'

import { cn } from '@/lib/utils'
import { Activity, Trophy, Swords, Link2, Flame, X } from 'lucide-react'
import Link from 'next/link'
import type { FirstWeekTip } from '@/lib/first-week'
import { useState } from 'react'

interface FirstWeekTipsProps {
  tips: FirstWeekTip[]
  className?: string
}

const iconMap = {
  activity: Activity,
  rank: Trophy,
  battle: Swords,
  sync: Link2,
  power: Flame,
}

const colorMap = {
  activity: 'bg-emerald-100 text-emerald-600',
  rank: 'bg-amber-100 text-amber-600',
  battle: 'bg-red-100 text-red-600',
  sync: 'bg-sky-100 text-sky-600',
  power: 'bg-violet-100 text-violet-600',
}

export function FirstWeekTips({ tips, className }: FirstWeekTipsProps) {
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set())

  const visibleTips = tips.filter(tip => !dismissedTips.has(tip.id))

  if (visibleTips.length === 0) return null

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]))
  }

  return (
    <div className={cn("space-y-3", className)}>
      {visibleTips.map(tip => {
        const Icon = iconMap[tip.icon]
        const colorClass = colorMap[tip.icon]

        return (
          <div
            key={tip.id}
            className="relative bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
          >
            <button
              onClick={() => dismissTip(tip.id)}
              className="absolute top-3 right-3 p-1 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                colorClass
              )}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <h4 className="font-medium text-slate-900 text-sm mb-0.5">
                  {tip.title}
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  {tip.description}
                </p>
                <Link
                  href={tip.actionUrl}
                  className="inline-flex items-center text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  {tip.actionLabel} →
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
