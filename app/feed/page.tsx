import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Compass, Flame, Sparkles } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { RealtimeFeed } from "@/components/feed/realtime-feed"
import { SuggestedAthletes } from "@/components/recommendations/SuggestedAthletes"
import { StreakAlert } from "@/components/widgets/streak-alert"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

type FeedType = "all" | "friends" | "following"

interface FeedPageProps {
  searchParams: Promise<{
    type?: string
  }>
}

const feedTabs: Array<{ type: FeedType; label: string }> = [
  { type: "all", label: "For You" },
  { type: "following", label: "Following" },
  { type: "friends", label: "Friends" },
]

function normalizeFeedType(input: string | undefined): FeedType {
  if (input === "following" || input === "friends") return input
  return "all"
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const { type } = await searchParams
  const activeType = normalizeFeedType(type)

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      avatarUrl: true,
      streak: {
        select: {
          currentStreak: true,
          lastActivityDate: true,
          weeklyGoal: true,
          weeklyProgress: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-700 p-6 text-white md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            <Sparkles className="h-3.5 w-3.5" />
            Live Feed
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight md:text-4xl">
            Performance stories from your network.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Post updates, track what athletes near your level are doing, and jump into sessions worth your time.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                {feedTabs.map((tab) => (
                  <Link
                    key={tab.type}
                    href={tab.type === "all" ? "/feed" : `/feed?type=${tab.type}`}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      activeType === tab.type
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              <CreatePostBox userImage={user.avatarUrl ?? undefined} />
              <RealtimeFeed type={activeType} />
            </div>
          </div>

          <aside className="space-y-4">
            <StreakAlert
              currentStreak={user.streak?.currentStreak ?? 0}
              lastActivityDate={user.streak?.lastActivityDate ?? null}
              weeklyGoal={user.streak?.weeklyGoal ?? 3}
              weeklyProgress={user.streak?.weeklyProgress ?? 0}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
                <Flame className="h-4 w-4 text-orange-500" />
                Discovery
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Find athletes and communities that match your pace and goals.
              </p>
              <Link
                href="/discover"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Open Discover Hub
                <Compass className="h-4 w-4" />
              </Link>
            </div>

            <SuggestedAthletes variant="list" title="People to Follow" limit={5} />
          </aside>
        </div>
      </div>
    </main>
  )
}
