"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CompeteNowDeck } from "./CompeteNowDeck"
import type { CompeteItem } from "@/lib/home/prioritizeCompeteItems"

interface CompeteNowDeckWrapperProps {
  className?: string
}

type ActiveChallenge = {
  id: string
  title: string
  targetValue: number | null
  endDate: string | null
  sport?: { slug?: string | null } | null
  participation?: { currentValue?: number | null } | null
}

/**
 * Client-side wrapper that fetches compete items from the API
 * and renders the CompeteNowDeck component.
 */
export function CompeteNowDeckWrapper({ className }: CompeteNowDeckWrapperProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CompeteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompeteItems = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const competeItems: CompeteItem[] = []

        // Fetch active rivalries from new API
        const rivalriesRes = await fetch("/api/rivalries/active")
        if (rivalriesRes.ok) {
          const data = await rivalriesRes.json()
          if (data.items && data.items.length > 0) {
            competeItems.push(...data.items)
          }
        }

        // Fallback: fetch auto-assigned rival from rankings if no active rivalries
        if (competeItems.length === 0) {
          const rivalRes = await fetch("/api/rankings/rival")
          if (rivalRes.ok) {
            const data = await rivalRes.json()
            if (data.rival) {
              const indexDiff = data.userStats?.sportIndex
                ? data.userStats.sportIndex - data.rival.sportIndex
                : null

              competeItems.push({
                kind: "rivalry",
                id: data.rival.id,
                endsAt: null,
                opponentName: data.rival.displayName || "Rival",
                opponentAvatarUrl: data.rival.avatarUrl,
                sportSlug: null,
                delta: indexDiff,
                myScore: data.userStats?.sportIndex,
                theirScore: data.rival.sportIndex,
                status:
                  indexDiff === null
                    ? "UNKNOWN"
                    : indexDiff > 0
                      ? "WINNING"
                      : indexDiff < 0
                        ? "LOSING"
                        : "TIED",
              })
            }
          }
        }

        // Fetch active challenges and map participation progress.
        const challengesRes = await fetch("/api/challenges?status=active")
        if (challengesRes.ok) {
          const data = await challengesRes.json()
          const challenges: ActiveChallenge[] = Array.isArray(data?.challenges) ? data.challenges : []

          challenges.slice(0, 2).forEach((challenge) => {
            const targetValue =
              typeof challenge?.targetValue === "number" && challenge.targetValue > 0
                ? challenge.targetValue
                : null
            const currentValue =
              typeof challenge?.participation?.currentValue === "number"
                ? challenge.participation.currentValue
                : null
            const progress =
              targetValue !== null && currentValue !== null
                ? Math.min(1, Math.max(0, currentValue / targetValue))
                : null

            competeItems.push({
              kind: "challenge",
              id: challenge.id,
              title: challenge.title || "Challenge",
              sportSlug: challenge?.sport?.slug ?? null,
              endsAt: challenge?.endDate ?? null,
              progress,
            })
          })
        }

        // Fetch active crew battle for the user's team.
        const teamBattleRes = await fetch("/api/teams/active-battle")
        if (teamBattleRes.ok) {
          const data = await teamBattleRes.json()
          if (data?.battle) {
            const myScore =
              typeof data.battle?.teamA?.score === "number" && data.battle?.myTeamId === data.battle?.teamA?.id
                ? data.battle.teamA.score
                : typeof data.battle?.teamB?.score === "number" && data.battle?.myTeamId === data.battle?.teamB?.id
                  ? data.battle.teamB.score
                  : null
            const opponentScore =
              typeof data.battle?.teamA?.score === "number" && data.battle?.myTeamId !== data.battle?.teamA?.id
                ? data.battle.teamA.score
                : typeof data.battle?.teamB?.score === "number" && data.battle?.myTeamId !== data.battle?.teamB?.id
                  ? data.battle.teamB.score
                  : null

            const progress =
              typeof myScore === "number" && typeof opponentScore === "number" && myScore + opponentScore > 0
                ? myScore / (myScore + opponentScore)
                : null

            competeItems.push({
              kind: "teamBattle",
              id: data.battle.myTeamId || data.battle.teamA?.id,
              title: data.battle.challengeName || "Crew War",
              teamName: data.battle.myTeamName || null,
              endsAt: data.battle.endsAt || null,
              progress,
            })
          }
        }

        // If no items, add teaser
        if (competeItems.length === 0) {
          competeItems.push({ kind: "teaser", id: "teaser-start-rivalry" })
        }

        setItems(competeItems)
      } catch (error) {
        console.error("Error fetching compete items:", error)
        // Show teaser on error
        setItems([{ kind: "teaser", id: "teaser-start-rivalry" }])
      } finally {
        setLoading(false)
      }
    }

    fetchCompeteItems()
  }, [session])

  const handleLogForRivalry = (rivalryId: string) => {
    router.push(`/activity/create?rivalryId=${rivalryId}`)
  }

  if (loading) {
    return (
      <div className={className} data-testid="home-compete-now">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CompeteNowDeck
      items={items}
      onLogForRivalry={handleLogForRivalry}
      className={className}
    />
  )
}
