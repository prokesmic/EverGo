"use client"

/**
 * V6 Season Header
 *
 * Header section for season detail page
 */

import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Zap, Clock, Users } from "lucide-react"
import { format, formatDistanceToNow, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SeasonData {
  id: string
  name: string
  slug: string
  isActive: boolean
  status: string
  startDate: Date | string
  endDate: Date | string
  participantCount: number
  badgeIcon?: string | null
  badgeColor?: string | null
}

interface UserStats {
  totalPower: number
  globalRank: number
  cityRank: number | null
  activityCount: number
}

interface SeasonHeaderProps {
  season: SeasonData
  userStats: UserStats | null
}

export function SeasonHeader({ season, userStats }: SeasonHeaderProps) {
  const startDate = new Date(season.startDate)
  const endDate = new Date(season.endDate)
  const now = new Date()
  const daysRemaining = differenceInDays(endDate, now)
  const isActive = season.isActive && season.status === "ACTIVE"
  const isCompleted = season.status === "COMPLETED"

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div
        className={cn(
          "px-6 py-6",
          isActive && "bg-gradient-to-r from-purple-500/10 to-violet-500/10",
          isCompleted && "bg-slate-50"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/seasons"
              className="text-sm text-slate-500 hover:text-slate-700 mb-2 inline-block"
            >
              &larr; All Seasons
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {season.badgeIcon && <span>{season.badgeIcon}</span>}
              {season.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </div>
          </div>

          <div>
            {isActive && (
              <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
            )}
            {isCompleted && (
              <Badge className="bg-slate-100 text-slate-600">Completed</Badge>
            )}
            {season.status === "UPCOMING" && (
              <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>
            )}
          </div>
        </div>

        {/* Time remaining */}
        {isActive && daysRemaining > 0 && (
          <div className="mt-4 p-3 bg-white/60 rounded-lg inline-flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-slate-700">
              {daysRemaining} days remaining
            </span>
          </div>
        )}
      </div>

      {/* User Stats */}
      {userStats && (
        <div className="px-6 py-4 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-violet-600 mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                #{userStats.globalRank}
              </div>
              <div className="text-xs text-slate-500">Global Rank</div>
            </div>

            {userStats.cityRank && (
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  #{userStats.cityRank}
                </div>
                <div className="text-xs text-slate-500">City Rank</div>
              </div>
            )}

            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {userStats.totalPower.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">Total Power</div>
            </div>

            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {userStats.activityCount}
              </div>
              <div className="text-xs text-slate-500">Activities</div>
            </div>
          </div>
        </div>
      )}

      {/* Participant Count */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4" />
          {season.participantCount.toLocaleString()} participants
        </div>
      </div>
    </div>
  )
}
