"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Zap, TrendingUp, Users, Flame, Target } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function LandingHero() {
  const mockupRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mockupRef.current) return
      const rect = mockupRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) / 50
      const y = (e.clientY - centerY) / 50
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      className="relative w-full min-h-[85vh] lg:min-h-screen flex items-center bg-slate-50"
      data-testid="landing-hero"
    >
      {/* Background - Decoration layer (behind content) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-gradient-to-b from-slate-200/40 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-14 lg:pb-16 mx-auto max-w-7xl">
        <div className="text-center max-w-4xl mx-auto">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/60 border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-600 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Live in 150+ Countries
          </div>

          {/* Main Headline - Smaller, stronger weight */}
          <h1 className="text-[clamp(36px,6vw,64px)] font-bold text-slate-900 tracking-[-0.02em] mb-5 leading-[1.05]">
            TRACK. BATTLE.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              DOMINATE.
            </span>
          </h1>

          {/* Subheadline - Tighter */}
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The first social network designed for{" "}
            <span className="text-slate-900 font-semibold">competitive friction</span>.
            Join teams, find rivals, and turn your data into adrenaline.
          </p>

          {/* CTA Buttons - Smaller, denser */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Button
              asChild
              className="w-full sm:w-auto h-12 px-6 rounded-xl text-white font-semibold text-[15px] bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 transition-all"
            >
              <Link href="/register" className="flex items-center gap-2">
                Start Your Streak <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-semibold text-[15px] border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
            >
              <Link href="/leaderboard" className="flex items-center gap-2">
                View Leaderboards
              </Link>
            </Button>
          </div>

          {/* APP PREVIEW - The "Proof" Dashboard */}
          <div
            ref={mockupRef}
            className="relative mx-auto w-full max-w-3xl"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* Glow behind */}
            <div className="absolute -inset-6 bg-orange-500/15 blur-3xl rounded-full opacity-50 -z-10" />

            {/* Main Dashboard Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 sm:p-3">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="ml-3 flex-1 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-mono text-slate-400 text-center">
                  app.evergo.com/dashboard
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
                {/* Top Stats Row */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3">
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-slate-100 text-center">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mx-auto mb-0.5" />
                    <div className="text-lg sm:text-xl font-bold text-slate-900">14</div>
                    <div className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">Day Streak</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-slate-100 text-center">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-0.5" />
                    <div className="text-lg sm:text-xl font-bold text-slate-900">#12</div>
                    <div className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">City Rank</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-slate-100 text-center">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mx-auto mb-0.5" />
                    <div className="text-lg sm:text-xl font-bold text-slate-900">3</div>
                    <div className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rivals</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-slate-100 text-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto mb-0.5" />
                    <div className="text-lg sm:text-xl font-bold text-slate-900">328</div>
                    <div className="text-[8px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-bold">Network</div>
                  </div>
                </div>

                {/* Main Highlight Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 sm:p-5 text-white mb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs text-slate-400 font-medium mb-0.5">Weekly Distance</div>
                      <div className="text-3xl sm:text-4xl font-bold tracking-tight">
                        142.5 <span className="text-base text-slate-400 font-medium">km</span>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                      +12% vs last week
                    </div>
                  </div>
                  {/* Mini Graph */}
                  <div className="flex items-end gap-0.5 h-10">
                    {[40, 65, 45, 80, 55, 90, 70, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Rivalry Card */}
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                        MK
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Active Rivalry</div>
                        <div className="text-xs text-slate-500">vs. Marcus K.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-500">12km behind</div>
                      <div className="text-[10px] text-slate-400">4 days left</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification - Hidden on mobile to prevent overlap */}
            <div
              className="hidden sm:flex absolute -right-2 lg:-right-6 bottom-12 lg:bottom-20 bg-white border border-slate-200 p-2.5 sm:p-3 rounded-xl shadow-xl items-center gap-2 animate-bounce z-20"
              style={{ animationDuration: "4s" }}
            >
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Rank Up!</p>
                <p className="text-[10px] text-slate-500">#15 → #12 in Prague</p>
              </div>
            </div>
          </div>

          {/* Social Proof Stats - Tighter */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">50K+</div>
              <div className="text-sm text-slate-500 font-medium">Active Athletes</div>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">2.4M</div>
              <div className="text-sm text-slate-500 font-medium">Activities Logged</div>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">150+</div>
              <div className="text-sm text-slate-500 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  )
}
