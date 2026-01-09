import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getSeasons, getUserSeasonRank } from "@/lib/season"
import { SeasonCard } from "@/components/season/SeasonCard"
import { Calendar } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

/**
 * V6 Seasons Page
 *
 * Browse all seasons - active and past
 */
export default async function SeasonsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  // Get all seasons
  const seasons = await getSeasons(12)
  const activeSeason = seasons.find((s) => s.status === "ACTIVE")
  const pastSeasons = seasons.filter((s) => s.status === "COMPLETED")

  // Get user stats for active season
  let activeSeasonStats = null
  if (activeSeason) {
    try {
      activeSeasonStats = await getUserSeasonRank(userId, activeSeason.id)
    } catch {
      // Ignore errors
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Seasons</h1>
          <p className="text-slate-500">Monthly competitions with fresh starts</p>
        </div>

        {/* Active Season */}
        {activeSeason && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-orange-500">&#128293;</span>
              Current Season
            </h2>
            <Link href={`/seasons/${activeSeason.id}`}>
              <SeasonCard
                season={activeSeason}
                userStats={
                  activeSeasonStats
                    ? {
                        totalPower: activeSeasonStats.totalPower,
                        rank: activeSeasonStats.rank,
                        total: activeSeasonStats.total,
                        activityCount: activeSeasonStats.activityCount,
                      }
                    : undefined
                }
              />
            </Link>
          </section>
        )}

        {/* Past Seasons */}
        {pastSeasons.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              Past Seasons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastSeasons.map((season) => (
                <Link key={season.id} href={`/seasons/${season.id}`}>
                  <SeasonCard season={season} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* No seasons */}
        {seasons.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Seasons Yet
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Seasons are monthly competitions where you compete against athletes
              worldwide. Check back soon!
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
