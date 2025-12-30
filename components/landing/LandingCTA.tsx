"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Zap, Check, Trophy } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 relative overflow-hidden bg-slate-900" data-testid="landing-cta">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-red-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" aria-hidden />

      <div className="container relative px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full text-orange-400 text-xs font-bold border border-orange-500/20">
            <Trophy className="w-3.5 h-3.5" />
            Join the arena
          </div>

          {/* Heading */}
          <h2 className="text-[clamp(28px,5vw,48px)] font-bold text-white tracking-[-0.01em]">
            Stop tracking.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              Start winning.
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
            Every day you wait, your rivals get stronger. Jump in now and claim your rank.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              asChild
              className="h-11 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[15px] shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 transition-all"
            >
              <Link href="/register" className="flex items-center gap-2">
                Claim Your Rank <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-xl bg-transparent border-2 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600 font-medium text-[15px]"
            >
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span>Sync in 60 seconds</span>
            </div>
          </div>

          {/* Live Activity Indicator */}
          <div className="pt-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400">
                <span className="text-white font-semibold">847</span> athletes battling right now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
