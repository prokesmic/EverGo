"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Zap, TrendingUp, Users, Activity } from "lucide-react"
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
      const x = (e.clientX - centerX) / 30
      const y = (e.clientY - centerY) / 30
      setMousePosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden hero-gradient">
      <div className="container relative px-4 md:px-6 py-20 pt-32 lg:pt-48 pb-20 mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column - Content */}
          <div className="flex-1 flex flex-col space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm text-xs font-bold uppercase tracking-wider text-slate-600 w-fit mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Now available in 150+ countries
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                Track any sport.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400">
                  Compete globally.
                </span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The multi-sport social network where athletes track activities, climb rankings, and connect with training partners worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-8 py-6 h-auto rounded-full text-white font-bold text-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02]"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 h-auto rounded-full font-bold text-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
              >
                <Link href="#demo" className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-slate-600" /> Watch Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 shadow-sm overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 45}`}
                      alt="User"
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-slate-900 font-bold">50K+ athletes</p>
                <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                  <span className="text-amber-400">★★★★★</span>
                  <span className="text-slate-400 font-normal">from 12K+ reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative group hidden lg:block">
            {/* Soft Glow behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-sky-100 via-indigo-100 to-emerald-100 rounded-full blur-[80px] -z-10 opacity-70" />

            {/* Main Glass Card (Aurora Theme) */}
            <div
              ref={mockupRef}
              className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-transform duration-500 hover:scale-[1.02]"
              style={{
                transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Browser Header */}
              <div className="flex items-center gap-2 mb-6 opacity-30">
                <div className="w-3 h-3 rounded-full bg-slate-900" />
                <div className="w-3 h-3 rounded-full bg-slate-900" />
                <div className="w-3 h-3 rounded-full bg-slate-900" />
                <div className="ml-4 px-3 py-1 rounded-full bg-slate-100 text-[10px] font-mono text-slate-400 font-bold">
                  evergo.app
                </div>
              </div>

              {/* Highlight Stat Card */}
              <div className="bg-gradient-to-r from-indigo-600 to-sky-500 rounded-2xl p-6 mb-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group-hover:shadow-2xl transition-all">
                <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex justify-between items-start relative z-10">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Activity className="text-white w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <h3 className="text-4xl font-bold tracking-tight">
                      142.5 <span className="text-lg text-white/70 font-medium">km</span>
                    </h3>
                    <p className="text-emerald-300 text-sm font-bold mt-1">▲ 12% vs last week</p>
                  </div>
                </div>

                {/* Mini Graph Line */}
                <div className="mt-6 flex items-end gap-1 h-8 opacity-60">
                  {[40, 70, 45, 90, 60, 80, 50, 95].map((h, i) => (
                    <div key={i} className="w-full bg-white rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <Zap className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-900">14</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Streak</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-50 rounded-bl-2xl" />
                  <TrendingUp className="w-6 h-6 text-indigo-600 mx-auto mb-2 relative z-10" />
                  <div className="text-xl font-bold text-slate-900 relative z-10">#12</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider relative z-10">Rank</div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl font-bold text-slate-900">328</div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Friends</div>
                </div>
              </div>

              {/* Floating Notification */}
              <div
                className="absolute -right-8 bottom-12 bg-white border border-slate-200 p-4 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] flex items-center gap-4 animate-bounce z-20"
                style={{ animationDuration: '4s' }}
              >
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">New Record!</p>
                  <p className="text-xs text-slate-500 font-medium">10k run in 48:20</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
