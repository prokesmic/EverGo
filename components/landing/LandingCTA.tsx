"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden">
      {/* Background image with overlay - finish line / achievement theme */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1199590/pexels-photo-1199590.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Athletes celebrating"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#020617]/90 to-[#020617]" />
      </div>

      {/* Gradient glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container relative px-4 md:px-6 mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-emerald-400 text-sm font-medium border border-white/10">
            <Sparkles className="w-4 h-4" />
            Limited time: Get 3 months Pro for free
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50">
            Ready to level up
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              your fitness journey?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join 50,000+ athletes who are tracking, competing, and improving with EverGo
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 text-lg px-10 py-7 h-auto font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all hover:scale-[1.02]"
            >
              <Link href="/register" className="flex items-center gap-2">
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-slate-700 text-slate-50 hover:bg-white/5 hover:border-slate-600 text-lg px-10 py-7 h-auto"
            >
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
