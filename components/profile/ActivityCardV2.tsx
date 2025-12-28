"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Timer, Route, Flame, TrendingUp, Mountain, Gauge, Zap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ActivityCardV2Props {
  activity: {
    id: string
    title: string | null
    description: string | null
    activityDate: Date
    distanceMeters: number | null
    durationSeconds: number | null
    elevationGainMeters: number | null
    avgHeartRate: number | null
    caloriesBurned: number | null
    avgPaceSecondsPerKm: number | null
    mapThumbnailUrl?: string | null
    user: {
      id: string
      displayName: string | null
      username: string | null
      avatarUrl: string | null
    }
    discipline: {
      name: string
      sport: {
        name: string
        icon?: string | null
      }
    }
    _count?: {
      kudos: number
      comments: number
    }
  }
  variant?: "list" | "grid"
  showUser?: boolean
  onKudos?: () => void
  onComment?: () => void
  onShare?: () => void
}

export function ActivityCardV2({
  activity,
  variant = "list",
  showUser = true,
  onKudos,
  onComment,
  onShare,
}: ActivityCardV2Props) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const formatPace = (secondsPerKm: number) => {
    const m = Math.floor(secondsPerKm / 60)
    const s = Math.round(secondsPerKm % 60)
    return `${m}:${s.toString().padStart(2, "0")} /km`
  }

  const formatDistance = (meters: number) => {
    const km = meters / 1000
    return km >= 10 ? `${km.toFixed(1)} km` : `${km.toFixed(2)} km`
  }

  const initials = (activity.user.displayName || activity.user.username || "U")
    .substring(0, 2)
    .toUpperCase()

  const timeAgo = formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })

  const sportColors: Record<string, string> = {
    running: "bg-emerald-500",
    cycling: "bg-yellow-500",
    swimming: "bg-cyan-500",
    hiking: "bg-orange-500",
    gym: "bg-purple-500",
    yoga: "bg-pink-500",
  }

  const sportColor = sportColors[activity.discipline.sport.name.toLowerCase()] || "bg-slate-500"

  if (variant === "grid") {
    return (
      <Link
        href={`/activity/${activity.id}`}
        className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
      >
        {/* Map thumbnail or gradient */}
        <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200">
          {activity.mapThumbnailUrl && (
            <Image
              src={activity.mapThumbnailUrl}
              alt="Activity map"
              fill
              className="object-cover"
            />
          )}
          <div className="absolute top-2 left-2">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white",
              sportColor
            )}>
              {activity.discipline.sport.name}
            </span>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
            {activity.title || `${activity.discipline.name} Activity`}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{timeAgo}</p>

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
            {activity.distanceMeters && (
              <span className="flex items-center gap-1">
                <Route className="w-3 h-3" />
                {formatDistance(activity.distanceMeters)}
              </span>
            )}
            {activity.durationSeconds && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatTime(activity.durationSeconds)}
              </span>
            )}
          </div>

          {/* Social stats */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {activity._count?.kudos || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {activity._count?.comments || 0}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // List variant (default)
  return (
    <article className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with user info */}
      {showUser && (
        <div className="flex items-center justify-between p-4 pb-0">
          <Link
            href={`/profile/${activity.user.username || activity.user.id}`}
            className="flex items-center gap-3 group/user"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.user.avatarUrl ?? undefined} alt={activity.user.displayName ?? ""} />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-slate-900 text-sm group-hover/user:text-orange-600 transition-colors">
                {activity.user.displayName || activity.user.username}
              </p>
              <p className="text-xs text-slate-500">{timeAgo}</p>
            </div>
          </Link>

          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Activity content */}
      <Link href={`/activity/${activity.id}`} className="block group">
        <div className="p-4">
          {/* Sport badge + Title */}
          <div className="flex items-start gap-3">
            <span className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white shrink-0",
              sportColor
            )}>
              {activity.discipline.sport.name}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                {activity.title || `${activity.discipline.name} Activity`}
              </h3>
              {activity.description && (
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {activity.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {activity.distanceMeters && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                <Route className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{formatDistance(activity.distanceMeters)}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Distance</p>
                </div>
              </div>
            )}
            {activity.durationSeconds && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                <Timer className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{formatTime(activity.durationSeconds)}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Duration</p>
                </div>
              </div>
            )}
            {activity.avgPaceSecondsPerKm && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                <Gauge className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{formatPace(activity.avgPaceSecondsPerKm)}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Pace</p>
                </div>
              </div>
            )}
            {activity.elevationGainMeters && activity.elevationGainMeters > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                <Mountain className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.elevationGainMeters} m</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Elevation</p>
                </div>
              </div>
            )}
            {activity.avgHeartRate && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                <Heart className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.avgHeartRate} bpm</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Avg HR</p>
                </div>
              </div>
            )}
            {activity.caloriesBurned && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                <Flame className="w-4 h-4 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.caloriesBurned}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Calories</p>
                </div>
              </div>
            )}
          </div>

          {/* Map thumbnail */}
          {activity.mapThumbnailUrl && (
            <div className="mt-4 relative h-40 rounded-lg overflow-hidden bg-slate-100">
              <Image
                src={activity.mapThumbnailUrl}
                alt="Activity map"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Link>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-red-500 gap-1.5 h-8"
            onClick={(e) => {
              e.preventDefault()
              onKudos?.()
            }}
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">{activity._count?.kudos || 0}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-blue-500 gap-1.5 h-8"
            onClick={(e) => {
              e.preventDefault()
              onComment?.()
            }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{activity._count?.comments || 0}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-slate-900 h-8"
          onClick={(e) => {
            e.preventDefault()
            onShare?.()
          }}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </article>
  )
}
