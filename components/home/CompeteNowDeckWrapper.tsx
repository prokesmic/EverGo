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

        // TODO: Also fetch challenges and team battles when those APIs exist
        // const challengesRes = await fetch("/api/challenges/active")
        // const teamBattlesRes = await fetch("/api/teams/battles/active")

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
