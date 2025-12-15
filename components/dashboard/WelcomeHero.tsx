"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Flame, TrendingUp, MapPin, Trophy, Activity, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface WelcomeHeroProps {
  name: string
  avatarUrl?: string
  location: string
  primarySport: string
  sportIndex: number
  sportIndexTrend: number
  streakDays: number
  weeklyDistance: number
  weeklyTime: number
  weeklyActivities: number
  globalRank?: number
  cityRank?: number
}

export function WelcomeHero({
  name,
  avatarUrl,
  location,
  primarySport,
  sportIndex,
  sportIndexTrend,
  streakDays,
  weeklyDistance,
  weeklyTime,
  weeklyActivities,
  globalRank,
  cityRank,
}: WelcomeHeroProps) {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const initials = name.substring(0, 2).toUpperCase()
  const greeting = getGreeting()

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-width dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: User Info */}
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-orange-500/50 ring-offset-2 ring-offset-slate-900">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-1">
                {greeting}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">
                {name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {location}
                </span>
                <span className="text-slate-600">·</span>
                <span className="capitalize text-emerald-400 font-medium">{primarySport}</span>
              </div>
            </div>
          </div>

          {/* Right: CTA + Quick Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Quick Stats Pills */}
            <div className="flex items-center gap-3">
              {/* Sport Index */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Trophy className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-lg font-bold text-white tabular-nums">{sportIndex}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Sport Index</p>
                </div>
                {sportIndexTrend > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium ml-1">
                    <TrendingUp className="w-3 h-3" />
                    +{sportIndexTrend}
                  </span>
                )}
              </div>

              {/* Streak */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 backdrop-blur-sm border border-orange-500/20">
                <Flame className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-lg font-bold text-white tabular-nums">{streakDays}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Primary CTA - Log Activity */}
            <Link
              href="/activity/create"
              className={cn(
                "relative z-10 inline-flex items-center justify-center gap-2",
                "px-6 py-3 rounded-full",
                "bg-gradient-to-r from-orange-500 to-orange-600",
                "text-white font-semibold text-sm",
                "shadow-lg shadow-orange-500/30",
                "hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5",
                "transition-all duration-200"
              )}
            >
              <Plus className="w-4 h-4" />
              Log Activity
              <ChevronRight className="w-4 h-4 -mr-1 opacity-70" />
            </Link>
          </div>
        </div>

        {/* Weekly Summary Strip */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400 font-medium">
              This Week
            </p>
            <Link
              href="/activity"
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {/* Distance */}
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {weeklyDistance.toFixed(1)}
                <span className="text-sm font-normal text-slate-400 ml-1">km</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Distance</p>
            </div>

            {/* Time */}
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {formatTime(weeklyTime)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Active time</p>
            </div>

            {/* Activities */}
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
              <p className="text-2xl md:text-3xl font-bold text-white tabular-nums">
                {weeklyActivities}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Activities</p>
            </div>

            {/* Rank - Hidden on small mobile */}
            <div className="hidden md:block rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 px-4 py-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-lg font-bold text-white">
                    #{cityRank || globalRank || '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {cityRank ? 'City Rank' : 'Global Rank'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
