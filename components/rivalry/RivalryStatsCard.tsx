'use client'

import { cn } from '@/lib/utils'
import { Swords, Trophy, Target, TrendingUp, Users, Flame } from 'lucide-react'
import Link from 'next/link'

interface RivalryStatsCardProps {
  stats: {
    totalMatches: number
    totalWins: number
    totalLosses: number
    totalTies: number
    winRate: number
    rivalCount: number
    longestWinStreak: number
    currentWinStreak: number
  }
  className?: string
}

export function RivalryStatsCard({ stats, className }: RivalryStatsCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-slate-200 bg-white overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Rivalry Record</h3>
            <p className="text-sm text-white/80">Head-to-head stats</p>
          </div>
        </div>
      </div>

      {/* Win/Loss Summary */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{stats.totalWins}</div>
            <div className="text-xs text-slate-500 uppercase">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-400">{stats.totalTies}</div>
            <div className="text-xs text-slate-500 uppercase">Ties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">{stats.totalLosses}</div>
            <div className="text-xs text-slate-500 uppercase">Losses</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Win Rate */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats.winRate}%</div>
            <div className="text-xs text-slate-500">Win Rate</div>
          </div>
        </div>

        {/* Rivals */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats.rivalCount}</div>
            <div className="text-xs text-slate-500">Rivals</div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{stats.longestWinStreak}</div>
            <div className="text-xs text-slate-500">Best Streak</div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">
              {stats.currentWinStreak > 0 ? stats.currentWinStreak : '-'}
            </div>
            <div className="text-xs text-slate-500">Current Streak</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 p-3">
        <Link
          href="/rivalries"
          className="flex items-center justify-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          <Trophy className="w-4 h-4" />
          View All Rivalries
        </Link>
      </div>
    </div>
  )
}
