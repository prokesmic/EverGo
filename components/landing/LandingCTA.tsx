"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="w-full py-20 md:py-28 relative overflow-hidden hero-gradient">
      {/* Gradient glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-sky-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px]" />
      </div>

      <div className="container relative px-4 md:px-6 mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-indigo-600 text-sm font-medium border border-indigo-100 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Limited time: Get 3 months Pro for free
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900">
            Ready to level up
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400">
              your fitness journey?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join 50,000+ athletes who are tracking, competing, and improving with EverGo
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 text-white text-lg px-10 py-7 h-auto font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]"
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
              className="bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200 text-lg px-10 py-7 h-auto shadow-sm"
            >
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
