"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, MapPin, Clock, Activity, Flame, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import ActivityMap from "@/components/ui/map"

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

    if (!activity && post.postType === 'ACTIVITY') return null // Should not happen

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden mb-4">
            {/* Header */}
            <div className="flex items-start gap-3 p-4">
                <Link href={`/profile/${user.username}`}>
                    <Avatar className="h-10 w-10 border border-border-light">
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName} />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/profile/${user.username}`} className="font-semibold text-text-primary hover:underline truncate">
                            {user.displayName}
                        </Link>
                        {activity && (
                            <span className="text-text-secondary text-sm">
                                {activity.sportIcon} <span className="font-medium text-text-primary">{activity.sportName}</span>
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </div>
                </div>
            </div>

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

            {/* Actions */}
            <div className="px-2 py-1 flex items-center border-t border-border-light">
                <Button
                    variant="ghost"
                    className={`flex-1 gap-2 ${isLiked ? 'text-brand-primary' : 'text-text-secondary'}`}
                    onClick={handleLike}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    Like
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 gap-2 text-text-secondary"
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle className="w-5 h-5" />
                    Comment
                </Button>
                <Button variant="ghost" className="flex-1 gap-2 text-text-secondary">
                    <Share2 className="w-5 h-5" />
                    Share
                </Button>
            </div>
        </div>
    )
}
