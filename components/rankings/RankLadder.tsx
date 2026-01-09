'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronUp, ChevronDown, Minus, Trophy, Globe, MapPin, Building2, Users } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface RankLadderEntry {
  userId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  score: number
  rank: number
  delta: number
  isCurrentUser: boolean
}

interface RankLadderProps {
  scope: 'global' | 'country' | 'city' | 'friends'
  scopeValue: string | null
  userRank: number | null
  totalInScope: number
  entries: RankLadderEntry[]
  pointsToNextRank: number | null
  pointsBehindPrevRank: number | null
  className?: string
  onScopeChange?: (scope: 'global' | 'country' | 'city' | 'friends') => void
}

const scopeIcons = {
  global: Globe,
  country: MapPin,
  city: Building2,
  friends: Users
}

const scopeColors = {
  global: 'text-emerald-500',
  country: 'text-sky-500',
  city: 'text-amber-500',
  friends: 'text-violet-500'
}

export function RankLadder({
  scope,
  scopeValue,
  userRank,
  totalInScope,
  entries,
  pointsToNextRank,
  pointsBehindPrevRank,
  className,
}: RankLadderProps) {
  const ScopeIcon = scopeIcons[scope]
  const scopeColor = scopeColors[scope]

  const getScopeLabel = () => {
    switch (scope) {
      case 'global': return 'Global'
      case 'country': return scopeValue ?? 'Country'
      case 'city': return scopeValue ?? 'City'
      case 'friends': return 'Friends'
    }
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ScopeIcon className={cn("w-5 h-5", scopeColor)} />
            <h3 className="font-semibold text-slate-900">
              {getScopeLabel()} Rankings
            </h3>
          </div>
          {userRank && (
            <span className="text-sm text-slate-500">
              #{userRank} of {totalInScope.toLocaleString()}
            </span>
          )}
        </div>

        {/* Points insight */}
        {pointsBehindPrevRank && pointsBehindPrevRank > 0 && (
          <p className="text-xs text-orange-600 font-medium">
            {pointsBehindPrevRank} pts to rank up!
          </p>
        )}
      </div>

      {/* Ladder entries */}
      <div className="divide-y divide-slate-100">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={cn(
                "flex items-center gap-3 p-3 transition-colors",
                entry.isCurrentUser
                  ? "bg-orange-50"
                  : "hover:bg-slate-50"
              )}
            >
              {/* Rank */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                entry.rank === 1
                  ? "bg-amber-100 text-amber-600"
                  : entry.rank === 2
                    ? "bg-slate-200 text-slate-600"
                    : entry.rank === 3
                      ? "bg-orange-100 text-orange-600"
                      : "bg-slate-100 text-slate-500"
              )}>
                {entry.rank === 1 && <Trophy className="w-4 h-4" />}
                {entry.rank > 1 && `#${entry.rank}`}
              </div>

              {/* Avatar */}
              <Avatar className="h-9 w-9">
                <AvatarImage src={entry.avatarUrl ?? undefined} />
                <AvatarFallback className="text-sm">
                  {(entry.displayName ?? entry.username ?? '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  entry.isCurrentUser ? "text-orange-700" : "text-slate-900"
                )}>
                  {entry.displayName ?? entry.username ?? 'Anonymous'}
                  {entry.isCurrentUser && (
                    <span className="ml-1.5 text-xs bg-orange-200 text-orange-700 px-1.5 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {entry.score.toLocaleString()}
                  <span className="text-xs text-slate-400 ml-0.5">pts</span>
                </p>

                {/* Delta */}
                <div className={cn(
                  "flex items-center justify-end gap-0.5 text-xs",
                  entry.delta > 0 ? "text-emerald-500" :
                  entry.delta < 0 ? "text-red-500" : "text-slate-400"
                )}>
                  {entry.delta > 0 ? <ChevronUp className="w-3 h-3" /> :
                   entry.delta < 0 ? <ChevronDown className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {entry.delta !== 0 && Math.abs(entry.delta)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <Link
          href={`/rankings?scope=${scope}`}
          className="text-sm text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1"
        >
          View Full Rankings →
        </Link>
      </div>
    </div>
  )
}
