"use client"

import { useState } from "react"
import { Trophy, Globe, MapPin, Building2, ChevronUp, ChevronDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_SPORTS, type DemoScope, type DemoLeaderboardRow } from "./demoRankingsData"
import Link from "next/link"

export function RankingsShowcase() {
  const [selectedSport, setSelectedSport] = useState(DEMO_SPORTS[0].slug)
  const [selectedDiscipline, setSelectedDiscipline] = useState(DEMO_SPORTS[0].disciplines[0].id)
  const [scope, setScope] = useState<DemoScope>("global")

  const sport = DEMO_SPORTS.find((s) => s.slug === selectedSport)!
  const discipline = sport.disciplines.find((d) => d.id === selectedDiscipline) || sport.disciplines[0]

  const handleSportChange = (slug: string) => {
    setSelectedSport(slug)
    const newSport = DEMO_SPORTS.find((s) => s.slug === slug)!
    setSelectedDiscipline(newSport.disciplines[0].id)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            Live Rankings
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            See Where You Stack Up
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real rankings across disciplines with actual performance data. Compare yourself globally, nationally, or locally.
          </p>
        </div>

        {/* Rankings Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Sport Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
            {DEMO_SPORTS.map((s) => (
              <button
                key={s.slug}
                onClick={() => handleSportChange(s.slug)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                  selectedSport === s.slug
                    ? "border-brand-blue text-brand-blue bg-brand-blue/5"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Controls Row */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            {/* Discipline Selector */}
            <div className="flex gap-2 flex-wrap">
              {sport.disciplines.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDiscipline(d.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    selectedDiscipline === d.id
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Scope Toggle */}
            <div className="flex items-center gap-1 ml-auto bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setScope("global")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  scope === "global" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                )}
                title="Global"
              >
                <Globe className={cn("h-4 w-4", scope === "global" ? "text-brand-blue" : "text-gray-500")} />
              </button>
              <button
                onClick={() => setScope("country")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  scope === "country" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                )}
                title="National"
              >
                <MapPin className={cn("h-4 w-4", scope === "country" ? "text-brand-blue" : "text-gray-500")} />
              </button>
              <button
                onClick={() => setScope("city")}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  scope === "city" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                )}
                title="City"
              >
                <Building2 className={cn("h-4 w-4", scope === "city" ? "text-brand-blue" : "text-gray-500")} />
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="divide-y divide-gray-100">
            {discipline.rows.map((row) => (
              <LeaderboardRow key={row.rank} row={row} />
            ))}
          </div>

          {/* CTA */}
          <div className="p-4 bg-gradient-to-r from-brand-blue/5 to-brand-blue/10 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ready to compete?</p>
                <p className="text-xs text-gray-500">Sign up to track your performance and see your rank.</p>
              </div>
              <Link
                href="/register"
                className="px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LeaderboardRow({ row }: { row: DemoLeaderboardRow }) {
  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return "bg-yellow-400 text-white"
    if (rank === 2) return "bg-gray-300 text-white"
    if (rank === 3) return "bg-amber-600 text-white"
    return "bg-gray-100 text-gray-600"
  }

  const getDeltaDisplay = (delta?: number) => {
    if (!delta || delta === 0) {
      return <Minus className="h-3 w-3 text-gray-400" />
    }
    if (delta > 0) {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <ChevronUp className="h-3 w-3" />
          {delta}
        </span>
      )
    }
    return (
      <span className="flex items-center text-red-500 text-xs">
        <ChevronDown className="h-3 w-3" />
        {Math.abs(delta)}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      {/* Rank Badge */}
      <div
        className={cn(
          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm",
          getRankBadgeClass(row.rank)
        )}
      >
        {row.rank}
      </div>

      {/* Flag */}
      <span className="text-lg">{row.flag}</span>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
      </div>

      {/* Delta */}
      <div className="w-8 flex justify-center">{getDeltaDisplay(row.delta)}</div>

      {/* Value */}
      <div className="text-sm font-bold text-gray-900 tabular-nums">{row.value}</div>
    </div>
  )
}
