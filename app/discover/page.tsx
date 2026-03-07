import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Compass, Users, Trophy, ArrowRight, Flame } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SuggestedAthletes } from "@/components/recommendations/SuggestedAthletes"

export const dynamic = "force-dynamic"

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  const [challenges, teams] = await Promise.all([
    prisma.challenge.findMany({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: [{ participants: { _count: "desc" } }, { endDate: "asc" }],
      take: 6,
      include: {
        sport: {
          select: { name: true, icon: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    }),
    prisma.team.findMany({
      where: { isPublic: true },
      orderBy: [{ totalActivities: "desc" }, { memberCount: "desc" }],
      take: 6,
      include: {
        sport: {
          select: { name: true, icon: true },
        },
      },
    }),
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-700 p-6 text-white md:p-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Compass className="h-3.5 w-3.5" />
              Discovery Hub
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
              <Flame className="h-3.5 w-3.5" />
              Personalized for you
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight md:text-4xl">
            Find athletes, teams, and challenges worth your effort.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
            Explore people near you, in your sport, and one follow away. Join active challenges and
            teams that match your current momentum.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/discover/athletes"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Explore Athletes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search?type=challenges"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse Challenges
            </Link>
          </div>
        </section>

        <SuggestedAthletes
          variant="cards"
          title="Recommended Athletes"
          limit={8}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Trophy className="h-5 w-5 text-orange-500" />
                Trending Challenges
              </h2>
              <Link href="/challenges" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="block rounded-xl border border-slate-200/80 bg-slate-50 p-3 transition hover:border-orange-300 hover:bg-orange-50/40"
                >
                  <div className="font-semibold text-slate-900">{challenge.title}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {challenge.sport?.icon ?? "🏁"} {challenge.sport?.name ?? "All Sports"} ·{" "}
                    {challenge._count.participants} participants
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Users className="h-5 w-5 text-orange-500" />
                Teams Recruiting
              </h2>
              <Link href="/teams" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.slug}`}
                  className="block rounded-xl border border-slate-200/80 bg-slate-50 p-3 transition hover:border-orange-300 hover:bg-orange-50/40"
                >
                  <div className="font-semibold text-slate-900">{team.name}</div>
                  <div className="mt-1 text-xs text-slate-600">
                    {team.sport.icon} {team.sport.name} · {team.memberCount} members
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
