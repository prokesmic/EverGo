"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Zap, Check, Trophy } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="w-full py-24 relative overflow-hidden bg-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container relative px-4 md:px-6 mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full text-orange-400 text-sm font-bold border border-orange-500/20">
            <Trophy className="w-4 h-4" />
            Join the arena
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Stop tracking.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              Start winning.
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every day you wait, your rivals get stronger. Jump in now and claim your rank.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-12 py-7 h-auto font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:scale-[1.02] rounded-full"
            >
              <Link href="/register" className="flex items-center gap-2">
                Claim Your Rank <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 text-lg px-12 py-7 h-auto font-bold rounded-full"
            >
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>Sync in 60 seconds</span>
            </div>
          </div>

          {/* Live Activity Indicator */}
          <div className="pt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-slate-400">
                <span className="text-white font-bold">847</span> athletes battling right now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
