import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft, Activity } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = "force-dynamic"

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

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default async function FeedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  })

  if (!user) {
    redirect("/login")
  }

  // Get who the user follows
  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    select: { followingId: true },
  })

  const followingIds = follows.map((f) => f.followingId)
  const audienceIds = [user.id, ...followingIds]

  // Get activities from audience (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: audienceIds },
      activityDate: { gte: thirtyDaysAgo },
    },
    orderBy: { activityDate: "desc" },
    take: 50,
    include: {
      user: {
        select: { id: true, displayName: true, avatarUrl: true, username: true },
      },
      discipline: {
        select: {
          slug: true,
          name: true,
          sport: { select: { slug: true, name: true } },
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/home"
            className="flex items-center justify-center h-9 w-9 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Activity Feed</h1>
        </div>

        {/* Feed */}
        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Activity className="mx-auto h-10 w-10 text-slate-300" />
            <div className="mt-3 text-sm font-medium text-slate-700">
              No activities yet
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Log your first activity or follow others to see their activities.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const sport = activity.discipline?.sport?.name ?? activity.discipline?.name ?? "Activity"
              const sportSlug = activity.discipline?.sport?.slug ?? activity.discipline?.slug
              const duration = formatDuration(activity.durationSeconds)
              const distance = formatDistance(activity.distanceMeters)

              return (
                <Link
                  key={activity.id}
                  href={`/activity/${activity.id}`}
                  className="block rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={activity.user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
                        {getInitials(activity.user.displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {activity.user.displayName ?? activity.user.username ?? "Someone"}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0">
                          {formatTimeAgo(activity.activityDate)}
                        </span>
                      </div>

                      <div className="mt-1 text-sm text-slate-700">
                        {activity.title}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-orange-600">
                          {formatSportName(sportSlug)}
                        </span>
                        {duration && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>{duration}</span>
                          </>
                        )}
                        {distance && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>{distance}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
