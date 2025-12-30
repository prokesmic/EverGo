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
        name: "Active Rivalries",
        tooltip: "1v1 battles with athletes at your level",
        evergo: { value: true, note: "AI-matched" },
        strava: { value: false },
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
        name: "Sport Index score",
        tooltip: "Universal performance score across all sports",
        evergo: { value: true, note: "Unique" },
        strava: { value: false },
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
        name: "Squad Battles",
        tooltip: "Team vs Team weekly competitions",
        evergo: { value: true, note: "Team wars" },
        strava: { value: false },
        nike: { value: false },
      },
      {
        name: "Training partner finder",
        evergo: { value: true, note: "Smart matching" },
        strava: { value: false },
        nike: { value: false },
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
          isEvergo ? "bg-orange-100" : "bg-emerald-50"
        )}>
          <Check className={cn("w-5 h-5", isEvergo ? "text-orange-600" : "text-emerald-500")} />
        </div>
        {data.note && (
          <span className={cn(
            "text-xs font-bold",
            isEvergo ? "text-orange-600" : "text-slate-500"
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
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <X className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
        <Minus className="w-5 h-5 text-amber-500" />
      </div>
      {data.note && (
        <span className="text-xs text-slate-500">{data.note}</span>
      )}
    </div>
  )
}

export function LandingComparison() {
  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 bg-slate-50" data-testid="landing-comparison">
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full text-white text-xs font-bold mb-4">
            <Trophy className="w-3.5 h-3.5 text-orange-500" />
            <span>See the difference</span>
          </div>
          <h2 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900 tracking-[-0.01em] mb-3">
            Why Athletes Choose EverGo
          </h2>
          <p className="text-base text-slate-500">
            We built what other apps won&apos;t. Real competition. Real rankings.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-3 p-4 sm:p-5 bg-white border-b border-slate-200">
              <div className="font-semibold text-slate-900 text-xs uppercase tracking-wide">
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
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[9px] font-bold rounded-full whitespace-nowrap">
                      DOMINATE
                    </div>
                  )}
                  <div className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl",
                    comp.highlight && "bg-orange-50 border-2 border-orange-200 shadow-md shadow-orange-500/10"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold",
                      comp.highlight
                        ? "bg-gradient-to-br from-orange-500 to-red-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}>
                      {comp.logo}
                    </div>
                    <span className={cn(
                      "font-semibold text-sm",
                      comp.highlight ? "text-orange-600" : "text-slate-600"
                    )}>
                      {comp.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{comp.tagline}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            {comparison.map((category, categoryIndex) => (
              <div key={category.category}>
                {/* Category Header */}
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {category.category}
                  </span>
                </div>

                {/* Features */}
                {category.features.map((feature, featureIndex) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-4 gap-4 px-6 py-4 items-center",
                      featureIndex < category.features.length - 1 && "border-b border-slate-100",
                      categoryIndex === comparison.length - 1 &&
                        featureIndex === category.features.length - 1 &&
                        "border-b-0"
                    )}
                  >
                    <div>
                      <span className="font-medium text-slate-900">{feature.name}</span>
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
            <div className="grid grid-cols-4 gap-3 p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
              <div />
              <div className="flex justify-center">
                <Button asChild className="h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-md shadow-orange-500/20 hover:shadow-orange-500/30">
                  <Link href="/register" className="flex items-center gap-1.5">
                    Start Free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-xs text-slate-500">$11.99/mo</span>
              </div>
              <div className="flex justify-center items-center">
                <span className="text-xs text-slate-500">Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 italic">
            * Comparison based on free tiers as of December 2025
          </p>
        </div>
      </div>
    </section>
  )
}
