"use client"

import { useState } from "react"
import { MySport, MySportsData } from "@/lib/mySports"
import { SportItem } from "@/lib/sports"
import { MySportsManager } from "@/components/settings/MySportsManager"
import { PersonalBestsManager } from "@/components/settings/PersonalBestsManager"
import { BenchmarkMeasurementType } from "@prisma/client"
import { Dumbbell, Trophy, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type UserPb = {
  benchmarkId: string
  value: number
  achievedAt: Date
  source: string
  verificationStatus: string
  isLegacy: boolean
}

type BenchmarkWithPb = {
  id: string
  sportId: string
  slug: string
  name: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
  rankWeight: number
  validityMonths: number
  decayAfterMonths: number
  userPb: UserPb | null
}

type SportBenchmarkGroup = {
  sport: {
    id: string
    name: string
    slug: string
    icon: string | null
  }
  isPrimary: boolean
  priority: number | null
  primaryBenchmarks: BenchmarkWithPb[]
  secondaryBenchmarks: BenchmarkWithPb[]
}

interface BenchmarkDef {
  id: string
  sportId: string
  slug: string
  name: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
}

interface UserBest {
  benchmarkId: string
  value: number
  achievedAt: Date
}

interface SportsPageClientProps {
  mySportsData: MySportsData
  allSports: SportItem[]
  sportsBenchmarks: SportBenchmarkGroup[]
  benchmarkDefinitions: BenchmarkDef[]
  userBenchmarkBests: UserBest[]
  isPro: boolean
}

type Tab = "sports" | "pbs"

export function SportsPageClient({
  mySportsData,
  allSports,
  sportsBenchmarks,
  benchmarkDefinitions,
  userBenchmarkBests,
  isPro,
}: SportsPageClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("sports")

  const tabs = [
    {
      id: "sports" as const,
      label: "My Sports",
      icon: Dumbbell,
      description: "Manage active sports",
    },
    {
      id: "pbs" as const,
      label: "Personal Bests",
      icon: Trophy,
      description: "Track your records",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        {activeTab === "sports" && (
          <div>
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Manage Your Sports</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Add, reorder, and customize your sports. Drag to set priority.
                  </p>
                </div>
                {!isPro && (
                  <Link
                    href="/settings/subscription"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    Upgrade to Pro
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
            <div className="p-6">
              <MySportsManager
                initialData={mySportsData}
                allSports={allSports}
                isPro={isPro}
                benchmarkDefinitions={benchmarkDefinitions}
                userBenchmarkBests={userBenchmarkBests}
              />
            </div>
          </div>
        )}

        {activeTab === "pbs" && (
          <div>
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
              <h2 className="text-xl font-bold text-slate-900">Personal Bests</h2>
              <p className="text-sm text-slate-500 mt-1">
                Track your achievements and personal records across all your sports.
              </p>
            </div>
            <div className="p-6">
              {sportsBenchmarks.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">
                    Add sports first to start tracking your personal bests.
                  </p>
                  <button
                    onClick={() => setActiveTab("sports")}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <Dumbbell className="w-4 h-4 mr-2" />
                    Add Sports
                  </button>
                </div>
              ) : (
                <PersonalBestsManager initialData={sportsBenchmarks} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pro Banner for Free Users */}
      {!isPro && (
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-[1px]">
          <div className="rounded-2xl bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-orange-900/90 backdrop-blur-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Unlock Your Full Potential</h3>
                <p className="text-sm text-purple-200 mt-1">
                  Upgrade to Pro for unlimited sports, advanced analytics, and more.
                </p>
              </div>
              <Link
                href="/settings/subscription"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-purple-700 hover:bg-purple-50 transition-colors shadow-lg"
              >
                Upgrade to Pro
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
