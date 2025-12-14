"use client"

import { Sparkles, Smartphone, Brain, Bell, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const upcomingFeatures = [
  {
    icon: Brain,
    title: "AI Coach",
    description: "Personalized training plans powered by AI. Coming Q1 2026.",
    status: "coming-soon",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    icon: Smartphone,
    title: "Apple Watch App",
    description: "Track workouts directly from your wrist. In development.",
    status: "in-development",
    gradient: "from-emerald-400 to-cyan-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get reminded at optimal training times based on your schedule.",
    status: "coming-soon",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Calendar,
    title: "Event Calendar",
    description: "Find and register for local races and events.",
    status: "in-development",
    gradient: "from-cyan-400 to-blue-500",
  },
]

const statusLabels = {
  "coming-soon": { label: "Coming Soon", color: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
  "in-development": { label: "In Development", color: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" },
  "beta": { label: "Beta", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
}

export function LandingUpcoming() {
  return (
    <section className="w-full py-20 md:py-28 bg-slate-900 text-white overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white text-sm font-medium mb-4 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>What&apos;s Next</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            The future of
            <span className="block bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              EverGo
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            We&apos;re constantly building new features to help you achieve your fitness goals
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
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all hover:bg-slate-800"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", status.color)}>
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
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 max-w-xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4">Get notified about new features</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-xl font-semibold text-slate-950 hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
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
