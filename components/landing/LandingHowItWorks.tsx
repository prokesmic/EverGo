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
    description: "Sign up in 30 seconds. Pick your sports, set goals, and claim your identity.",
    details: [
      "Choose from 25+ sports",
      "Set weekly targets",
      "Connect Garmin, Strava, or Apple Health",
    ],
    mockup: "profile",
  },
  {
    number: "02",
    icon: Activity,
    title: "Log Your Activities",
    description: "Track manually or sync automatically. Every session fuels your ranking.",
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
    description: "See where you stand. Crush rivals. Earn respect.",
    details: [
      "Club, city, country rankings",
      "Weekly and monthly battles",
      "Sponsored challenges with prizes",
    ],
    mockup: "ranking",
  },
  {
    number: "04",
    icon: Users,
    title: "Dominate Together",
    description: "Build your squad. Challenge other teams. Leave nothing behind.",
    details: [
      "Smart partner matching",
      "Team vs team battles",
      "Social feed with your network",
    ],
    mockup: "community",
  },
]

// Mockup screens for each step
function ProfileMockup() {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-bold text-white">
          A
        </div>
        <div>
          <div className="font-bold text-slate-900 text-lg">Alex Runner</div>
          <div className="text-sm text-slate-500">Sport Index: 742</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {["Running", "Cycling", "Swimming"].map((sport) => (
          <span
            key={sport}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-full text-sm font-medium"
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
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-900">Morning Run</span>
        <span className="ml-auto text-xs text-slate-500">Just now</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-slate-900">10.2</div>
          <div className="text-xs text-slate-500">km</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-slate-900">52:34</div>
          <div className="text-xs text-slate-500">time</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-slate-900">5:09</div>
          <div className="text-xs text-slate-500">/km</div>
        </div>
      </div>
      {/* Mini map mockup */}
      <div className="h-24 bg-slate-900 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d="M10,25 Q30,10 50,25 T90,25"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3"
            />
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
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
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-500" />
          <span className="font-semibold text-slate-900">Prague Rankings</span>
        </div>
        <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
          <Zap className="w-3 h-3" />
          +3 this week
        </span>
      </div>
      <div className="flex items-center justify-center py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-4xl font-extrabold text-white">#12</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-orange-500" />
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-slate-500">
        out of <span className="text-slate-900 font-bold">1,420</span> athletes
      </div>
    </div>
  )
}

function CommunityMockup() {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm mx-auto border border-slate-200">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-slate-900 rounded-xl">
          <Users className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <div className="text-xl font-extrabold text-white">12</div>
          <div className="text-xs text-slate-400">Partners</div>
        </div>
        <div className="text-center p-3 bg-slate-900 rounded-xl">
          <Trophy className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <div className="text-xl font-extrabold text-white">3</div>
          <div className="text-xs text-slate-400">Teams</div>
        </div>
        <div className="text-center p-3 bg-slate-900 rounded-xl">
          <Zap className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <div className="text-xl font-extrabold text-white">248</div>
          <div className="text-xs text-slate-400">Followers</div>
        </div>
      </div>
      <div className="flex justify-center -space-x-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full border-2 border-white bg-slate-600"
            style={{
              backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 20})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-semibold">
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
    <section ref={sectionRef} className="w-full py-14 sm:py-16 lg:py-20 bg-white border-t border-slate-200" data-testid="landing-how-it-works">
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full text-white text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            <span>Simple to start</span>
          </div>
          <h2 className="text-[clamp(24px,4vw,36px)] font-bold text-slate-900 tracking-[-0.01em] mb-3">
            Get Started in Minutes
          </h2>
          <p className="text-base text-slate-500">
            No complex setup. No learning curve. Just sign up and start dominating.
          </p>
        </div>

        {/* Scrollytelling Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Steps List - Left side */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === activeStep

                return (
                  <div
                    key={index}
                    ref={(el) => { stepRefs.current[index] = el }}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer",
                      isActive
                        ? "bg-white shadow-lg border-l-4 border-orange-500 border border-slate-200"
                        : "bg-slate-50 hover:bg-slate-100 border-l-4 border-transparent border border-slate-100"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                          isActive
                            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-md shadow-orange-500/20"
                            : "bg-slate-200 text-slate-500"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={cn(
                              "font-bold transition-colors",
                              isActive ? "text-slate-900" : "text-slate-500"
                            )}
                          >
                            {step.title}
                          </h3>
                          <ChevronRight
                            className={cn(
                              "w-5 h-5 transition-all",
                              isActive
                                ? "text-orange-500 rotate-90"
                                : "text-slate-400"
                            )}
                          />
                        </div>

                        <p
                          className={cn(
                            "text-sm transition-colors",
                            isActive ? "text-slate-500" : "text-slate-400"
                          )}
                        >
                          {step.description}
                        </p>

                        {isActive && (
                          <ul className="mt-4 space-y-2 animate-fadeIn">
                            {step.details.map((detail, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm text-slate-600"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
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

            {/* Sticky Mockup - Right side (sticky only on lg+) */}
            <div className="hidden lg:block">
              <div className="relative lg:sticky lg:top-24">
                <div className="relative">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70" />

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
                            ? "w-8 bg-orange-500"
                            : "w-2 bg-slate-300 hover:bg-slate-400"
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
        <div className="text-center mt-10 sm:mt-12">
          <Button
            asChild
            className="h-11 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[15px] shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/25 transition-all"
          >
            <Link href="/register" className="flex items-center gap-2">
              Start Dominating
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <p className="text-xs text-slate-500 mt-2">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
