"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { TrendingUp, Trophy, Target, Users, Zap, Loader2, Activity } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface HighlightEvent {
  id: string
  type: "RANK_DELTA" | "PERSONAL_BEST" | "RIVALRY_SWING" | "TEAM_WIN" | "BIG_WEEK_DELTA"
  createdAt: string
  actor: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
  title: string
  context: string
  chip: string
  sportSlug: string | null
  disciplineName: string | null
}

interface RankingsHighlightsFeedProps {
  className?: string
  limit?: number
}

const typeIcons: Record<string, typeof TrendingUp> = {
  RANK_DELTA: TrendingUp,
  PERSONAL_BEST: Trophy,
  RIVALRY_SWING: Target,
  RIVALRY_COMPLETED: Target,
  TEAM_WIN: Users,
  BIG_WEEK_DELTA: Zap,
}

const typeColors: Record<string, string> = {
  RANK_DELTA: "text-blue-500 bg-blue-50",
  PERSONAL_BEST: "text-orange-500 bg-orange-50",
  RIVALRY_SWING: "text-purple-500 bg-purple-50",
  RIVALRY_COMPLETED: "text-green-500 bg-green-50",
  TEAM_WIN: "text-emerald-500 bg-emerald-50",
  BIG_WEEK_DELTA: "text-yellow-500 bg-yellow-50",
}

const chipColors: Record<string, string> = {
  RANK_DELTA: "bg-blue-100 text-blue-700",
  PERSONAL_BEST: "bg-orange-100 text-orange-700",
  RIVALRY_SWING: "bg-purple-100 text-purple-700",
  RIVALRY_COMPLETED: "bg-green-100 text-green-700",
  TEAM_WIN: "bg-emerald-100 text-emerald-700",
  BIG_WEEK_DELTA: "bg-yellow-100 text-yellow-700",
}

function getInitials(name: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function HighlightCard({ event }: { event: HighlightEvent }) {
  const Icon = typeIcons[event.type] ?? Activity
  const iconColorClass = typeColors[event.type] ?? "text-slate-500 bg-slate-50"
  const chipColorClass = chipColors[event.type] ?? "bg-slate-100 text-slate-700"

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      data-testid={`feed-item-${event.type.toLowerCase()}`}
    >
      <Link
        href={`/profile/${event.actor.id}`}
        className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
      >
        {/* Left: Icon */}
        <div className={cn("shrink-0 rounded-lg p-2", iconColorClass)}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Middle: Avatar + Content */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={event.actor.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
              {getInitials(event.actor.displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {event.actor.displayName ?? "Someone"}
              </span>
              <span className="text-[10px] text-slate-400 shrink-0">
                {formatRelativeTime(event.createdAt)}
              </span>
            </div>
            <div className="text-xs text-slate-600 truncate">{event.title}</div>
            <div className="text-[10px] text-slate-400 truncate">{event.context}</div>
          </div>
        </div>

        {/* Right: Chip */}
        <div
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
            chipColorClass
          )}
        >
          {event.chip}
        </div>
      </Link>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
      <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />
      <div className="mt-2 text-sm font-medium text-slate-700">No highlights yet</div>
      <div className="mt-1 text-xs text-slate-500">
        Complete activities and climb the leaderboard to see ranking updates here.
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  )
}

export function RankingsHighlightsFeed({ className, limit = 8 }: RankingsHighlightsFeedProps) {
  const [highlights, setHighlights] = useState<HighlightEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHighlights = useCallback(async () => {
    try {
      const response = await fetch(`/api/feed/highlights?scope=following&limit=${limit}`)
      const data = await response.json()
      setHighlights(data.highlights || [])
    } catch (error) {
      console.error("Error fetching highlights:", error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchHighlights()
  }, [fetchHighlights])

  if (loading) {
    return <LoadingState />
  }

  return (
    <section className={cn("", className)} data-testid="highlights-feed">
      {highlights.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {highlights.map((event) => (
              <HighlightCard key={event.id} event={event} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}

export default RankingsHighlightsFeed
