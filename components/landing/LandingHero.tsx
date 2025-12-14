"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Star, Zap, Trophy, Users } from "lucide-react"
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
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#020617]">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[40%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="container relative px-4 md:px-6 py-20 md:py-32 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col space-y-8 text-center lg:text-left mx-auto lg:mx-0 max-w-2xl lg:max-w-none">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-white text-sm font-medium w-fit mx-auto lg:mx-0 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Now available in 150+ countries</span>
            </div>

            {/* Main Headline with gradient */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-50 leading-[1.05]">
                Track any sport.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                  Compete globally.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The multi-sport social network where athletes track activities, climb rankings, and connect with training partners worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {/* Main CTA with gradient and scale hover */}
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 text-base font-semibold px-8 py-6 h-auto shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.05]"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              {/* Secondary CTA - Ghost with inner glow */}
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-base font-medium px-8 py-6 h-auto group"
              >
                <Link href="#demo" className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </span>
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 border-2 border-slate-950"
                      style={{
                        backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                        backgroundSize: 'cover',
                      }}
                    />
                  ))}
                </div>
                <div className="text-slate-50">
                  <div className="font-semibold text-sm">50K+ athletes</div>
                  <div className="text-xs text-slate-500">joined this month</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-slate-50">
                  <div className="font-semibold text-sm">4.9 rating</div>
                  <div className="text-xs text-slate-500">from 12K+ reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Parallax Phone Mockup */}
          <div className="relative hidden lg:block">
            <div
              ref={mockupRef}
              className="relative perspective-1000"
              style={{
                transform: `rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Glow effect behind mockup */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl scale-110 rounded-3xl" />

              {/* Main mockup frame */}
              <div className="relative backdrop-blur-md bg-slate-900/40 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                {/* Browser bar */}
                <div className="bg-[#0f172a]/60 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-slate-700 rounded-lg px-4 py-1 text-xs text-slate-400 border border-slate-600">
                      evergo.app/home
                    </div>
                  </div>
                </div>

                {/* App content mockup */}
                <div className="p-4 bg-slate-900/50">
                  {/* Profile header mockup */}
                  <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30" />
                      <div className="flex-1">
                        <div className="h-4 bg-white/40 rounded w-32 mb-2" />
                        <div className="h-3 bg-white/20 rounded w-24" />
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-2xl">142.5 km</div>
                        <div className="text-white/70 text-xs">this week</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats cards mockup */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { icon: Zap, label: "Streak", value: "14 days", color: "text-orange-400" },
                      { icon: Trophy, label: "Rank", value: "#12", color: "text-yellow-400" },
                      { icon: Users, label: "Following", value: "328", color: "text-cyan-400" },
                    ].map((stat, i) => (
                      <div key={i} className="backdrop-blur-md bg-slate-900/40 rounded-xl p-3 border border-white/10">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                        <div className="font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Activity feed mockup */}
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="backdrop-blur-md bg-slate-900/40 rounded-xl p-4 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700" />
                          <div className="flex-1">
                            <div className="h-3 bg-slate-700 rounded w-24 mb-2" />
                            <div className="h-2 bg-slate-700/50 rounded w-full mb-1" />
                            <div className="h-2 bg-slate-700/50 rounded w-3/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <div className="absolute -left-16 top-1/4 backdrop-blur-md bg-slate-900/40 rounded-xl p-3 shadow-lg border border-white/10 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">New Achievement!</div>
                    <div className="text-[10px] text-slate-400">100km Club unlocked</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-1/3 backdrop-blur-md bg-slate-900/40 rounded-xl p-3 shadow-lg border border-white/10 animate-float animation-delay-2000">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Rank Up!</div>
                    <div className="text-[10px] text-slate-400">You&apos;re now #12 in Prague</div>
                  </div>
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
