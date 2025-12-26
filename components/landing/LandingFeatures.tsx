"use client"

import { Target, Users, TrendingUp, Zap, BarChart3, Trophy } from "lucide-react"

export function LandingFeatures() {
  return (
    <section className="w-full py-24 bg-white border-t border-slate-200">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Not Just Another Tracker.
          </h2>
          <p className="text-xl text-slate-500">We don't just log miles. We rank them.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1: Active Rivalries (Large - spans 2 columns, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Active Rivalries</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                The algorithm finds athletes exactly 1% faster than you. Beat them to level up.
              </p>
            </div>

            {/* Rivalry Widget Mockup */}
            <div className="absolute bottom-0 right-0 w-full md:w-3/4 translate-y-4 translate-x-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 mr-4 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-lg">
                      You
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      #12
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: "72%" }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">142.5 km</span>
                      <span className="text-red-500 font-bold">12km behind</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                      MK
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      #11
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Weekly Challenge</span>
                  <div className="text-sm text-slate-600 mt-1">4 days remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Squad Battles (Dark) */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Squad Battles</h3>
              <p className="text-slate-400 text-sm mb-6">Team vs Team. Weekly wars.</p>

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
          <div className="bg-orange-500 rounded-3xl p-8 text-white relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sport Index</h3>
              <p className="text-orange-100 text-sm mb-4">Your universal performance score.</p>

              {/* Score Display */}
              <div className="text-center">
                <div className="text-6xl font-extrabold tracking-tight">847</div>
                <div className="text-orange-200 text-sm font-medium">+24 this week</div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Feature 4: Global Rankings (Wide - spans 2 columns) */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg group hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Real Rankings</h3>
                <p className="text-slate-500 mb-6">
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
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl group hover:-translate-y-1 hover:shadow-2xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Auto Sync</h3>
            <p className="text-slate-500 text-sm mb-6">
              Import from Garmin, Strava, Apple Health instantly.
            </p>

            {/* Device logos */}
            <div className="flex items-center gap-3">
              {["Garmin", "Strava", "Apple"].map((brand) => (
                <div
                  key={brand}
                  className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500"
                >
                  {brand[0]}
                </div>
              ))}
              <span className="text-slate-400 text-sm">+12 more</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
