"use client"

import { Sparkles, Smartphone, Brain, Bell, Calendar, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const upcomingFeatures = [
  {
    icon: Brain,
    title: "AI Coach",
    description: "Personalized training plans powered by AI. Coming Q1 2026.",
    status: "coming-soon",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: Smartphone,
    title: "Apple Watch App",
    description: "Track workouts directly from your wrist. In development.",
    status: "in-development",
    gradient: "from-slate-700 to-slate-900",
  },
  {
    icon: Bell,
    title: "Rival Alerts",
    description: "Get notified when your rival logs an activity. Stay ahead.",
    status: "coming-soon",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Calendar,
    title: "Event Calendar",
    description: "Find and register for local races and competitions.",
    status: "in-development",
    gradient: "from-slate-600 to-slate-800",
  },
]

const statusLabels = {
  "coming-soon": { label: "Coming Soon", color: "bg-orange-500/20 text-orange-500 border border-orange-500/30" },
  "in-development": { label: "In Development", color: "bg-slate-500/20 text-slate-400 border border-slate-500/30" },
  "beta": { label: "Beta", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
}

export function LandingUpcoming() {
  return (
    <section className="w-full py-14 sm:py-16 lg:py-20 bg-white border-t border-slate-200 overflow-hidden" data-testid="landing-upcoming">
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full text-white text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span>What&apos;s Next</span>
          </div>
          <h2 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900 tracking-[-0.01em] mb-3">
            The Future of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              EverGo
            </span>
          </h2>
          <p className="text-base text-slate-500">
            We&apos;re constantly building new weapons for your arsenal
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon
            const status = statusLabels[feature.status as keyof typeof statusLabels]

            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", status.color)}>
                    {status.label}
                  </span>
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                  feature.gradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-1.5">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-10 sm:mt-12 max-w-md mx-auto text-center">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Get notified about new features</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors shadow-sm text-sm"
            />
            <button className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl font-semibold text-sm text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/25 transition-all">
              Notify Me
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
