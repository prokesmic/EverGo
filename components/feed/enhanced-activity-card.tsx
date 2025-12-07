"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  Activity as ActivityIcon,
  Flame,
  TrendingUp,
  Trophy,
  Zap,
  Target,
  Mountain,
  Wind,
  Droplets,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import ActivityMap from "@/components/ui/map"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CommentsSection } from "@/components/comments/comments-section"

interface EnhancedActivityCardProps {
  post: {
    id: string
    postType: string
    content: string | null
    photos: string[]
    mapImageUrl: string | null
    createdAt: string
    user: {
      id: string
      username: string
      displayName: string
      avatarUrl: string | null
    }
    activity: {
      id: string
      title: string
      sportName: string
      sportIcon: string
      durationSeconds: number | null
      distanceMeters: number | null
      caloriesBurned: number | null
      elevationGain: number | null
      avgPace: number | null
      avgHeartRate: number | null
      maxHeartRate?: number | null
      avgSpeed?: number | null
      maxSpeed?: number | null
    } | null
    engagement: {
      likesCount: number
      commentsCount: number
      isLikedByMe: boolean
    }
    achievements?: {
      isPR?: boolean
      isLongestRun?: boolean
      isFastestPace?: boolean
      streakDay?: number
    }
  }
}

export function EnhancedActivityCard({ post }: EnhancedActivityCardProps) {
  const { activity, user, engagement, achievements } = post
  const [isLiked, setIsLiked] = useState(engagement.isLikedByMe)
  const [likesCount, setLikesCount] = useState(engagement.likesCount)
  const [showComments, setShowComments] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)

  const handleLike = async () => {
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      const method = isLiked ? "DELETE" : "POST"
      await fetch(`/api/posts/${post.id}/like`, { method })
    } catch (error) {
      setIsLiked(!isLiked)
      setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1))
    }
  }

  const handleShare = async () => {
    const activityUrl = `${window.location.origin}/activity/${activity?.id || post.id}`
    const shareData = {
      title: activity?.title || "Check out this activity!",
      text: `${user.displayName} completed a ${activity?.distanceMeters ? (activity.distanceMeters / 1000).toFixed(2) : "0"}km ${activity?.sportName || "activity"} on EverGo!`,
      url: activityUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success("Shared successfully!")
      } else {
        await navigator.clipboard.writeText(activityUrl)
        toast.success("Link copied to clipboard!")
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(activityUrl)
          toast.success("Link copied to clipboard!")
        } catch {
          toast.error("Failed to share activity")
        }
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const formatPace = (secondsPerKm: number) => {
    const m = Math.floor(secondsPerKm / 60)
    const s = Math.round(secondsPerKm % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (!activity && post.postType === "ACTIVITY") return null

  const distanceKm = activity?.distanceMeters ? (activity.distanceMeters / 1000).toFixed(2) : "0"
  const duration = activity?.durationSeconds || 0

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border-light overflow-hidden mb-6 hover:shadow-xl transition-shadow">
      {/* Header with larger avatar */}
      <div className="flex items-start gap-4 p-5 border-b border-border-light">
        <Link href={`/profile/${user.username}`}>
          <Avatar className="h-14 w-14 border-2 border-border-light ring-2 ring-offset-2 ring-transparent hover:ring-brand-primary transition-all cursor-pointer">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              {user.displayName[0]}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              href={`/profile/${user.username}`}
              className="font-bold text-lg text-text-primary hover:underline truncate"
            >
              {user.displayName}
            </Link>
            {achievements?.streakDay && achievements.streakDay % 7 === 0 && (
              <Badge variant="outline" className="gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <Flame className="w-3 h-3" />
                {achievements.streakDay} day streak!
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-text-muted">
            {activity && (
              <>
                <span className="flex items-center gap-1">
                  {activity.sportIcon} <span className="font-medium text-text-primary">{activity.sportName}</span>
                </span>
                <span>•</span>
              </>
            )}
            <time>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</time>
          </div>
        </div>

        {/* Achievement badges */}
        {achievements && (
          <div className="flex gap-2">
            {achievements.isPR && (
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg" title="Personal Record!">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            )}
            {achievements.isLongestRun && (
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg" title="Longest Distance!">
                <Target className="w-5 h-5 text-white" />
              </div>
            )}
            {achievements.isFastestPace && (
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg" title="Fastest Pace!">
                <Zap className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Title - Bigger and more prominent */}
      <div className="px-5 pt-4">
        {activity && (
          <Link href={`/activity/${activity.id}`}>
            <h2 className="font-bold text-2xl text-text-primary mb-2 hover:text-brand-primary transition-colors">
              {activity.title}
            </h2>
          </Link>
        )}
        {post.content && <p className="text-text-secondary text-base whitespace-pre-wrap mb-4">{post.content}</p>}
      </div>

      {/* Hero Stats - Large, prominent display */}
      {activity && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Distance - Hero metric */}
            <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-xl p-4 border border-brand-primary/20">
              <div className="flex items-center gap-2 text-xs text-brand-primary font-semibold uppercase tracking-wide mb-1">
                <ActivityIcon className="w-4 h-4" />
                Distance
              </div>
              <div className="text-4xl font-black text-brand-primary">
                {distanceKm}
                <span className="text-lg font-medium text-text-muted ml-1">km</span>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
              <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold uppercase tracking-wide mb-1">
                <Clock className="w-4 h-4" />
                Time
              </div>
              <div className="text-4xl font-black text-purple-700">{formatDuration(duration)}</div>
            </div>

            {/* Pace */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-200/50">
              <div className="flex items-center gap-2 text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
                <TrendingUp className="w-4 h-4" />
                Avg Pace
              </div>
              <div className="text-4xl font-black text-green-700">
                {activity.avgPace ? formatPace(activity.avgPace) : "--:--"}
                <span className="text-lg font-medium text-text-muted ml-1">/km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats - Grid */}
      {activity && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {activity.elevationGain !== null && activity.elevationGain > 0 && (
              <div className="bg-surface-secondary rounded-lg p-3 text-center">
                <Mountain className="w-4 h-4 mx-auto mb-1 text-text-muted" />
                <div className="text-xs text-text-muted mb-0.5">Elevation</div>
                <div className="font-bold text-text-primary">{activity.elevationGain}m</div>
              </div>
            )}

            {activity.caloriesBurned !== null && (
              <div className="bg-surface-secondary rounded-lg p-3 text-center">
                <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
                <div className="text-xs text-text-muted mb-0.5">Calories</div>
                <div className="font-bold text-text-primary">{activity.caloriesBurned}</div>
              </div>
            )}

            {activity.avgHeartRate !== null && (
              <div className="bg-surface-secondary rounded-lg p-3 text-center">
                <ActivityIcon className="w-4 h-4 mx-auto mb-1 text-red-500" />
                <div className="text-xs text-text-muted mb-0.5">Avg HR</div>
                <div className="font-bold text-text-primary">{activity.avgHeartRate} bpm</div>
              </div>
            )}

            {activity.avgSpeed != null && (
              <div className="bg-surface-secondary rounded-lg p-3 text-center">
                <Wind className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                <div className="text-xs text-text-muted mb-0.5">Avg Speed</div>
                <div className="font-bold text-text-primary">{activity.avgSpeed!.toFixed(1)} km/h</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map - Larger and more prominent */}
      {activity && (
        <div
          className={cn("w-full relative cursor-pointer overflow-hidden transition-all", imageExpanded ? "h-[600px]" : "h-[400px]")}
          onClick={() => setImageExpanded(!imageExpanded)}
        >
          <ActivityMap
            center={[50.0755, 14.4378]}
            zoom={13}
            path={[
              [50.0755, 14.4378],
              [50.0765, 14.4388],
              [50.0775, 14.4398],
              [50.0785, 14.4408],
              [50.0795, 14.4418],
            ]}
          />
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            {imageExpanded ? "Click to shrink" : "Click to expand"}
          </div>
        </div>
      )}

      {/* Photos - Better grid layout */}
      {post.photos && post.photos.length > 0 && (
        <div
          className={cn(
            "grid gap-1",
            post.photos.length === 1 ? "grid-cols-1" : post.photos.length === 2 ? "grid-cols-2" : "grid-cols-2"
          )}
        >
          {post.photos.slice(0, 4).map((photo, i) => (
            <div
              key={i}
              className={cn("relative bg-gray-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity", post.photos.length === 1 ? "aspect-[16/9]" : "aspect-square")}
            >
              <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 3 && post.photos.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-2xl font-bold">
                  +{post.photos.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-5 py-3 flex items-center justify-between border-t border-border-light bg-gray-50/50">
        <div className="flex gap-4 text-sm text-text-muted">
          {likesCount > 0 && (
            <button onClick={handleLike} className="hover:text-brand-primary transition-colors">
              <span className="font-semibold">{likesCount}</span> {likesCount === 1 ? "like" : "likes"}
            </button>
          )}
          {engagement.commentsCount > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:text-brand-primary transition-colors">
              <span className="font-semibold">{engagement.commentsCount}</span>{" "}
              {engagement.commentsCount === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons - Larger and more prominent */}
      <div className="px-3 py-2 flex items-center border-t border-border-light">
        <Button
          variant="ghost"
          size="lg"
          className={cn("flex-1 gap-2 text-base", isLiked ? "text-red-500 hover:text-red-600" : "text-text-secondary hover:text-red-500")}
          onClick={handleLike}
        >
          <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
          <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="flex-1 gap-2 text-base text-text-secondary hover:text-brand-primary"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline">Comment</span>
        </Button>
        <Button variant="ghost" size="lg" className="flex-1 gap-2 text-base text-text-secondary hover:text-brand-primary" onClick={handleShare}>
          <Share2 className="w-6 h-6" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-5 py-6 border-t border-border-light bg-surface-secondary/30">
          <CommentsSection postId={post.id} />
        </div>
      )}
    </div>
  )
}
