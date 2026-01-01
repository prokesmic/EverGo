"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import Link from "next/link"
import { Activity, Plus, Users, Loader2, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

interface FeedActivity {
  id: string
  title: string | null
  description: string | null
  distanceMeters: number | null
  durationSeconds: number | null
  createdAt: string
  user: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
  discipline?: {
    sport?: {
      name: string
    } | null
  } | null
}

interface VirtualizedFollowingFeedProps {
  className?: string
  maxHeight?: number
}

// =============================================================================
// UTILS
// =============================================================================

function formatDuration(sec?: number | null) {
  if (!sec) return null
  const m = Math.round(sec / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}

function formatDistance(meters?: number | null) {
  if (!meters) return null
  const km = meters / 1000
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(meters)} m`
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

// =============================================================================
// ACTIVITY CARD
// =============================================================================

function ActivityFeedCard({ activity }: { activity: FeedActivity }) {
  const duration = formatDuration(activity.durationSeconds)
  const distance = formatDistance(activity.distanceMeters)
  const sportName = activity.discipline?.sport?.name ?? "Activity"

  return (
    <Link
      href={`/activity/${activity.id}`}
      className="group block rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
      data-testid="following-feed-item"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={activity.user.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
            {getInitials(activity.user.displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 truncate">
              {activity.user.displayName ?? "Someone"}
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            <span className="mx-1.5">·</span>
            <span className="text-orange-600 font-medium">{sportName}</span>
          </div>
        </div>
      </div>

      {/* Title */}
      {activity.title && (
        <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
          {activity.title}
        </h3>
      )}

      {/* Description */}
      {activity.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {activity.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        {distance && (
          <div>
            <span className="font-bold text-slate-900">{distance}</span>
          </div>
        )}
        {duration && (
          <div>
            <span className="font-bold text-slate-900">{duration}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// =============================================================================
// EMPTY STATES
// =============================================================================

function EmptyStateNoFollowing() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
      <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
      <div className="text-base font-medium text-slate-700">Build your network</div>
      <div className="mt-1 text-sm text-slate-500 mb-4">
        Follow athletes to see their activities in your feed.
      </div>
      <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
        <Link href="/discover/athletes">
          Discover Athletes
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

function EmptyStateNoActivities() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
      <Activity className="mx-auto h-10 w-10 text-slate-300 mb-3" />
      <div className="text-base font-medium text-slate-700">No activities yet</div>
      <div className="mt-1 text-sm text-slate-500 mb-4">
        Be the first to log an activity!
      </div>
      <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600">
        <Link href="/activity/create">
          <Plus className="w-4 h-4 mr-1.5" />
          Log Activity
        </Link>
      </Button>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ITEM_HEIGHT = 160 // Approximate height of each activity card
const VIRTUALIZATION_THRESHOLD = 50

export function VirtualizedFollowingFeed({
  className,
  maxHeight = 520,
}: VirtualizedFollowingFeedProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [activities, setActivities] = useState<FeedActivity[]>([])
  const [followingCount, setFollowingCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // Fetch activities
  const fetchActivities = useCallback(async (pageNum: number, reset = false) => {
    try {
      if (reset) setLoading(true)
      else setLoadingMore(true)

      const res = await fetch(`/api/feed/following?page=${pageNum}&limit=20`)
      const data = await res.json()

      if (reset) {
        setActivities(data.activities ?? [])
      } else {
        setActivities((prev) => [...prev, ...(data.activities ?? [])])
      }

      setFollowingCount(data.followingCount ?? 0)
      setHasMore(data.hasMore ?? false)
    } catch (error) {
      console.error("Error fetching following feed:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities(1, true)
  }, [fetchActivities])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchActivities(nextPage)
    }
  }, [loadingMore, hasMore, page, fetchActivities])

  // Virtualization
  const useVirtualization = activities.length > VIRTUALIZATION_THRESHOLD

  const virtualizer = useVirtualizer({
    count: activities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })

  // Scroll handler for infinite loading
  const handleScroll = useCallback(() => {
    if (!parentRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current
    if (scrollHeight - scrollTop - clientHeight < 200) {
      loadMore()
    }
  }, [loadMore])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  // No following
  if (followingCount === 0) {
    return (
      <section className={cn("", className)} data-testid="following-feed">
        <EmptyStateNoFollowing />
      </section>
    )
  }

  // Following but no activities
  if (activities.length === 0) {
    return (
      <section className={cn("", className)} data-testid="following-feed">
        <EmptyStateNoActivities />
      </section>
    )
  }

  // Virtualized list
  if (useVirtualization) {
    return (
      <section className={cn("", className)} data-testid="following-feed">
        <div
          ref={parentRef}
          onScroll={handleScroll}
          className="overflow-auto"
          style={{ height: maxHeight, contain: "strict" }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const activity = activities[virtualItem.index]
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="pb-3"
                >
                  <ActivityFeedCard activity={activity} />
                </div>
              )
            })}
          </div>
        </div>

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}

        <div className="mt-3 text-center">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
          >
            View all activity
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    )
  }

  // Non-virtualized list (< 50 items)
  return (
    <section className={cn("", className)} data-testid="following-feed">
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityFeedCard key={activity.id} activity={activity} />
        ))}
      </div>

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      )}

      {hasMore && !loadingMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            Load more
          </Button>
        </div>
      )}
    </section>
  )
}

export default VirtualizedFollowingFeed
