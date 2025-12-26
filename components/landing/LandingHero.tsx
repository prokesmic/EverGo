"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Zap, TrendingUp, Users, Activity, Flame, Target } from "lucide-react"
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
      const x = (e.clientX - centerX) / 40
      const y = (e.clientY - centerY) / 40
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-slate-50">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-slate-200/50 to-transparent" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative px-4 md:px-6 py-20 pt-32 lg:pt-40 pb-20 mx-auto max-w-7xl">
        <div className="text-center max-w-5xl mx-auto">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/60 border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Live in 150+ Countries
          </div>

          {/* Main Headline - AGGRESSIVE */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-slate-900 tracking-tighter mb-6 leading-[0.85]">
            TRACK. BATTLE.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              DOMINATE.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed">
            The first social network designed for{" "}
            <span className="text-slate-900 font-semibold">competitive friction</span>.
            Join teams, find rivals, and turn your data into adrenaline.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-10 py-7 h-auto rounded-full text-white font-bold text-lg bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all transform hover:scale-[1.02]"
            >
              <Link href="/register" className="flex items-center gap-2">
                Start Your Streak <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-10 py-7 h-auto rounded-full font-bold text-lg border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
            >
              <Link href="/leaderboard" className="flex items-center gap-2">
                View Leaderboards
              </Link>
            </Button>
          </div>

          {/* APP PREVIEW - The "Proof" Dashboard */}
          <div
            ref={mockupRef}
            className="relative mx-auto w-full max-w-4xl"
            style={{
              transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          >
            {/* Glow behind */}
            <div className="absolute -inset-8 bg-orange-500/20 blur-3xl rounded-full opacity-50 -z-10" />

            {/* Main Dashboard Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-3 md:p-4">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 flex-1 px-4 py-1.5 rounded-full bg-slate-100 text-xs font-mono text-slate-400 text-center">
                  app.evergo.com/dashboard
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-slate-50 rounded-2xl p-4 md:p-6">
                {/* Top Stats Row */}
                <div className="grid grid-cols-4 gap-3 md:gap-4 mb-4">
                  <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-100 text-center">
                    <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mx-auto mb-1" />
                    <div className="text-xl md:text-2xl font-bold text-slate-900">14</div>
                    <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Day Streak</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-100 text-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-xl md:text-2xl font-bold text-slate-900">#12</div>
                    <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">City Rank</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-100 text-center">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-xl md:text-2xl font-bold text-slate-900">3</div>
                    <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Rivals</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-100 text-center">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 mx-auto mb-1" />
                    <div className="text-xl md:text-2xl font-bold text-slate-900">328</div>
                    <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Network</div>
                  </div>
                </div>

                {/* Main Highlight Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 md:p-6 text-white mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-slate-400 font-medium mb-1">Weekly Distance</div>
                      <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        142.5 <span className="text-xl text-slate-400 font-medium">km</span>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                      ▲ 12% vs last week
                    </div>
                  </div>
                  {/* Mini Graph */}
                  <div className="flex items-end gap-1 h-12">
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
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        MK
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Active Rivalry</div>
                        <div className="text-sm text-slate-500">vs. Marcus K.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-500">12km behind</div>
                      <div className="text-xs text-slate-400">4 days left</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Notification */}
            <div
              className="absolute -right-4 md:-right-8 bottom-16 md:bottom-24 bg-white border border-slate-200 p-3 md:p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce z-20"
              style={{ animationDuration: "4s" }}
            >
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Rank Up!</p>
                <p className="text-xs text-slate-500">#15 → #12 in Prague</p>
              </div>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900">50K+</div>
              <div className="text-sm text-slate-500 font-medium">Active Athletes</div>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden md:block" />
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900">2.4M</div>
              <div className="text-sm text-slate-500 font-medium">Activities Logged</div>
            </div>
            <div className="h-12 w-px bg-slate-200 hidden md:block" />
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900">150+</div>
              <div className="text-sm text-slate-500 font-medium">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
