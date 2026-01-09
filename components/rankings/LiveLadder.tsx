'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronUp, ChevronDown, Minus, Trophy, Globe, MapPin, Building2, Users, RefreshCw, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface LiveLadderEntry {
  userId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  score: number
  rank: number
  previousRank?: number
  isCurrentUser: boolean
}

interface LiveLadderProps {
  initialScope?: 'global' | 'country' | 'city'
  initialScopeValue?: string | null
  userId: string
  refreshInterval?: number // in ms, default 30000 (30s)
  className?: string
}

const scopeIcons = {
  global: Globe,
  country: MapPin,
  city: Building2,
}

const scopeLabels = {
  global: 'Global',
  country: 'Country',
  city: 'City',
}

export function LiveLadder({
  initialScope = 'global',
  initialScopeValue = null,
  userId,
  refreshInterval = 30000,
  className,
}: LiveLadderProps) {
  const [scope, setScope] = useState<'global' | 'country' | 'city'>(initialScope)
  const [entries, setEntries] = useState<LiveLadderEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [totalInScope, setTotalInScope] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchLadder = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        scope,
        ...(initialScopeValue && { scopeValue: initialScopeValue }),
      })

      const response = await fetch(`/api/rankings/ladder?${params}`)
      if (!response.ok) throw new Error('Failed to fetch ladder')

      const data = await response.json()

      // Calculate rank deltas based on previous positions
      const updatedEntries = data.entries.map((entry: any) => {
        const prevEntry = entries.find((e) => e.userId === entry.userId)
        return {
          ...entry,
          previousRank: prevEntry?.rank,
        }
      })

      setEntries(updatedEntries)
      setUserRank(data.userRank)
      setTotalInScope(data.totalInScope)
      setLastUpdate(new Date())
    } catch (err) {
      setError('Failed to load rankings')
      console.error('Ladder fetch error:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [scope, initialScopeValue, entries])

  // Initial load
  useEffect(() => {
    fetchLadder()
  }, [scope])

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLadder(true)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [fetchLadder, refreshInterval])

  const ScopeIcon = scopeIcons[scope]

  const getRankDelta = (entry: LiveLadderEntry) => {
    if (!entry.previousRank) return 0
    return entry.previousRank - entry.rank
  }

  if (isLoading) {
    return (
      <div className={cn(
        "bg-white rounded-xl border border-slate-200 p-8",
        className
      )}>
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading rankings...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn(
        "bg-white rounded-xl border border-slate-200 p-8",
        className
      )}>
        <div className="text-center text-slate-500">
          <p>{error}</p>
          <button
            onClick={() => fetchLadder()}
            className="mt-2 text-sm text-violet-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
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
            <div className="relative">
              <ScopeIcon className="w-5 h-5 text-violet-500" />
              {/* Live indicator */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <h3 className="font-semibold text-slate-900">Live Rankings</h3>
            {isRefreshing && (
              <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
            )}
          </div>
          {userRank && (
            <span className="text-sm text-slate-500">
              #{userRank} of {totalInScope.toLocaleString()}
            </span>
          )}
        </div>

        {/* Scope tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {(['global', 'country', 'city'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={cn(
                "flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all",
                scope === s
                  ? "bg-white text-violet-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {scopeLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Ladder entries */}
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {entries.map((entry) => {
            const delta = getRankDelta(entry)
            return (
              <motion.div
                key={entry.userId}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  layout: { type: 'spring', stiffness: 500, damping: 30 },
                }}
                className={cn(
                  "flex items-center gap-3 p-3 transition-colors",
                  entry.isCurrentUser
                    ? "bg-violet-50"
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
                  {entry.rank === 1 ? <Trophy className="w-4 h-4" /> : `#${entry.rank}`}
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
                  <Link
                    href={`/profile/${entry.username}`}
                    className={cn(
                      "text-sm font-medium truncate block hover:underline",
                      entry.isCurrentUser ? "text-violet-700" : "text-slate-900"
                    )}
                  >
                    {entry.displayName ?? entry.username ?? 'Anonymous'}
                    {entry.isCurrentUser && (
                      <span className="ml-1.5 text-xs bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </Link>
                </div>

                {/* Score & Delta */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-violet-500" />
                    <span className="text-sm font-semibold text-slate-900">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>

                  {/* Rank movement */}
                  {delta !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: delta > 0 ? 10 : -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex items-center justify-end gap-0.5 text-xs font-medium",
                        delta > 0 ? "text-emerald-500" : "text-red-500"
                      )}
                    >
                      {delta > 0 ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>+{delta}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>{delta}</span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {lastUpdate && `Updated ${lastUpdate.toLocaleTimeString()}`}
          </span>
          <Link
            href={`/rankings?scope=${scope}`}
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Full Rankings →
          </Link>
        </div>
      </div>
    </div>
  )
}
