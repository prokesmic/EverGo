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
          isEvergo ? "bg-green-100" : "bg-green-50"
        )}>
          <Check className={cn("w-5 h-5", isEvergo ? "text-green-600" : "text-green-500")} />
        </div>
        {data.note && (
          <span className={cn(
            "text-xs font-medium",
            isEvergo ? "text-green-600" : "text-gray-500"
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
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center">
        <Minus className="w-5 h-5 text-yellow-500" />
      </div>
      {data.note && (
        <span className="text-xs text-gray-500">{data.note}</span>
      )}
    </div>
  )
}

export function LandingComparison() {
  return (
    <section className="w-full py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full text-yellow-800 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>See the difference</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why athletes choose EverGo
          </h2>
          <p className="text-lg text-gray-600">
            We combine the best features from all platforms, plus unique innovations you won&apos;t find anywhere else
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
              <div className="font-semibold text-gray-500 text-sm uppercase tracking-wide">
                Feature
              </div>
              {competitors.map((comp) => (
                <div
                  key={comp.name}
                  className={cn(
                    "text-center",
                    comp.highlight && "relative"
                  )}
                >
                  {comp.highlight && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-blue text-white text-[10px] font-semibold rounded-full whitespace-nowrap">
                      BEST CHOICE
                    </div>
                  )}
                  <div className={cn(
                    "flex flex-col items-center gap-1",
                    comp.highlight && "pt-2"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold",
                      comp.highlight
                        ? "bg-gradient-to-br from-brand-blue to-brand-green text-white"
                        : "bg-gray-200 text-gray-600"
                    )}>
                      {comp.logo}
                    </div>
                    <span className={cn(
                      "font-semibold",
                      comp.highlight ? "text-brand-blue" : "text-gray-700"
                    )}>
                      {comp.name}
                    </span>
                    <span className="text-xs text-gray-500">{comp.tagline}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Rows */}
            {comparison.map((category, categoryIndex) => (
              <div key={category.category}>
                {/* Category Header */}
                <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">
                    {category.category}
                  </span>
                </div>

                {/* Features */}
                {category.features.map((feature, featureIndex) => (
                  <div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-4 gap-4 px-6 py-4 items-center",
                      featureIndex < category.features.length - 1 && "border-b border-gray-100",
                      categoryIndex === comparison.length - 1 &&
                        featureIndex === category.features.length - 1 &&
                        "border-b-0"
                    )}
                  >
                    <div>
                      <span className="font-medium text-gray-900">{feature.name}</span>
                      {feature.tooltip && (
                        <p className="text-xs text-gray-500 mt-0.5">{feature.tooltip}</p>
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
            <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-brand-blue/5 to-brand-green/5 border-t border-gray-200">
              <div />
              <div className="flex justify-center">
                <Button asChild className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                  <Link href="/register" className="flex items-center gap-2">
                    Start Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center">
                <span className="text-sm text-gray-500">$11.99/mo</span>
              </div>
              <div className="flex justify-center">
                <span className="text-sm text-gray-500">Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 italic">
            * Comparison based on free tiers as of December 2025
          </p>
        </div>
      </div>
    </section>
  )
}
