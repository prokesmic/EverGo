import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserGauntlets, getPendingInvitations } from "@/lib/gauntlet"
import { GauntletsList } from "@/components/gauntlet/GauntletsList"
import { Button } from "@/components/ui/button"
import { Plus, Swords } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

/**
 * V6 Gauntlets Page
 *
 * Browse and manage all gauntlets
 */
export default async function GauntletsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [myGauntlets, pendingInvitations] = await Promise.all([
    getUserGauntlets(userId, 50),
    getPendingInvitations(userId),
  ])

  // Separate by status
  const pending = [
    ...myGauntlets.filter((g) => g.status === "PENDING"),
    ...pendingInvitations,
  ]
  const active = myGauntlets.filter((g) => g.status === "ACTIVE")
  const completed = myGauntlets
    .filter((g) => ["COMPLETED", "FORFEITED", "DECLINED", "EXPIRED"].includes(g.status))
    .slice(0, 10)

  const hasAny = pending.length > 0 || active.length > 0 || completed.length > 0

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gauntlets</h1>
            <p className="text-slate-500">Challenge athletes to 1v1 competitions</p>
          </div>
          <Link href="/gauntlets/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Throw Gauntlet
            </Button>
          </Link>
        </div>

        {hasAny ? (
          <div className="space-y-8">
            {/* Pending (needs response) */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-amber-500">&#9203;</span>
                  Awaiting Response ({pending.length})
                </h2>
                <GauntletsList gauntlets={pending} currentUserId={userId} />
              </section>
            )}

            {/* Active */}
            {active.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-violet-500">&#9876;</span>
                  Active ({active.length})
                </h2>
                <GauntletsList gauntlets={active} currentUserId={userId} />
              </section>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-emerald-500">&#10003;</span>
                  Recent Results
                </h2>
                <GauntletsList gauntlets={completed} currentUserId={userId} />
              </section>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Swords className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Gauntlets Yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Challenge someone to a gauntlet and start competing! Power up by logging
              activities during the competition period.
            </p>
            <Link href="/gauntlets/new">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
                Throw Your First Gauntlet
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
