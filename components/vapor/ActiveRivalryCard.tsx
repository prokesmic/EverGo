"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Swords, TrendingUp, TrendingDown, Flame, Target, Zap, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Rival {
  id: string
  displayName: string
  avatarUrl: string | null
  sportIndex: number
  weeklyDistance: number
  weeklyTime: number
  streak: number
  city: string | null
}

interface ActiveRivalryCardProps {
  className?: string
}

export function ActiveRivalryCard({ className }: ActiveRivalryCardProps) {
  const { data: session } = useSession()
  const [rival, setRival] = useState<Rival | null>(null)
  const [userStats, setUserStats] = useState<{
    sportIndex: number
    weeklyDistance: number
    weeklyTime: number
    streak: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRival = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/rankings/rival")
        if (res.ok) {
          const data = await res.json()
          setRival(data.rival)
          setUserStats(data.userStats)
        }
      } catch (error) {
        console.error("Error fetching rival:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRival()
  }, [session])

  // Show actual rival only - no mock data in staging/production
  const displayRival = rival
  const displayUserStats = userStats

  // Calculate stats only if we have both rival and user stats
  const indexDiff = displayRival && displayUserStats ? displayRival.sportIndex - displayUserStats.sportIndex : 0
  const distanceDiff = displayRival && displayUserStats ? displayRival.weeklyDistance - displayUserStats.weeklyDistance : 0
  const isWinning = displayRival && displayUserStats ? displayUserStats.sportIndex > displayRival.sportIndex : false

  // Empty state when no rival found
  if (!loading && !displayRival) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("vapor-card overflow-hidden", className)}
      >
        <div className="px-5 py-4 bg-gradient-to-r from-orange-50 via-white to-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100">
              <Swords className="w-4 h-4 text-orange-500" />
            </div>
            <span className="font-semibold text-slate-900">Find a Rival</span>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
            <Target className="w-8 h-8 text-orange-300" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No rival yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            Log activities to get matched with a rival near your level
          </p>
          <Link href="/activity/create" className="block">
            <Button className="w-full vapor-btn-primary">
              <Zap className="w-4 h-4 mr-2" />
              Log Your First Activity
            </Button>
          </Link>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className={cn("vapor-card p-5 animate-pulse", className)}>
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-3 w-16 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // At this point displayRival is guaranteed to be non-null (handled in empty state above)
  if (!displayRival) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("vapor-card overflow-hidden", className)}
    >
      {/* Header with gradient */}
      <div className="px-5 py-4 bg-gradient-to-r from-orange-50 via-white to-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100">
              <Swords className="w-4 h-4 text-orange-500" />
            </div>
            <span className="font-semibold text-slate-900">Active Rivalry</span>
          </div>
          <div className="vapor-chip-active">
            <Flame className="w-3 h-3" />
            Hot
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Rival Info */}
        <div className="flex items-center justify-between mb-5">
          <Link href={`/profile/${displayRival.id}`} className="flex items-center gap-3 group">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-orange-200 ring-offset-2">
                <AvatarImage src={displayRival.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-lg">
                  {displayRival.displayName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Target className="w-5 h-5 text-orange-500" />
              </motion.div>
            </div>
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                {displayRival.displayName}
              </p>
              <p className="text-xs text-slate-500">{displayRival.city || "Unknown"}</p>
            </div>
          </Link>

          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {displayRival.sportIndex}
            </p>
            <p className="text-xs text-slate-500">Sport Index</p>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="vapor-ghost p-3 text-center">
            <div className="vapor-ghost-text !py-0 !px-0">
              <div className="flex items-center justify-center gap-1 mb-1">
                {indexDiff > 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  indexDiff > 0 ? "text-red-500" : "text-emerald-500"
                )}>
                  {Math.abs(indexDiff)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Index Gap</p>
            </div>
          </div>

          <div className="vapor-ghost p-3 text-center">
            <div className="vapor-ghost-text !py-0 !px-0">
              <div className="flex items-center justify-center gap-1 mb-1">
                {distanceDiff > 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  distanceDiff > 0 ? "text-red-500" : "text-emerald-500"
                )}>
                  {Math.abs(distanceDiff).toFixed(1)}km
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Weekly Gap</p>
            </div>
          </div>

          <div className="vapor-ghost p-3 text-center">
            <div className="vapor-ghost-text !py-0 !px-0">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-sm font-bold tabular-nums text-slate-700">
                  {displayRival.streak}d
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Their Streak</p>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isWinning ? "winning" : "catching"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={cn(
              "p-3 rounded-xl mb-4 text-sm",
              isWinning
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-orange-50 text-orange-700 border border-orange-100"
            )}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 shrink-0" />
              <span className="font-medium">
                {isWinning
                  ? "You're ahead! One more session to secure your lead."
                  : `${Math.abs(indexDiff)} points to overtake. You've got this!`}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Button */}
        <Link href="/activity/create" className="block">
          <Button className="w-full vapor-btn-primary group">
            <Zap className="w-4 h-4 mr-2" />
            Log Activity to Compete
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
