"use client"

import { TrendingUp, Flame, Trophy, Activity, Timer, Route } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileStatsPillsProps {
  sportIndex?: number
  sportIndexTrend?: number
  streakDays?: number
  weeklyDistance?: number
  weeklyTime?: number
  weeklyActivities?: number
  globalRank?: number
  cityRank?: number
}

export function ProfileStatsPills({
  sportIndex,
  sportIndexTrend,
  streakDays = 0,
  weeklyDistance = 0,
  weeklyTime = 0,
  weeklyActivities = 0,
  globalRank,
  cityRank,
}: ProfileStatsPillsProps) {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="w-full bg-white border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between overflow-x-auto gap-3 pb-1 scrollbar-hide">
          {/* Sport Index */}
          {sportIndex !== undefined && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
              <Trophy className="w-4 h-4 text-orange-500" />
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-lg font-bold text-slate-900 tabular-nums">{sportIndex}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Sport Index</p>
                </div>
                {sportIndexTrend !== undefined && sportIndexTrend > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" />
                    +{sportIndexTrend}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Streak */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl shrink-0",
            streakDays > 0
              ? "bg-orange-50 border border-orange-200"
              : "bg-slate-50 border border-slate-200"
          )}>
            <Flame className={cn(
              "w-4 h-4",
              streakDays > 0 ? "text-orange-500" : "text-slate-400"
            )} />
            <div>
              <p className="text-lg font-bold text-slate-900 tabular-nums">{streakDays}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Day Streak</p>
            </div>
          </div>

          {/* Weekly Distance */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
            <Route className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-lg font-bold text-slate-900 tabular-nums">
                {weeklyDistance.toFixed(1)}
                <span className="text-xs font-normal text-slate-500 ml-0.5">km</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">This Week</p>
            </div>
          </div>

          {/* Weekly Time */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
            <Timer className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-lg font-bold text-slate-900 tabular-nums">{formatTime(weeklyTime)}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Active Time</p>
            </div>
          </div>

          {/* Weekly Activities */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
            <Activity className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-lg font-bold text-slate-900 tabular-nums">{weeklyActivities}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Activities</p>
            </div>
          </div>

          {/* Rank */}
          {(cityRank || globalRank) && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 shrink-0">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-lg font-bold text-slate-900 tabular-nums">
                  #{cityRank || globalRank}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {cityRank ? "City Rank" : "Global Rank"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
