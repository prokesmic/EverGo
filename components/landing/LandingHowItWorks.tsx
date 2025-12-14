"use client"

import { useState, useEffect, useRef } from "react"
import { UserPlus, Activity, Trophy, Users, ChevronRight, Globe, Zap, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
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
    mockup: "profile",
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
    mockup: "activity",
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
    mockup: "ranking",
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
    mockup: "community",
  },
]

// Mockup screens for each step
function ProfileMockup() {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-2xl font-bold text-slate-950">
          A
        </div>
        <div>
          <div className="font-bold text-slate-900 text-lg">Alex Runner</div>
          <div className="text-sm text-slate-500">Intermediate Athlete</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {["Running", "Cycling", "Swimming"].map((sport) => (
          <span
            key={sport}
            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30"
          >
            {sport}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <MapPin className="w-4 h-4" />
        <span>Prague, Czech Republic</span>
      </div>
    </div>
  )
}

function ActivityMockup() {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <Activity className="w-4 h-4 text-slate-900" />
        </div>
        <span className="font-semibold text-slate-900">Morning Run</span>
        <span className="ml-auto text-xs text-slate-500">Just now</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">10.2</div>
          <div className="text-xs text-slate-500">km</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">52:34</div>
          <div className="text-xs text-slate-500">time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">5:09</div>
          <div className="text-xs text-slate-500">/km</div>
        </div>
      </div>
      {/* Mini map mockup */}
      <div className="h-24 bg-slate-900 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d="M10,25 Q30,10 50,25 T90,25"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-300">
          Prague, CZ
        </div>
      </div>
    </div>
  )
}

function RankingMockup() {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-slate-900">Prague Rankings</span>
        </div>
        <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
          <Zap className="w-3 h-3" />
          +3 this week
        </span>
      </div>
      <div className="flex items-center justify-center py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-4xl font-bold text-slate-900">#12</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-slate-900" />
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-slate-500">
        out of <span className="text-slate-900 font-medium">1,420</span> athletes
      </div>
    </div>
  )
}

function CommunityMockup() {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
          <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">12</div>
          <div className="text-xs text-slate-500">Partners</div>
        </div>
        <div className="text-center p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
          <Trophy className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">3</div>
          <div className="text-xs text-slate-500">Teams</div>
        </div>
        <div className="text-center p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
          <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-900">248</div>
          <div className="text-xs text-slate-500">Followers</div>
        </div>
      </div>
      <div className="flex justify-center -space-x-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-600"
            style={{
              backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 20})`,
              backgroundSize: 'cover',
            }}
          />
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 text-xs font-semibold">
          +242
        </div>
      </div>
    </div>
  )
}

export function LandingHowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll-based step detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex((ref) => ref === entry.target)
            if (index !== -1) {
              setActiveStep(index)
            }
          }
        })
      },
      { threshold: 0.5, rootMargin: "-20% 0px -20% 0px" }
    )

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const renderMockup = () => {
    switch (steps[activeStep].mockup) {
      case "profile":
        return <ProfileMockup />
      case "activity":
        return <ActivityMockup />
      case "ranking":
        return <RankingMockup />
      case "community":
        return <CommunityMockup />
      default:
        return <ProfileMockup />
    }
  }

  return (
    <section ref={sectionRef} className="w-full py-20 md:py-28 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-cyan-400 text-sm font-medium mb-4 border border-slate-200">
            <span>Simple to start</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Get started in minutes
          </h2>
          <p className="text-lg text-slate-500">
            No complex setup. No learning curve. Just sign up and start tracking.
          </p>
        </div>

        {/* Scrollytelling Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Steps List - Left side */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === activeStep

                return (
                  <div
                    key={index}
                    ref={(el) => { stepRefs.current[index] = el }}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "w-full text-left p-6 rounded-2xl transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-white shadow-sm border-l-4 border-emerald-400 shadow-lg border border-slate-200"
                        : "bg-slate-900/20 hover:bg-slate-900/30 border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10"
                            : "bg-slate-800 text-slate-500"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={cn(
                              "font-semibold transition-colors",
                              isActive ? "text-slate-900" : "text-slate-500"
                            )}
                          >
                            {step.title}
                          </h3>
                          <ChevronRight
                            className={cn(
                              "w-5 h-5 transition-all",
                              isActive
                                ? "text-emerald-400 rotate-90"
                                : "text-slate-600"
                            )}
                          />
                        </div>

                        <p
                          className={cn(
                            "text-sm transition-colors",
                            isActive ? "text-slate-300" : "text-slate-9000"
                          )}
                        >
                          {step.description}
                        </p>

                        {isActive && (
                          <ul className="mt-4 space-y-2 animate-fadeIn">
                            {step.details.map((detail, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm text-slate-300"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sticky Mockup - Right side */}
            <div className="hidden lg:block">
              <div className="sticky top-1/4">
                <div className="relative">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-xl" />

                  {/* Mockup container */}
                  <div className="relative transition-all duration-500">
                    {renderMockup()}
                  </div>

                  {/* Progress indicator */}
                  <div className="flex justify-center gap-2 mt-6">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveStep(index)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          index === activeStep
                            ? "w-8 bg-gradient-to-r from-emerald-400 to-cyan-500"
                            : "w-2 bg-slate-600 hover:bg-slate-500"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-semibold px-8 py-6 h-auto shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Link href="/register" className="flex items-center gap-2">
              Start Your Journey Free
              <ChevronRight className="w-5 h-5" />
            </Link>
          </Button>
          <p className="text-sm text-slate-9000 mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
