'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Trophy, Calendar, Users, TrendingUp, Zap, ChevronRight, Loader2, CheckCircle } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'

interface SeasonCardProps {
  season: {
    id: string
    name: string
    description?: string | null
    startDate: Date | string
    endDate: Date | string
    status: string
    badgeIcon?: string | null
    badgeColor?: string | null
    _count?: { participants: number }
  }
  userStats?: {
    totalPower: number
    activityCount: number
    rank: number | null
    total: number | null
  } | null
  className?: string
}

const seasonIcons: Record<string, any> = {
  snowflake: '❄️',
  flower: '🌸',
  sun: '☀️',
  leaf: '🍂',
}

export function SeasonCard({ season, userStats, className }: SeasonCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [joinState, setJoinState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const startDate = new Date(season.startDate)
  const endDate = new Date(season.endDate)
  const now = new Date()
  const daysRemaining = differenceInDays(endDate, now)
  const isActive = season.status === 'ACTIVE'
  const isCompleted = season.status === 'COMPLETED'

  const icon = season.badgeIcon ? seasonIcons[season.badgeIcon] || '🏆' : '🏆'
  const themeColor = season.badgeColor || '#8B5CF6'

  async function handleJoinSeason() {
    if (joinState === 'loading' || joinState === 'success') return

    setJoinState('loading')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seasonId: season.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join season')
      }

      setJoinState('success')

      // Refresh the page to show updated stats
      startTransition(() => {
        router.refresh()
      })
    } catch (err) {
      setJoinState('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to join season')
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isActive ? "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" :
        "border-border bg-card",
        className
      )}
    >
      {/* Header */}
      <div
        className="p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h3 className="font-bold text-lg">{season.name}</h3>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Calendar className="w-3 h-3" />
                <span>
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {isActive && daysRemaining > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <div className="text-xs text-white/80">days left</div>
            </div>
          )}

          {isCompleted && (
            <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              Completed
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        {userStats ? (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Rank */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Trophy className="w-3 h-3" />
                <span>Rank</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {userStats.rank ? `#${userStats.rank}` : '-'}
              </div>
              {userStats.total && (
                <div className="text-xs text-muted-foreground">of {userStats.total}</div>
              )}
            </div>

            {/* Power */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <Zap className="w-3 h-3" />
                <span>Power</span>
              </div>
              <div className="text-xl font-bold text-primary">
                {Math.round(userStats.totalPower).toLocaleString()}
              </div>
            </div>

            {/* Activities */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Activities</span>
              </div>
              <div className="text-xl font-bold text-foreground">
                {userStats.activityCount}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Join this season to compete!
            </p>
            <button
              onClick={handleJoinSeason}
              disabled={joinState === 'loading' || joinState === 'success' || isPending}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto min-w-[120px]",
                joinState === 'success'
                  ? "bg-primary/10 text-primary"
                  : joinState === 'error'
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                (joinState === 'loading' || isPending) && "opacity-70 cursor-not-allowed"
              )}
            >
              {joinState === 'loading' || isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : joinState === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Joined!
                </>
              ) : joinState === 'error' ? (
                'Try Again'
              ) : (
                'Join Season'
              )}
            </button>
            {errorMessage && (
              <p className="text-xs text-destructive mt-2">{errorMessage}</p>
            )}
          </div>
        )}

        {/* Participants count */}
        {season._count && (
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{season._count.participants.toLocaleString()} athletes competing</span>
            </div>
            <Link
              href={`/season/${season.id}`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              Leaderboard
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
