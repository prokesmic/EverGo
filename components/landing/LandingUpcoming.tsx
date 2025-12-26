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
    <section className="w-full py-24 bg-white border-t border-slate-200 overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full text-white text-sm font-bold mb-4">
            <Zap className="w-4 h-4 text-orange-500" />
            <span>What&apos;s Next</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            The Future of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              EverGo
            </span>
          </h2>
          <p className="text-lg text-slate-500">
            We&apos;re constantly building new weapons for your arsenal
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon
            const status = statusLabels[feature.status as keyof typeof statusLabels]

            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-6 border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-bold", status.color)}>
                    {status.label}
                  </span>
                </div>

                {/* Icon */}
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br",
                  feature.gradient
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 max-w-xl mx-auto text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Get notified about new features</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors shadow-sm"
            />
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/30 transition-all">
              Notify Me
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
