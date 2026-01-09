'use client'

import { cn } from '@/lib/utils'
import { Trophy, ChevronUp, ChevronDown, Minus, Globe, MapPin, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

interface RankData {
  rank: number | null
  total: number
  delta?: number // Change from last week
  scopeValue?: string | null
}

interface FloatingRankPillProps {
  global: RankData
  country: RankData | null
  city: RankData | null
  power: number
  className?: string
}

type Scope = 'global' | 'country' | 'city'

export function FloatingRankPill({
  global,
  country,
  city,
  power,
  className,
}: FloatingRankPillProps) {
  const [activeScope, setActiveScope] = useState<Scope>('global')
  const [isExpanded, setIsExpanded] = useState(false)

  const scopes: { id: Scope; icon: typeof Globe; data: RankData | null; label: string }[] = [
    { id: 'global', icon: Globe, data: global, label: 'Global' },
    { id: 'country', icon: MapPin, data: country, label: country?.scopeValue ?? 'Country' },
    { id: 'city', icon: Building2, data: city, label: city?.scopeValue ?? 'City' },
  ].filter(s => s.data !== null && s.data.rank !== null) as { id: Scope; icon: typeof Globe; data: RankData; label: string }[]

  const activeData = scopes.find(s => s.id === activeScope)?.data ?? global

  if (!activeData.rank) return null

  const ActiveIcon = scopes.find(s => s.id === activeScope)?.icon ?? Globe
  const delta = activeData.delta ?? 0

  return (
    <div className={cn("fixed bottom-20 left-1/2 -translate-x-1/2 z-40", className)}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[200px]"
          >
            {/* Scope selector */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-3">
              {scopes.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveScope(id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                    activeScope === id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span className="truncate max-w-[60px]">{label}</span>
                </button>
              ))}
            </div>

            {/* Rank details */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-slate-900">
                  #{activeData.rank}
                </span>
                {delta !== 0 && (
                  <span className={cn(
                    "flex items-center text-sm font-medium",
                    delta > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {delta > 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {Math.abs(delta)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                of {activeData.total.toLocaleString()} athletes
              </p>
            </div>

            {/* Power score */}
            <div className="flex items-center justify-between p-2 bg-violet-50 rounded-lg">
              <span className="text-xs text-violet-700 font-medium">Weekly Power</span>
              <span className="text-sm font-bold text-violet-600">{power}</span>
            </div>

            {/* Link to full rankings */}
            <Link
              href="/rankings"
              className="block text-center text-xs text-slate-500 hover:text-slate-700 mt-3"
            >
              View Full Rankings →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main pill */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-white shadow-lg border border-slate-200",
          "hover:shadow-xl transition-shadow"
        )}
        whileTap={{ scale: 0.95 }}
      >
        {/* Rank badge */}
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center",
            activeData.rank === 1 ? "bg-amber-100" :
            activeData.rank <= 3 ? "bg-slate-100" :
            "bg-orange-100"
          )}>
            {activeData.rank === 1 ? (
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <span className={cn(
                "text-xs font-bold",
                activeData.rank <= 3 ? "text-slate-600" : "text-orange-600"
              )}>
                #{activeData.rank}
              </span>
            )}
          </div>

          {/* Scope icon */}
          <ActiveIcon className="w-4 h-4 text-slate-400" />
        </div>

        {/* Delta indicator */}
        <div className={cn(
          "flex items-center text-xs font-medium",
          delta > 0 ? "text-emerald-500" :
          delta < 0 ? "text-red-500" :
          "text-slate-400"
        )}>
          {delta > 0 ? <ChevronUp className="w-3 h-3" /> :
           delta < 0 ? <ChevronDown className="w-3 h-3" /> :
           <Minus className="w-3 h-3" />}
          {delta !== 0 && Math.abs(delta)}
        </div>

        {/* Power score */}
        <div className="border-l border-slate-200 pl-2 ml-1">
          <span className="text-sm font-semibold text-violet-600">{power}</span>
          <span className="text-xs text-slate-400 ml-0.5">PWR</span>
        </div>
      </motion.button>
    </div>
  )
}
