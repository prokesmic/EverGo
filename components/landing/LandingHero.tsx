"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play, Star, Zap, Trophy, Users } from "lucide-react"
import { useEffect, useRef } from "react"

export function LandingHero() {
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={heroRef}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-[#0066B8] to-brand-green" />

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-blue-300/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-green-300/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container relative px-4 md:px-6 py-20 md:py-32 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col space-y-8 text-center lg:text-left mx-auto lg:mx-0 max-w-2xl lg:max-w-none">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-medium w-fit mx-auto lg:mx-0 border border-white/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span>Now available in 150+ countries</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Track any sport.
                <br />
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                  Compete globally.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                The multi-sport social network where athletes track activities, climb rankings, and connect with training partners worldwide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 text-base font-semibold px-8 py-6 h-auto shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 text-base font-medium px-8 py-6 h-auto group"
              >
                <Link href="#demo" className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
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
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 border-2 border-white"
                      style={{
                        backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})`,
                        backgroundSize: 'cover',
                      }}
                    />
                  ))}
                </div>
                <div className="text-white">
                  <div className="font-semibold text-sm">50K+ athletes</div>
                  <div className="text-xs text-white/70">joined this month</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-white">
                  <div className="font-semibold text-sm">4.9 rating</div>
                  <div className="text-xs text-white/70">from 12K+ reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Mockup */}
          <div className="relative hidden lg:block">
            {/* Main App Screenshot */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 blur-3xl scale-110" />

              {/* Main mockup frame */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                {/* Browser bar */}
                <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white rounded-lg px-4 py-1 text-xs text-gray-500 border border-gray-200">
                      evergo.app/home
                    </div>
                  </div>
                </div>

                {/* App content mockup */}
                <div className="p-4 bg-gray-50">
                  {/* Profile header mockup */}
                  <div className="bg-gradient-to-r from-brand-blue to-brand-green rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white" />
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
                      { icon: Zap, label: "Streak", value: "14 days", color: "text-orange-500" },
                      { icon: Trophy, label: "Rank", value: "#12", color: "text-yellow-500" },
                      { icon: Users, label: "Following", value: "328", color: "text-blue-500" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                        <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                        <div className="font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Activity feed mockup */}
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                            <div className="h-2 bg-gray-100 rounded w-full mb-1" />
                            <div className="h-2 bg-gray-100 rounded w-3/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <div className="absolute -left-16 top-1/4 bg-white rounded-xl p-3 shadow-lg animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">New Achievement!</div>
                    <div className="text-[10px] text-gray-500">100km Club unlocked</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 bottom-1/3 bg-white rounded-xl p-3 shadow-lg animate-float animation-delay-2000">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Rank Up!</div>
                    <div className="text-[10px] text-gray-500">You&apos;re now #12 in Prague</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 md:h-24 fill-white"
          viewBox="0 0 1440 74"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 C480,74 960,74 1440,0 L1440,74 L0,74 Z" />
        </svg>
      </div>
    </section>
  )
}
