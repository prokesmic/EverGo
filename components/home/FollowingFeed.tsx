import Link from "next/link"
import { Activity, Plus, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getFollowingFeed, type FeedActivity } from "@/lib/feed/getFollowingFeed"
import { SuggestedAthletes } from "@/components/recommendations/SuggestedAthletes"
import { formatDistanceToNow } from "date-fns"

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

function EmptyStateNoFollowing() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
      <div className="text-center mb-6">
        <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
        <div className="text-base font-medium text-slate-700">Build your network</div>
        <div className="mt-1 text-sm text-slate-500">
          Follow athletes to see their activities in your feed.
        </div>
      </div>
      <SuggestedAthletes variant="list" title="Suggested Athletes" limit={4} />
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

interface FollowingFeedProps {
  userId: string
  className?: string
}

export async function FollowingFeed({ userId, className }: FollowingFeedProps) {
  const { activities, followingCount } = await getFollowingFeed(userId, 20)

  // No following - show suggestion to follow people
  if (followingCount === 0) {
    return (
      <section className={cn("", className)} data-testid="following-feed">
        <EmptyStateNoFollowing />
      </section>
    )
  }

  // Following people but no activities
  if (activities.length === 0) {
    return (
      <section className={cn("", className)} data-testid="following-feed">
        <EmptyStateNoActivities />
      </section>
    )
  }

  return (
    <section className={cn("", className)} data-testid="following-feed">
      <div className="space-y-3">
        {activities.map((activity) => (
          <ActivityFeedCard key={activity.id} activity={activity} />
        ))}
      </div>
    </section>
  )
}
