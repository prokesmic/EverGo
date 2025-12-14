"use client"

import { useEffect, useState } from "react"
import { Flame, TrendingUp, TrendingDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type RivalWidgetProps = { userId: string }

type RivalData = {
  rival: {
    id: string
    displayName: string
    avatarUrl?: string
    globalRank?: number
    sportIndex: number
    city?: string
  } | null
  delta: number
}

export function AuroraRivalWidget({ userId }: RivalWidgetProps) {
  const [data, setData] = useState<RivalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRival() {
      try {
        const res = await fetch(`/api/rankings/rival?userId=${userId}`)
        if (res.ok) {
          const rivalData = await res.json()
          setData(rivalData)
        }
      } catch (error) {
        console.error("Error fetching rival:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRival()
  }, [userId])

  if (loading) {
    return (
      <div className="eg-card p-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
        <div className="h-6 w-48 bg-slate-200 rounded" />
      </div>
    )
  }

  const rival = data?.rival
  const delta = data?.delta ?? 0

  return (
    <div className="eg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="eg-widget-title">Rival of the week</p>
          <p className="text-lg font-semibold text-slate-900">
            {rival?.displayName ?? "Finding your perfect rival..."}
          </p>
        </div>
        <div className="eg-icon-box-amber">
          <Flame className="w-5 h-5" />
        </div>
      </div>

      {rival ? (
        <>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-amber-200">
              <AvatarImage src={rival.avatarUrl} alt={rival.displayName} />
              <AvatarFallback className="bg-amber-100 text-amber-700 font-semibold">
                {rival.displayName?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                You are{" "}
                <span className="eg-number font-semibold text-slate-900">
                  {Math.abs(delta)} pts
                </span>{" "}
                {delta > 0 ? "ahead" : "behind"} in Sport Index.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Every workout can flip this!
              </p>
            </div>
            {delta > 0 ? (
              <div className="eg-trend-up">
                <TrendingUp className="w-3 h-3" />
                Leading
              </div>
            ) : (
              <div className="eg-trend-down">
                <TrendingDown className="w-3 h-3" />
                Chasing
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Global rank: #{rival.globalRank ?? "-"}</span>
            <span>Sport Index: {rival.sportIndex}</span>
            <span>City: {rival.city ?? "Unknown"}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Log a few activities and we&apos;ll pair you with someone at your level.
        </p>
      )}
    </div>
  )
}
