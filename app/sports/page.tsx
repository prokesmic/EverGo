import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getMySports } from "@/lib/mySports"
import { getAllSports } from "@/lib/sports"
import { getUserSportsBenchmarks } from "@/app/actions/benchmarks"
import { SportsPageClient } from "./sports-client"
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client"
import { Dumbbell, Trophy, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SportsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      displayName: true,
      benchmarkBests: {
        select: {
          benchmarkId: true,
          value: true,
          achievedAt: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Fetch all required data in parallel
  const [mySportsData, allSports, sportsBenchmarks, benchmarkDefinitions, subscription] =
    await Promise.all([
      getMySports(user.id),
      getAllSports(),
      getUserSportsBenchmarks(),
      prisma.benchmarkDefinition.findMany({
        where: { isActive: true },
        select: {
          id: true,
          sportId: true,
          slug: true,
          name: true,
          measurementType: true,
          unit: true,
          higherIsBetter: true,
        },
      }),
      prisma.subscription.findUnique({
        where: { userId: user.id },
        select: { status: true, plan: true },
      }),
    ])

  const isPro =
    subscription?.status === SubscriptionStatus.ACTIVE &&
    (subscription?.plan === SubscriptionPlan.PRO ||
      subscription?.plan === SubscriptionPlan.PRO_ANNUAL)

  // Count total PBs across all sports
  const totalPBs = sportsBenchmarks.reduce((acc, sport) => {
    const primaryWithPb = sport.primaryBenchmarks.filter((b) => b.userPb).length
    const secondaryWithPb = sport.secondaryBenchmarks.filter((b) => b.userPb).length
    return acc + primaryWithPb + secondaryWithPb
  }, 0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-0">
      {/* Elite Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-10">
          {/* Header Content */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  My Sports
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Your Athletic Identity
              </h1>
              <p className="mt-2 text-slate-400 max-w-lg">
                Manage your sports, track personal bests, and build your elite athlete profile.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Sports</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {mySportsData.active.length}
                </p>
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">PBs</span>
                </div>
                <p className="text-2xl font-bold text-white tabular-nums">{totalPBs}</p>
              </div>
              {!isPro && (
                <div className="px-5 py-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30">
                  <div className="flex items-center gap-2 text-purple-300 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Free</span>
                  </div>
                  <p className="text-sm font-medium text-white">
                    {mySportsData.active.length}/3 sports
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-2">
        <SportsPageClient
          mySportsData={mySportsData}
          allSports={allSports}
          sportsBenchmarks={sportsBenchmarks}
          benchmarkDefinitions={benchmarkDefinitions}
          userBenchmarkBests={user.benchmarkBests}
          isPro={isPro}
        />
      </div>
    </main>
  )
}
