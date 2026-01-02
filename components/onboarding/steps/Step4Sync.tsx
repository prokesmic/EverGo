"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/lib/onboarding/store"
import { Link2, Check, Globe, ChevronRight, Zap } from "lucide-react"

// Provider logos (using placeholder icons for now)
const PROVIDERS = [
  {
    id: "STRAVA" as const,
    name: "Strava",
    color: "bg-orange-500",
    description: "Connect your Strava account to sync activities",
    benefits: ["Auto-sync activities", "Import historical data", "Verified rankings"],
  },
  {
    id: "GARMIN" as const,
    name: "Garmin Connect",
    color: "bg-blue-600",
    description: "Connect your Garmin account to sync activities",
    benefits: ["Auto-sync workouts", "Import historical data", "Verified rankings"],
  },
]

export function Step4Sync() {
  const store = useOnboardingStore()
  const [connecting, setConnecting] = useState<string | null>(null)

  const handleConnect = async (provider: "STRAVA" | "GARMIN") => {
    setConnecting(provider)
    store.setField("connectProvider", provider)

    // In a real implementation, this would redirect to OAuth flow
    // For now, we just mark the selection
    setTimeout(() => {
      setConnecting(null)
    }, 1000)
  }

  const handleSkip = () => {
    store.setField("connectProvider", "SKIP")
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Link2 className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Connect your fitness apps</h2>
        <p className="text-gray-600 mt-2">
          Unlock global leaderboards and auto-sync your activities
        </p>
      </div>

      {/* Provider Cards */}
      <div className="space-y-3">
        {PROVIDERS.map((provider) => {
          const isSelected = store.connectProvider === provider.id
          const isConnecting = connecting === provider.id

          return (
            <button
              key={provider.id}
              onClick={() => handleConnect(provider.id)}
              disabled={isConnecting}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                "hover:border-purple-300 hover:shadow-md",
                isSelected
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg",
                    provider.color
                  )}
                >
                  {provider.name[0]}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {provider.name}
                    </span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              {/* Benefits */}
              <div className="mt-3 flex flex-wrap gap-2">
                {provider.benefits.map((benefit) => (
                  <span
                    key={benefit}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Why connect section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Why connect?
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Verified activities</strong> unlock Country and Global rankings
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Import historic activities</strong> to calculate your true ranking
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Auto-sync</strong> new activities as you complete them
            </span>
          </li>
        </ul>
      </div>

      {/* Skip option */}
      <div className="text-center pt-4 border-t">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className={cn(
            "text-gray-500",
            store.connectProvider === "SKIP" && "text-gray-900 font-medium"
          )}
        >
          Skip for now
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          You can connect your accounts anytime from Settings
        </p>
      </div>
    </div>
  )
}
