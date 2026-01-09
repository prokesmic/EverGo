'use client'

import { cn } from '@/lib/utils'
import { Trophy, Calendar, Users, TrendingUp, Zap, ChevronRight } from 'lucide-react'
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
  const startDate = new Date(season.startDate)
  const endDate = new Date(season.endDate)
  const now = new Date()
  const daysRemaining = differenceInDays(endDate, now)
  const isActive = season.status === 'ACTIVE'
  const isCompleted = season.status === 'COMPLETED'

  const icon = season.badgeIcon ? seasonIcons[season.badgeIcon] || '🏆' : '🏆'
  const themeColor = season.badgeColor || '#8B5CF6'

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        isActive ? "border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50" :
        "border-slate-200 bg-white",
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
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                <Trophy className="w-3 h-3" />
                <span>Rank</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {userStats.rank ? `#${userStats.rank}` : '-'}
              </div>
              {userStats.total && (
                <div className="text-xs text-slate-400">of {userStats.total}</div>
              )}
            </div>

            {/* Power */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                <Zap className="w-3 h-3" />
                <span>Power</span>
              </div>
              <div className="text-xl font-bold text-violet-600">
                {Math.round(userStats.totalPower).toLocaleString()}
              </div>
            </div>

            {/* Activities */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Activities</span>
              </div>
              <div className="text-xl font-bold text-slate-900">
                {userStats.activityCount}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 mb-3">
              Join this season to compete!
            </p>
            <button
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Join Season
            </button>
          </div>
        )}

        {/* Participants count */}
        {season._count && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users className="w-4 h-4" />
              <span>{season._count.participants.toLocaleString()} athletes competing</span>
            </div>
            <Link
              href={`/season/${season.id}`}
              className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
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
