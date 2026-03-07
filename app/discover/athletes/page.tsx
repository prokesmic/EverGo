import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Compass, MapPin, Target, Network } from "lucide-react"
import { SuggestedAthletes } from "@/components/recommendations/SuggestedAthletes"

export const dynamic = "force-dynamic"

export default async function DiscoverAthletesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">
            <Compass className="h-3.5 w-3.5" />
            Athlete Discovery
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
            Build a stronger network around your training.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Follow people nearby, athletes in your primary sport, and friends-of-friends to unlock a
            more relevant feed and local competition.
          </p>
          <div className="mt-5">
            <Link href="/discover" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Back to Discover Hub
            </Link>
          </div>
        </section>

        <SuggestedAthletes
          variant="cards"
          title="Near You"
          mode="near"
          limit={8}
          className="shadow-sm"
        />

        <SuggestedAthletes
          variant="cards"
          title="Same Sport Momentum"
          mode="sport"
          limit={8}
          className="shadow-sm"
        />

        <SuggestedAthletes
          variant="cards"
          title="Friends of Friends"
          mode="fof"
          limit={8}
          className="shadow-sm"
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <MapPin className="h-5 w-5 text-orange-500" />
            <div className="mt-2 font-semibold text-slate-900">Local Match</div>
            <p className="mt-1 text-sm text-slate-600">Prioritize athletes from your city and country.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Target className="h-5 w-5 text-orange-500" />
            <div className="mt-2 font-semibold text-slate-900">Sport Match</div>
            <p className="mt-1 text-sm text-slate-600">Find people training for similar goals and disciplines.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Network className="h-5 w-5 text-orange-500" />
            <div className="mt-2 font-semibold text-slate-900">Network Match</div>
            <p className="mt-1 text-sm text-slate-600">Expand via trusted mutuals for better engagement quality.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
