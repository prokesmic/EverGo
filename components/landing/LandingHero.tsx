"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Zap, TrendingUp, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function LandingHero() {
  const mockupRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Parallax 3D effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!mockupRef.current) return
      const rect = mockupRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const x = (e.clientX - centerX) / 25
      const y = (e.clientY - centerY) / 25
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden">
      <div className="container relative px-4 md:px-6 py-20 pt-32 lg:pt-48 pb-20 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column - Content */}
          <div className="flex-1 flex flex-col space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-cyan-400 w-fit mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              Now available in 150+ countries
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
                Track any sport.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                  Compete globally.
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The multi-sport social network where athletes track activities, climb rankings, and connect with training partners worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 py-6 h-auto rounded-full text-white font-bold text-lg bg-gradient-to-r from-emerald-500 to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/40 transition-all transform hover:scale-[1.02]"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 h-auto rounded-full font-bold text-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Link href="#demo" className="flex items-center gap-2">
                  <Play className="w-4 h-4" fill="currentColor" /> Watch Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                      alt="User"
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-white font-bold">50K+ athletes</p>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-slate-500 font-normal">from 12K+ reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative group hidden lg:block">
            {/* Glow behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-cyan-500/20 rounded-full blur-[100px] -z-10 group-hover:bg-cyan-500/30 transition-all duration-700" />

            {/* Main Glass Card */}
            <div
              ref={mockupRef}
              className="relative bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
              style={{
                transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-6 opacity-50">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 px-3 py-1 rounded-full bg-black/20 text-[10px] font-mono text-slate-400">
                  evergo.app/home
                </div>
              </div>

              {/* Main Stat Card */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-white/20 mb-4 animate-pulse" />
                    <div className="h-4 w-24 bg-white/20 rounded mb-2" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-3xl font-bold">142.5 km</h3>
                    <p className="text-emerald-100 text-sm">this week</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                  <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">14</div>
                  <div className="text-xs text-slate-400">Streak</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 relative">
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                  <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">#12</div>
                  <div className="text-xs text-slate-400">Rank</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">328</div>
                  <div className="text-xs text-slate-400">Following</div>
                </div>
              </div>

              {/* Floating Notification */}
              <div
                className="absolute -right-4 bottom-8 bg-[#1e293b] border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rank Up!</p>
                  <p className="text-[10px] text-slate-400">You are now #12 in Prague</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />
    </section>
  )
}
