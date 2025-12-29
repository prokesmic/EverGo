import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getUserSportsBenchmarks } from "@/app/actions/benchmarks"
import { PersonalBestsManager } from "@/components/settings/PersonalBestsManager"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function PersonalBestsSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const sportsBenchmarks = await getUserSportsBenchmarks()

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Personal Bests</h1>
        <p className="text-slate-500 mt-1">
          View and manage your personal records across all your sports
        </p>
      </div>

      <div className="p-6">
        {sportsBenchmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">
              You haven&apos;t added any sports yet. Add sports first to manage your personal bests.
            </p>
            <Link
              href="/settings/sports"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Sports
            </Link>
          </div>
        ) : (
          <PersonalBestsManager initialData={sportsBenchmarks} />
        )}
      </div>
    </div>
  )
}
