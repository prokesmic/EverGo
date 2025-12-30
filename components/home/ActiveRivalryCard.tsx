"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Clock, Swords, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

function formatEnds(endsAt?: string | null) {
  if (!endsAt) return null
  const end = new Date(endsAt).getTime()
  const now = Date.now()
  const diff = Math.max(0, end - now)
  const hrs = Math.floor(diff / 36e5)
  const days = Math.floor(hrs / 24)
  if (days >= 1) return `Ends in ${days}d`
  return `Ends in ${hrs}h`
}

interface ActiveRivalryCardProps {
  id: string
  opponentName: string
  opponentAvatarUrl?: string | null
  sportLabel?: string | null
  delta?: number | null // positive means you lead
  status?: "WINNING" | "LOSING" | "TIED" | "UNKNOWN"
  endsAt?: string | null
  href?: string
  onLogForRivalry?: () => void
}

export function ActiveRivalryCard({
  id,
  opponentName,
  opponentAvatarUrl,
  sportLabel,
  delta,
  status = "UNKNOWN",
  endsAt,
  onLogForRivalry,
  href = "/rivalries",
}: ActiveRivalryCardProps) {
  const ends = formatEnds(endsAt)
  const lead =
    typeof delta === "number"
      ? delta === 0
        ? "Tied"
        : delta > 0
          ? `You're +${delta}`
          : `You're ${delta}`
      : "Score updating"

  const stateTone =
    status === "WINNING"
      ? "bg-emerald-500/12 border-emerald-400/20"
      : status === "LOSING"
        ? "bg-rose-500/12 border-rose-400/20"
        : "bg-slate-500/10 border-slate-400/15"

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800",
        "px-4 py-3 shadow-lg"
      )}
      data-testid="home-rivalry-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-white/10 overflow-hidden shrink-0">
            {opponentAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={opponentAvatarUrl}
                alt={opponentName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white/70 font-semibold">
                {opponentName?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 min-w-0">
                <Swords className="h-4 w-4 text-orange-400" />
                <div className="truncate text-sm font-semibold text-white">
                  vs {opponentName}
                </div>
              </div>
              {sportLabel ? (
                <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-xs text-white/75">
                  {sportLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium text-white",
                  stateTone
                )}
              >
                {lead}
              </span>

              {ends ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/6 px-2 py-0.5 text-xs text-white/70">
                  <Clock className="h-3 w-3" />
                  {ends}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <Link
          href={`${href}/${id}`}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/6 px-2.5 py-1.5 text-xs font-medium text-white/85 hover:bg-white/10 transition"
          data-testid="home-rivalry-view"
        >
          Details
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
        <div className="text-xs text-white/60">Log activity to move your rank.</div>

        <button
          type="button"
          onClick={onLogForRivalry}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 text-white px-3 py-1.5 text-sm font-semibold hover:bg-orange-600 transition shadow-md shadow-orange-500/20"
          data-testid="home-rivalry-log"
        >
          <Activity className="h-3.5 w-3.5" />
          Log
        </button>
      </div>
    </div>
  )
}
