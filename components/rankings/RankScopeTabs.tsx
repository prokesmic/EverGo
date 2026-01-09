'use client'

import { cn } from '@/lib/utils'
import { Globe, MapPin, Building2, Users } from 'lucide-react'
import { motion } from 'framer-motion'

type RankScope = 'global' | 'country' | 'city' | 'friends'

interface RankScopeTabsProps {
  activeScope: RankScope
  onScopeChange: (scope: RankScope) => void
  countryLabel?: string
  cityLabel?: string
  className?: string
}

const scopes = [
  { id: 'global' as RankScope, icon: Globe, label: 'Global' },
  { id: 'country' as RankScope, icon: MapPin, label: 'Country' },
  { id: 'city' as RankScope, icon: Building2, label: 'City' },
  { id: 'friends' as RankScope, icon: Users, label: 'Friends' },
]

export function RankScopeTabs({
  activeScope,
  onScopeChange,
  countryLabel,
  cityLabel,
  className
}: RankScopeTabsProps) {
  return (
    <div className={cn(
      "flex gap-1 p-1 bg-slate-100 rounded-lg",
      className
    )}>
      {scopes.map(({ id, icon: Icon, label }) => {
        const isActive = activeScope === id
        const displayLabel = id === 'country' && countryLabel ? countryLabel :
                            id === 'city' && cityLabel ? cityLabel : label

        return (
          <button
            key={id}
            onClick={() => onScopeChange(id)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md",
              "text-sm font-medium transition-colors",
              isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeScope"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: "spring", duration: 0.3 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{displayLabel}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
