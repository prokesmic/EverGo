"use client"

import { useState } from "react"
import { Trophy, Users, TrendingUp, Zap, Target, Heart, Map, Award, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const featureCategories = [
  { id: "track", label: "Track", icon: Activity },
  { id: "compete", label: "Compete", icon: Trophy },
  { id: "connect", label: "Connect", icon: Users },
]

import { Activity } from "lucide-react"

const features = [
  {
    id: "multi-sport",
    category: "track",
    icon: Target,
    title: "25+ Sports Supported",
    description: "Running, cycling, swimming, tennis, golf, hiking, skiing, and many more. One profile for all your activities.",
    gradient: "from-blue-500 to-cyan-500",
    stats: { value: "25+", label: "sports" },
  },
  {
    id: "tracking",
    category: "track",
    icon: TrendingUp,
    title: "Smart Performance Analytics",
    description: "Track your progress with detailed metrics, trends, and AI-powered insights. Know exactly how you're improving.",
    gradient: "from-indigo-500 to-purple-500",
    stats: { value: "100%", label: "data ownership" },
  },
  {
    id: "integrations",
    category: "track",
    icon: Zap,
    title: "Sync Everywhere",
    description: "Connect Garmin, Apple Health, Strava, and more. Your data, automatically imported.",
    gradient: "from-yellow-500 to-orange-500",
    stats: { value: "15+", label: "integrations" },
  },
  {
    id: "rankings",
    category: "compete",
    icon: Trophy,
    title: "Real Rankings",
    description: "See your rank at club, city, country, and global levels. Know exactly where you stand among athletes.",
    gradient: "from-yellow-400 to-orange-500",
    stats: { value: "4", label: "levels" },
  },
  {
    id: "challenges",
    category: "compete",
    icon: Award,
    title: "Challenges & Badges",
    description: "Join sponsored challenges, earn achievement badges, and win prizes from top sports brands.",
    gradient: "from-green-500 to-emerald-500",
    stats: { value: "50+", label: "badges" },
  },
  {
    id: "leaderboards",
    category: "compete",
    icon: Sparkles,
    title: "Weekly Leaderboards",
    description: "Fresh competition every week. Climb the charts and celebrate your achievements.",
    gradient: "from-pink-500 to-rose-500",
    stats: { value: "Weekly", label: "reset" },
  },
  {
    id: "partners",
    category: "connect",
    icon: Users,
    title: "Find Training Partners",
    description: "Match with athletes in your area who share your pace, goals, and schedule.",
    gradient: "from-purple-500 to-pink-500",
    stats: { value: "Smart", label: "matching" },
  },
  {
    id: "teams",
    category: "connect",
    icon: Heart,
    title: "Teams & Communities",
    description: "Join clubs, create teams, and compete together. Build your athletic squad.",
    gradient: "from-red-500 to-pink-500",
    stats: { value: "1000+", label: "teams" },
  },
  {
    id: "routes",
    category: "connect",
    icon: Map,
    title: "Discover Routes",
    description: "Find popular routes near you, save favorites, and share your discoveries with the community.",
    gradient: "from-teal-500 to-green-500",
    stats: { value: "10K+", label: "routes" },
  },
]

export function LandingFeatures() {
  const [activeCategory, setActiveCategory] = useState("track")

  const filteredFeatures = features.filter((f) => f.category === activeCategory)

  return (
    <section className="w-full py-20 md:py-28 bg-white overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue/10 to-brand-green/10 rounded-full text-brand-blue text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Powerful features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to
            <span className="block bg-gradient-to-r from-brand-blue to-brand-green bg-clip-text text-transparent">
              level up your fitness
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            From casual fitness to competitive training, EverGo has you covered
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            {featureCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all",
                    activeCategory === cat.id
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {filteredFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.id}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] rounded-2xl transition-opacity duration-300`}
                />

                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Stats Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.stats.value}
                    </span>
                    <span className="text-sm text-gray-500">{feature.stats.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="/features"
            className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-green transition-colors"
          >
            See all features
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
