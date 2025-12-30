"use client"

import { Target, Users, TrendingUp, Zap, BarChart3 } from "lucide-react"
import { RivalriesWidgetCompact } from "./RivalriesWidgetCompact"

export function LandingFeatures() {
  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 bg-white border-t border-slate-200" data-testid="landing-features">
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 sm:mb-12 text-center">
          <h2 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900 tracking-[-0.01em] mb-3">
            Not Just Another Tracker.
          </h2>
          <p className="text-lg text-slate-600">We don&apos;t just log miles. We rank them.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto">
          {/* Feature 1: Active Rivalries (Large - spans 2 columns, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-100 relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-xl transition-all">
            <div className="relative z-10 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-1.5">Active Rivalries</h3>
              <p className="text-slate-600 text-sm max-w-md">
                The algorithm finds athletes exactly 1% faster than you. Beat them to level up.
              </p>
            </div>

            {/* Rivalries Widget */}
            <div className="relative z-10">
              <RivalriesWidgetCompact />
            </div>
          </div>

          {/* Feature 2: Squad Battles (Dark) */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-xl transition-all">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Squad Battles</h3>
              <p className="text-slate-400 text-sm mb-4">Team vs Team. Weekly wars.</p>

              {/* Team Battle Visual */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold">A</div>
                  <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: "65%" }} />
                  </div>
                  <span className="text-sm font-bold">1,247 km</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold">B</div>
                  <div className="flex-1 h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: "58%" }} />
                  </div>
                  <span className="text-sm font-bold">1,089 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Sport Index (Orange) */}
          <div className="bg-orange-500 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden group hover:-translate-y-0.5 hover:shadow-xl transition-all">
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Sport Index</h3>
              <p className="text-orange-100 text-sm mb-3">Your universal performance score.</p>

              {/* Score Display */}
              <div className="text-center">
                <div className="text-5xl font-bold tracking-tight">847</div>
                <div className="text-orange-200 text-sm font-medium">+24 this week</div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Feature 4: Global Rankings (Wide - spans 2 columns) */}
          <div className="md:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-md group hover:-translate-y-0.5 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1.5">Real Rankings</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Compete at every level - from your local club to the global stage.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Club", "City", "Country", "Global"].map((level, i) => (
                    <span
                      key={level}
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        i === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>

              {/* Podium */}
              <div className="flex items-end gap-4 justify-center">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-lg mb-2 mx-auto">
                    2
                  </div>
                  <div className="bg-slate-100 rounded-t-lg w-16 h-16 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600">Sarah K.</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl mb-2 mx-auto shadow-lg shadow-amber-500/30">
                    1
                  </div>
                  <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-t-lg w-20 h-24 flex items-center justify-center border border-amber-200">
                    <span className="text-sm font-bold text-amber-700">Mike R.</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white font-bold mb-2 mx-auto">
                    3
                  </div>
                  <div className="bg-orange-50 rounded-t-lg w-14 h-12 flex items-center justify-center border border-orange-100">
                    <span className="text-xs font-bold text-orange-600">You</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Auto Sync */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md group hover:-translate-y-0.5 hover:shadow-xl transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Auto Sync</h3>
            <p className="text-slate-500 text-sm mb-4">
              Import from Garmin, Strava, Apple Health instantly.
            </p>

            {/* Device logos */}
            <div className="flex items-center gap-2">
              {["Garmin", "Strava", "Apple"].map((brand) => (
                <div
                  key={brand}
                  className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500"
                >
                  {brand[0]}
                </div>
              ))}
              <span className="text-slate-400 text-xs">+12 more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
