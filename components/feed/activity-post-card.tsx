"use client"

import { useState, useRef, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MapPin, Clock, Activity, Flame, TrendingUp, MoreHorizontal, Bookmark, Flag, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import ActivityMap from "@/components/ui/map"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ActivityPostCardProps {
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
        } | null
        engagement: {
            likesCount: number
            commentsCount: number
            isLikedByMe: boolean
        }
    }
}

export function ActivityPostCard({ post }: ActivityPostCardProps) {
    const { activity, user, engagement } = post
    const [isLiked, setIsLiked] = useState(engagement.isLikedByMe)
    const [likesCount, setLikesCount] = useState(engagement.likesCount)
    const [showComments, setShowComments] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [showActions, setShowActions] = useState(false)

    // Swipe state for mobile
    const [swipeOffset, setSwipeOffset] = useState(0)
    const [isSwiping, setIsSwiping] = useState(false)
    const startX = useRef(0)
    const cardRef = useRef<HTMLDivElement>(null)

    // Double-tap to like
    const lastTap = useRef(0)
    const handleDoubleTap = useCallback(() => {
        const now = Date.now()
        const DOUBLE_TAP_DELAY = 300
        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            if (!isLiked) {
                handleLikeWithHaptic()
            }
        }
        lastTap.current = now
    }, [isLiked])

    // Haptic feedback helper
    const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
        if (navigator.vibrate) {
            const durations = { light: 10, medium: 25, heavy: 50 }
            navigator.vibrate(durations[intensity])
        }
    }

    const handleLikeWithHaptic = async () => {
        triggerHaptic('medium')
        handleLike()
    }

    const handleLike = async () => {
        // Optimistic update
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const method = isLiked ? "DELETE" : "POST"
            await fetch(`/api/posts/${post.id}/like`, { method })
        } catch (error) {
            // Revert on error
            setIsLiked(!isLiked)
            setLikesCount(prev => isLiked ? prev + 1 : prev - 1)
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
            // Try native share API first (mobile)
            if (navigator.share) {
                await navigator.share(shareData)
                toast.success("Shared successfully!")
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(activityUrl)
                toast.success("Link copied to clipboard!")
            }
        } catch (error) {
            // Fallback if sharing fails
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
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const formatPace = (secondsPerKm: number) => {
        const m = Math.floor(secondsPerKm / 60)
        const s = Math.round(secondsPerKm % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    // Handle swipe gestures
    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
        setIsSwiping(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwiping) return
        const diff = e.touches[0].clientX - startX.current
        // Only allow left swipe (negative diff) with max of -100px
        if (diff < 0) {
            setSwipeOffset(Math.max(diff * 0.5, -80))
        }
    }

    const handleTouchEnd = () => {
        setIsSwiping(false)
        if (swipeOffset < -40) {
            // Show quick actions
            setShowActions(true)
            triggerHaptic('light')
        }
        setSwipeOffset(0)
    }

    const handleSave = () => {
        setIsSaved(!isSaved)
        triggerHaptic('light')
        toast.success(isSaved ? "Removed from saved" : "Saved to collection")
        setShowActions(false)
    }

    if (!activity && post.postType === 'ACTIVITY') return null // Should not happen

    return (
        <div className="relative mb-4">
            {/* Swipe Action Background */}
            <div
                className={cn(
                    "absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center bg-brand-blue rounded-r-xl transition-opacity",
                    swipeOffset < -20 ? "opacity-100" : "opacity-0"
                )}
            >
                <Bookmark className="w-6 h-6 text-white" />
            </div>

            {/* Main Card with Swipe */}
            <div
                ref={cardRef}
                className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden relative"
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: isSwiping ? 'none' : 'transform 0.2s ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleDoubleTap}
            >
                {/* Header - increased touch targets */}
                <div className="flex items-start gap-3 p-4">
                    <Link href={`/profile/${user.username}`} className="shrink-0">
                        <Avatar className="h-11 w-11 border-2 border-border-light active:scale-95 transition-transform">
                            <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                            <AvatarFallback className="text-sm font-semibold">{user.displayName[0]}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/profile/${user.username}`} className="font-semibold text-text-primary hover:underline truncate active:opacity-70">
                                {user.displayName}
                            </Link>
                            {activity && (
                                <span className="text-text-secondary text-sm">
                                    {activity.sportIcon} <span className="font-medium text-text-primary">{activity.sportName}</span>
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                    </div>
                    {/* More actions button */}
                    <button
                        className="p-2 -mr-2 rounded-full hover:bg-surface-secondary active:bg-surface-secondary transition-colors"
                        onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
                    >
                        <MoreHorizontal className="w-5 h-5 text-text-muted" />
                    </button>
                </div>

                {/* Quick Actions Dropdown */}
                {showActions && (
                    <div className="absolute right-4 top-14 z-20 bg-white rounded-lg shadow-lg border border-border-light py-1 min-w-[160px]">
                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary active:bg-surface-secondary text-left"
                            onClick={(e) => { e.stopPropagation(); handleSave() }}
                        >
                            <Bookmark className={cn("w-5 h-5", isSaved ? "fill-brand-blue text-brand-blue" : "text-text-secondary")} />
                            <span className="text-sm font-medium">{isSaved ? "Unsave" : "Save"}</span>
                        </button>
                        <Link
                            href={`/activity/${activity?.id || post.id}`}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary active:bg-surface-secondary"
                            onClick={() => setShowActions(false)}
                        >
                            <Eye className="w-5 h-5 text-text-secondary" />
                            <span className="text-sm font-medium">View Details</span>
                        </Link>
                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary active:bg-surface-secondary text-left"
                            onClick={(e) => { e.stopPropagation(); setShowActions(false); toast.info("Report submitted") }}
                        >
                            <Flag className="w-5 h-5 text-text-secondary" />
                            <span className="text-sm font-medium">Report</span>
                        </button>
                    </div>
                )}

                {/* Click outside to close */}
                {showActions && (
                    <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => { e.stopPropagation(); setShowActions(false) }}
                    />
                )}

            {/* Content */}
            <div className="px-4 pb-3">
                {activity && <h3 className="font-bold text-lg text-text-primary mb-1">{activity.title}</h3>}
                {post.content && (
                    <p className="text-text-secondary whitespace-pre-wrap">{post.content}</p>
                )}
            </div>

            {/* Activity Stats */}
            {activity && (
                <div className="mx-4 mb-4 bg-bg-page rounded-lg border border-border-light overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-border-light">
                        {activity.distanceMeters !== null && (
                            <div className="p-3 text-center">
                                <div className="text-xs text-text-muted uppercase tracking-wider font-medium mb-0.5">Distance</div>
                                <div className="text-lg font-bold text-text-primary">
                                    {(activity.distanceMeters / 1000).toFixed(2)} <span className="text-xs font-normal text-text-secondary">km</span>
                                </div>
                            </div>
                        )}
                        {activity.durationSeconds !== null && (
                            <div className="p-3 text-center">
                                <div className="text-xs text-text-muted uppercase tracking-wider font-medium mb-0.5">Time</div>
                                <div className="text-lg font-bold text-text-primary">
                                    {formatDuration(activity.durationSeconds)}
                                </div>
                            </div>
                        )}
                        {activity.avgPace !== null && (
                            <div className="p-3 text-center">
                                <div className="text-xs text-text-muted uppercase tracking-wider font-medium mb-0.5">Pace</div>
                                <div className="text-lg font-bold text-text-primary">
                                    {formatPace(activity.avgPace)} <span className="text-xs font-normal text-text-secondary">/km</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Secondary Stats */}
                    {(activity.elevationGain || activity.caloriesBurned || activity.avgHeartRate) && (
                        <div className="grid grid-cols-3 divide-x divide-border-light border-t border-border-light bg-gray-50/50">
                            <div className="p-2 text-center">
                                {activity.elevationGain && (
                                    <>
                                        <div className="text-[10px] text-text-muted uppercase">Elevation</div>
                                        <div className="font-semibold text-sm text-text-primary">{activity.elevationGain}m</div>
                                    </>
                                )}
                            </div>
                            <div className="p-2 text-center">
                                {activity.caloriesBurned && (
                                    <>
                                        <div className="text-[10px] text-text-muted uppercase">Calories</div>
                                        <div className="font-semibold text-sm text-text-primary">{activity.caloriesBurned}</div>
                                    </>
                                )}
                            </div>
                            <div className="p-2 text-center">
                                {activity.avgHeartRate && (
                                    <>
                                        <div className="text-[10px] text-text-muted uppercase">Avg HR</div>
                                        <div className="font-semibold text-sm text-text-primary">{activity.avgHeartRate} bpm</div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Map & Photos */}
            {/* Map & Photos */}
            {/* For demo purposes, we show the map if it's an activity type, even without specific route data yet */}
            {activity && (
                <div className="w-full h-64 bg-gray-100 relative mb-3 z-0">
                    <ActivityMap
                        center={[50.0755, 14.4378]} // Prague
                        zoom={13}
                        path={[
                            [50.0755, 14.4378],
                            [50.0765, 14.4388],
                            [50.0775, 14.4398],
                            [50.0785, 14.4408],
                            [50.0795, 14.4418]
                        ]}
                    />
                </div>
            )}

            {post.photos && post.photos.length > 0 && (
                <div className={`grid gap-1 mb-3 ${post.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.photos.slice(0, 4).map((photo, i) => (
                        <div key={i} className="aspect-video relative bg-gray-100">
                            <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-text-muted border-t border-border-light bg-gray-50/30">
                <div className="flex gap-4">
                    {likesCount > 0 && <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>}
                    {engagement.commentsCount > 0 && <span>{engagement.commentsCount} {engagement.commentsCount === 1 ? 'comment' : 'comments'}</span>}
                </div>
            </div>

            {/* Actions - larger touch targets for mobile */}
            <div className="px-1 py-1 flex items-center border-t border-border-light">
                <button
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all active:scale-95",
                        isLiked ? "text-red-500" : "text-text-secondary"
                    )}
                    onClick={(e) => { e.stopPropagation(); handleLikeWithHaptic() }}
                >
                    <Heart className={cn(
                        "w-6 h-6 transition-transform",
                        isLiked && "fill-current animate-[heartBeat_0.3s_ease-in-out]"
                    )} />
                    <span className="text-sm font-medium hidden sm:inline">Like</span>
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-text-secondary transition-all active:scale-95"
                    onClick={(e) => { e.stopPropagation(); setShowComments(!showComments) }}
                >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-medium hidden sm:inline">Comment</span>
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-text-secondary transition-all active:scale-95"
                    onClick={(e) => { e.stopPropagation(); handleShare() }}
                >
                    <Share2 className="w-6 h-6" />
                    <span className="text-sm font-medium hidden sm:inline">Share</span>
                </button>
                <button
                    className={cn(
                        "flex items-center justify-center p-3 rounded-lg transition-all active:scale-95",
                        isSaved ? "text-brand-blue" : "text-text-secondary"
                    )}
                    onClick={(e) => { e.stopPropagation(); handleSave() }}
                >
                    <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
                </button>
            </div>
            </div>
        </div>
    )
}
