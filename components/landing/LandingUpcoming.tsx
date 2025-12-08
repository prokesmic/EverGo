"use client"

import { Sparkles, Smartphone, Brain, Bell, Zap, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const upcomingFeatures = [
  {
    icon: Brain,
    title: "AI Coach",
    description: "Personalized training plans powered by AI. Coming Q1 2026.",
    status: "coming-soon",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    icon: Smartphone,
    title: "Apple Watch App",
    description: "Track workouts directly from your wrist. In development.",
    status: "in-development",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get reminded at optimal training times based on your schedule.",
    status: "coming-soon",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: Calendar,
    title: "Event Calendar",
    description: "Find and register for local races and events.",
    status: "in-development",
    gradient: "from-blue-500 to-cyan-600",
  },
]

const statusLabels = {
  "coming-soon": { label: "Coming Soon", color: "bg-yellow-100 text-yellow-800" },
  "in-development": { label: "In Development", color: "bg-blue-100 text-blue-800" },
  "beta": { label: "Beta", color: "bg-green-100 text-green-800" },
}

export function LandingUpcoming() {
  return (
    <section className="w-full py-20 md:py-28 bg-gray-900 text-white overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>What&apos;s Next</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            The future of
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              EverGo
            </span>
          </h2>
          <p className="text-lg text-gray-400">
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
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:bg-gray-800"
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
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
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
              className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue transition-colors"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-green rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-brand-blue/25 transition-all">
              Notify Me
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
