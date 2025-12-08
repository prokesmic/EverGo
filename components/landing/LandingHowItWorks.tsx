"use client"

import { useState } from "react"
import { UserPlus, Activity, Trophy, Users, ChevronRight, Smartphone, Globe, Target, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type ProfileVisual = {
  type: "profile"
  data: {
    name: string
    sports: string[]
    level: string
  }
}

type ActivityVisual = {
  type: "activity"
  data: {
    type: string
    distance: string
    time: string
    pace: string
  }
}

type RankingVisual = {
  type: "ranking"
  data: {
    city: string
    rank: number
    total: number
    trend: string
  }
}

type CommunityVisual = {
  type: "community"
  data: {
    partners: number
    teams: number
    followers: number
  }
}

type StepVisualType = ProfileVisual | ActivityVisual | RankingVisual | CommunityVisual

type Step = {
  number: string
  icon: LucideIcon
  title: string
  description: string
  details: string[]
  visual: StepVisualType
}

const steps: Step[] = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up in 30 seconds. Pick your sports, set goals, and personalize your athlete identity.",
    details: [
      "Choose from 25+ sports",
      "Set weekly distance and time goals",
      "Connect with Garmin, Strava, or Apple Health",
    ],
    visual: {
      type: "profile",
      data: {
        name: "Alex Runner",
        sports: ["Running", "Cycling", "Swimming"],
        level: "Intermediate",
      },
    },
  },
  {
    number: "02",
    icon: Activity,
    title: "Log Your Activities",
    description: "Track manually or sync automatically. Every run, ride, and swim counts toward your rankings.",
    details: [
      "GPS tracking built-in",
      "Auto-sync from fitness apps",
      "Quick manual entry option",
    ],
    visual: {
      type: "activity",
      data: {
        type: "Morning Run",
        distance: "10.2 km",
        time: "52:34",
        pace: "5:09 /km",
      },
    },
  },
  {
    number: "03",
    icon: Trophy,
    title: "Climb the Rankings",
    description: "See where you stand locally and globally. Compete in challenges and earn achievements.",
    details: [
      "Club, city, country rankings",
      "Weekly and monthly leaderboards",
      "Sponsored challenges with prizes",
    ],
    visual: {
      type: "ranking",
      data: {
        city: "Prague",
        rank: 12,
        total: 1420,
        trend: "+3",
      },
    },
  },
  {
    number: "04",
    icon: Users,
    title: "Connect & Grow",
    description: "Find training partners, join teams, and build your athletic community.",
    details: [
      "Smart partner matching",
      "Team challenges and events",
      "Social feed with your network",
    ],
    visual: {
      type: "community",
      data: {
        partners: 12,
        teams: 3,
        followers: 248,
      },
    },
  },
]

function StepVisual({ step, isActive }: { step: Step; isActive: boolean }) {
  const baseClass = cn(
    "absolute inset-0 flex items-center justify-center transition-all duration-500",
    isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
  )

  if (step.visual.type === "profile") {
    return (
      <div className={baseClass}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue to-brand-green flex items-center justify-center text-white text-2xl font-bold">
              A
            </div>
            <div>
              <div className="font-bold text-gray-900">{step.visual.data.name}</div>
              <div className="text-sm text-gray-500">{step.visual.data.level}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {step.visual.data.sports.map((sport) => (
              <span
                key={sport}
                className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-medium"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step.visual.type === "activity") {
    return (
      <div className={baseClass}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-brand-green" />
            <span className="font-semibold text-gray-900">{step.visual.data.type}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{step.visual.data.distance}</div>
              <div className="text-xs text-gray-500">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{step.visual.data.time}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{step.visual.data.pace}</div>
              <div className="text-xs text-gray-500">Pace</div>
            </div>
          </div>
          <div className="mt-4 h-12 bg-gradient-to-r from-brand-blue/20 via-brand-green/30 to-brand-blue/20 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-0.5 bg-brand-green" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step.visual.type === "ranking") {
    return (
      <div className={baseClass}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-brand-blue" />
              <span className="font-semibold text-gray-900">{step.visual.data.city} Rankings</span>
            </div>
            <span className="text-green-500 text-sm font-medium">{step.visual.data.trend} this week</span>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">#{step.visual.data.rank}</span>
              </div>
              <Trophy className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            out of {step.visual.data.total.toLocaleString()} athletes
          </div>
        </div>
      </div>
    )
  }

  if (step.visual.type === "community") {
    return (
      <div className={baseClass}>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{step.visual.data.partners}</div>
              <div className="text-xs text-gray-500">Partners</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{step.visual.data.teams}</div>
              <div className="text-xs text-gray-500">Teams</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <Smartphone className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-gray-900">{step.visual.data.followers}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
          </div>
          <div className="flex justify-center -space-x-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                style={{
                  backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 20})`,
                  backgroundSize: 'cover',
                }}
              />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-blue flex items-center justify-center text-white text-xs font-semibold">
              +{step.visual.data.followers - 6}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export function LandingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="w-full py-20 md:py-28 bg-gray-50">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 rounded-full text-brand-blue text-sm font-medium mb-4">
            <span>Simple to start</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-gray-600">
            No complex setup. No learning curve. Just sign up and start tracking.
          </p>
        </div>

        {/* Interactive Steps */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Steps List */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === activeStep

                return (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "w-full text-left p-6 rounded-2xl transition-all duration-300",
                      isActive
                        ? "bg-white shadow-lg border-l-4 border-brand-blue"
                        : "bg-white/50 hover:bg-white/80 border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          isActive
                            ? "bg-brand-blue text-white"
                            : "bg-gray-100 text-gray-400"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={cn(
                              "font-semibold transition-colors",
                              isActive ? "text-gray-900" : "text-gray-600"
                            )}
                          >
                            {step.title}
                          </h3>
                          <ChevronRight
                            className={cn(
                              "w-5 h-5 transition-all",
                              isActive
                                ? "text-brand-blue rotate-90"
                                : "text-gray-300"
                            )}
                          />
                        </div>

                        <p
                          className={cn(
                            "text-sm transition-colors",
                            isActive ? "text-gray-600" : "text-gray-400"
                          )}
                        >
                          {step.description}
                        </p>

                        {isActive && (
                          <ul className="mt-4 space-y-2">
                            {step.details.map((detail, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Visual Preview */}
            <div className="relative hidden lg:block">
              <div className="aspect-square relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-green/5 rounded-3xl" />

                {/* Step visuals */}
                {steps.map((step, index) => (
                  <StepVisual
                    key={index}
                    step={step}
                    isActive={index === activeStep}
                  />
                ))}

                {/* Progress indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === activeStep
                          ? "w-8 bg-brand-blue"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-brand-blue to-brand-green rounded-xl hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Start Your Journey Free
            <ChevronRight className="w-5 h-5 ml-1" />
          </a>
          <p className="text-sm text-gray-500 mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
