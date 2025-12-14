"use client"

import { Check, X, Minus, Trophy, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const competitors = [
  {
    name: "EverGo",
    tagline: "You are here",
    highlight: true,
    logo: "⚡",
  },
  {
    name: "Strava",
    tagline: "Popular choice",
    highlight: false,
    logo: "S",
  },
  {
    name: "Nike Run Club",
    tagline: "Running focused",
    highlight: false,
    logo: "N",
  },
]

type ComparisonFeature = {
  name: string
  tooltip?: string
  evergo: { value: boolean | string; note?: string }
  strava: { value: boolean | string; note?: string }
  nike: { value: boolean | string; note?: string }
}

type ComparisonCategory = {
  category: string
  features: ComparisonFeature[]
}

const comparison: ComparisonCategory[] = [
  {
    category: "Sports & Tracking",
    features: [
      {
        name: "Multi-sport support",
        tooltip: "Track running, cycling, swimming, tennis, golf, and 20+ more sports",
        evergo: { value: true, note: "25+ sports" },
        strava: { value: "partial", note: "Limited" },
        nike: { value: false, note: "Running only" },
      },
      {
        name: "GPS activity tracking",
        evergo: { value: true },
        strava: { value: true },
        nike: { value: true },
      },
      {
        name: "Device integrations",
        evergo: { value: true, note: "15+ devices" },
        strava: { value: true, note: "Many" },
        nike: { value: "partial", note: "Apple only" },
      },
    ],
  },
  {
    category: "Competition & Rankings",
    features: [
      {
        name: "Global rankings",
        tooltip: "See your rank among all athletes worldwide",
        evergo: { value: true, note: "All levels" },
        strava: { value: "partial", note: "Segments only" },
        nike: { value: false },
      },
      {
        name: "City/local rankings",
        tooltip: "Compete with athletes in your city",
        evergo: { value: true },
        strava: { value: false },
        nike: { value: false },
      },
      {
        name: "Club rankings",
        evergo: { value: true },
        strava: { value: "partial", note: "Clubs only" },
        nike: { value: false },
      },
      {
        name: "Challenges with prizes",
        evergo: { value: true, note: "Sponsored" },
        strava: { value: true },
        nike: { value: "partial" },
      },
    ],
  },
  {
    category: "Social Features",
    features: [
      {
        name: "Training partner finder",
        tooltip: "Match with athletes who share your pace and goals",
        evergo: { value: true, note: "Smart matching" },
        strava: { value: false },
        nike: { value: false },
      },
      {
        name: "Team challenges",
        evergo: { value: true },
        strava: { value: "partial", note: "Clubs" },
        nike: { value: "partial" },
      },
      {
        name: "Social feed",
        evergo: { value: true },
        strava: { value: true },
        nike: { value: false },
      },
    ],
  },
  {
    category: "Pricing",
    features: [
      {
        name: "Free tier features",
        evergo: { value: true, note: "Full access" },
        strava: { value: "partial", note: "Limited" },
        nike: { value: true, note: "Full" },
      },
      {
        name: "No paywalled rankings",
        evergo: { value: true },
        strava: { value: false },
        nike: { value: true },
      },
    ],
  },
]

function ComparisonValue({ data, isEvergo = false }: { data: { value: boolean | string; note?: string }; isEvergo?: boolean }) {
  if (data.value === true) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isEvergo ? "bg-emerald-500/30" : "bg-emerald-500/20"
        )}>
          <Check className={cn("w-5 h-5", isEvergo ? "text-emerald-400" : "text-emerald-500")} />
        </div>
        {data.note && (
          <span className={cn(
            "text-xs font-medium",
            isEvergo ? "text-emerald-400" : "text-slate-400"
          )}>
            {data.note}
          </span>
        )}
      </div>
    )
  }

  if (data.value === false) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
          <X className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Minus className="w-5 h-5 text-amber-400" />
      </div>
      {data.note && (
        <span className="text-xs text-slate-500">{data.note}</span>
      )}
    </div>
  )
}

export function LandingComparison() {
  return (
    <section className="w-full py-20 md:py-28 bg-[#020617]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4 border border-amber-500/30">
            <Trophy className="w-4 h-4" />
            <span>See the difference</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-50 mb-4">
            Why athletes choose EverGo
          </h2>
          <p className="text-lg text-slate-400">
            We combine the best features from all platforms, plus unique innovations you won&apos;t find anywhere else
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <div className="backdrop-blur-md bg-slate-900/40 rounded-3xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-[#0f172a]/60 border-b border-slate-800">
              <div className="font-semibold text-slate-500 text-sm uppercase tracking-wide">
                Feature
              </div>
              {competitors.map((comp) => (
                <div
                  key={comp.name}
                  className={cn(
                    "text-center relative",
                    comp.highlight && "relative"
                  )}
                >
                  {comp.highlight && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 text-[10px] font-bold rounded-full whitespace-nowrap">
                      BEST CHOICE
                    </div>
                  )}
                  <div className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl",
                    comp.highlight && "bg-cyan-400/10 backdrop-blur-sm border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                      comp.highlight
                        ? "bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950"
                        : "bg-slate-700 text-slate-400"
                    )}>
                      {comp.logo}
                    </div>
                    <span className={cn(
                      "font-semibold",
                      comp.highlight ? "text-white" : "text-slate-400"
                    )}>
                      {comp.name}
                    </span>
                    <span className="text-xs text-slate-500">{comp.tagline}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            {comparison.map((category, categoryIndex) => (
              <div key={category.category}>
                {/* Category Header */}
                <div className="px-6 py-3 bg-[#0f172a]/40 border-b border-slate-800">
                  <span className="text-sm font-semibold text-slate-300">
                    {category.category}
                  </span>
                </div>

                {/* Features */}
                {category.features.map((feature, featureIndex) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-4 gap-4 px-6 py-4 items-center",
                      featureIndex < category.features.length - 1 && "border-b border-slate-800",
                      categoryIndex === comparison.length - 1 &&
                        featureIndex === category.features.length - 1 &&
                        "border-b-0"
                    )}
                  >
                    <div>
                      <span className="font-medium text-white">{feature.name}</span>
                      {feature.tooltip && (
                        <p className="text-xs text-slate-500 mt-0.5">{feature.tooltip}</p>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <ComparisonValue data={feature.evergo} isEvergo />
                    </div>
                    <div className="flex justify-center">
                      <ComparisonValue data={feature.strava} />
                    </div>
                    <div className="flex justify-center">
                      <ComparisonValue data={feature.nike} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* CTA Row */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-t border-slate-800">
              <div />
              <div className="flex justify-center">
                <Button asChild className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold hover:opacity-90 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">
                  <Link href="/register" className="flex items-center gap-2">
                    Start Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-sm text-slate-500">$11.99/mo</span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-sm text-slate-500">Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 italic">
            * Comparison based on free tiers as of December 2025
          </p>
        </div>
      </div>
    </section>
  )
}
