import Link from "next/link"
import { ArrowUpRight, Activity, Image as ImageIcon, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { getHomeHighlights, HighlightItem } from "@/lib/feed/getHomeHighlights"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

function formatSportName(slug?: string | null) {
  if (!slug) return "Activity"
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
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

function HighlightCard({ item }: { item: HighlightItem }) {
  const duration = formatDuration(item.durationSec)
  const distance = formatDistance(item.distanceM)
  const sport = formatSportName(item.sportSlug)

  return (
    <Link
      href={`/activity/${item.id}`}
      className="group flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
      data-testid="home-highlight-item"
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={item.user.avatarUrl ?? undefined} />
        <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
          {getInitials(item.user.displayName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {item.user.displayName ?? "Someone"}
          </span>
          {(item.hasMedia || item.hasRoute) && (
            <span className="shrink-0 flex items-center gap-1 text-[10px] text-slate-500">
              {item.hasMedia && <ImageIcon className="h-3 w-3" />}
              {item.hasRoute && <MapPin className="h-3 w-3" />}
            </span>
          )}
        </div>

        <div className="mt-0.5 text-xs text-slate-500 truncate">
          {item.title ?? sport}
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-600">
          <span className="font-medium text-orange-600">{sport}</span>
          {duration && (
            <>
              <span className="text-slate-400">·</span>
              <span>{duration}</span>
            </>
          )}
          {distance && (
            <>
              <span className="text-slate-400">·</span>
              <span>{distance}</span>
            </>
          )}
        </div>
      </div>

      <Activity className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-orange-500 transition-colors" />
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
      <Activity className="mx-auto h-8 w-8 text-slate-300" />
      <div className="mt-2 text-sm font-medium text-slate-700">No highlights yet</div>
      <div className="mt-1 text-xs text-slate-500">
        Log your first activity or follow friends to see their best sessions.
      </div>
    </div>
  )
}

interface HighlightsFeedProps {
  userId: string
  className?: string
  feedHref?: string
}

export async function HighlightsFeed({
  userId,
  className,
  feedHref = "/feed",
}: HighlightsFeedProps) {
  const items = await getHomeHighlights(userId, 6)

  return (
    <section className={cn("", className)} data-testid="home-highlights">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Highlights</h2>
        <Link
          href={feedHref}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors"
          data-testid="home-highlights-view-all"
        >
          View all
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {items.map((item) => (
            <HighlightCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
