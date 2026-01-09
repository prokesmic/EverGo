"use client"

/**
 * V6 Active Competitions Section
 *
 * Shows active gauntlets and crew wars in a compact format
 */

import { GauntletCard } from "@/components/gauntlet/GauntletCard"
import { CrewWarCard } from "@/components/crew-wars/CrewWarCard"
import { Button } from "@/components/ui/button"
import { Swords, Plus } from "lucide-react"
import Link from "next/link"

interface ActiveCompetitionsProps {
  gauntlets: any[]
  crewWar: any | null
  teamId: string | undefined
  userId: string
}

export function ActiveCompetitions({
  gauntlets,
  crewWar,
  teamId,
  userId,
}: ActiveCompetitionsProps) {
  const hasCompetitions = gauntlets.length > 0 || crewWar

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Active Competitions
        </h2>
        <Link href="/gauntlets/new">
          <Button size="sm" variant="outline" className="gap-1">
            <Swords className="w-4 h-4" />
            Throw Gauntlet
          </Button>
        </Link>
      </div>

      {hasCompetitions ? (
        <div className="space-y-4">
          {/* Gauntlets */}
          {gauntlets.slice(0, 2).map((gauntlet) => (
            <GauntletCard
              key={gauntlet.id}
              gauntlet={gauntlet}
              currentUserId={userId}
            />
          ))}

          {/* Show "more" link if there are more gauntlets */}
          {gauntlets.length > 2 && (
            <Link
              href="/gauntlets"
              className="block text-sm text-center text-slate-500 hover:text-slate-700"
            >
              View {gauntlets.length - 2} more gauntlets
            </Link>
          )}

          {/* Crew War */}
          {crewWar && (
            <CrewWarCard crewWar={crewWar} currentTeamId={teamId} />
          )}
        </div>
      ) : (
        <EmptyCompetitions />
      )}
    </section>
  )
}

function EmptyCompetitions() {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <Swords className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="font-medium text-slate-900 mb-1">No Active Competitions</h3>
      <p className="text-sm text-slate-500 mb-4">
        Challenge someone to a gauntlet and start competing!
      </p>
      <Link href="/gauntlets/new">
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          Find an Opponent
        </Button>
      </Link>
    </div>
  )
}
