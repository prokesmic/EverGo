"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/lib/onboarding/store"
import { Check, Dumbbell, Star } from "lucide-react"

interface Sport {
  id: string
  name: string
  slug: string
  icon: string
  category: string
}

interface Step2SportsProps {
  sports: Sport[]
}

// Sport category display order
const CATEGORY_ORDER = [
  "ENDURANCE",
  "CYCLING",
  "SWIMMING",
  "STRENGTH",
  "TEAM",
  "RACKET",
  "WATER_BOARD",
  "OUTDOOR",
  "WINTER",
  "COMBAT",
  "MINDBODY",
  "GENERIC",
]

const CATEGORY_LABELS: Record<string, string> = {
  ENDURANCE: "Running & Endurance",
  CYCLING: "Cycling",
  SWIMMING: "Swimming",
  STRENGTH: "Strength & Gym",
  TEAM: "Team Sports",
  RACKET: "Racket Sports",
  WATER_BOARD: "Water & Board",
  OUTDOOR: "Outdoor & Climbing",
  WINTER: "Winter Sports",
  COMBAT: "Combat & Martial Arts",
  MINDBODY: "Mind & Body",
  GENERIC: "Other",
}

export function Step2Sports({ sports }: Step2SportsProps) {
  const store = useOnboardingStore()

  // Group sports by category
  const sportsByCategory = sports.reduce((acc, sport) => {
    const category = sport.category || "GENERIC"
    if (!acc[category]) acc[category] = []
    acc[category].push(sport)
    return acc
  }, {} as Record<string, Sport[]>)

  const handleSportToggle = (sportId: string) => {
    if (store.primarySportId === sportId) {
      // Can't deselect primary sport, just ignore
      return
    }

    if (!store.primarySportId) {
      // First selection becomes primary
      store.setField("primarySportId", sportId)
    } else if (store.otherSportIds.includes(sportId)) {
      // Remove from secondary
      store.setField(
        "otherSportIds",
        store.otherSportIds.filter((id) => id !== sportId)
      )
    } else {
      // Add to secondary
      store.setField("otherSportIds", [...store.otherSportIds, sportId])
    }
  }

  const handleSetPrimary = (sportId: string) => {
    if (store.primarySportId === sportId) return

    // Move current primary to secondary
    const newOther = store.otherSportIds.filter((id) => id !== sportId)
    if (store.primarySportId) {
      newOther.unshift(store.primarySportId)
    }

    store.setFields({
      primarySportId: sportId,
      otherSportIds: newOther,
    })
  }

  const isSelected = (sportId: string) =>
    store.primarySportId === sportId || store.otherSportIds.includes(sportId)

  const isPrimary = (sportId: string) => store.primarySportId === sportId

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <Dumbbell className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Choose your sports</h2>
        <p className="text-gray-600 mt-2">
          Select your primary sport and add others you practice
        </p>
      </div>

      {/* Selection Summary */}
      {store.primarySportId && (
        <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-sm text-gray-700">
            Primary sport determines your default ranking lens
          </span>
        </div>
      )}

      {/* Sport Categories */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {CATEGORY_ORDER.filter((cat) => sportsByCategory[cat]?.length > 0).map(
          (category) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {sportsByCategory[category].map((sport) => (
                  <button
                    key={sport.id}
                    onClick={() => handleSportToggle(sport.id)}
                    onDoubleClick={() => handleSetPrimary(sport.id)}
                    className={cn(
                      "relative p-3 rounded-lg border-2 transition-all text-center",
                      "hover:border-blue-300 hover:bg-blue-50",
                      isSelected(sport.id)
                        ? isPrimary(sport.id)
                          ? "border-blue-500 bg-blue-100"
                          : "border-green-400 bg-green-50"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    {/* Selected indicator */}
                    {isSelected(sport.id) && (
                      <div
                        className={cn(
                          "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center",
                          isPrimary(sport.id) ? "bg-blue-500" : "bg-green-500"
                        )}
                      >
                        {isPrimary(sport.id) ? (
                          <Star className="w-3 h-3 text-white fill-white" />
                        ) : (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    )}

                    <span className="text-2xl mb-1 block">{sport.icon}</span>
                    <span className="text-xs font-medium text-gray-700 block truncate">
                      {sport.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-gray-500">
        <p>Tap to select/deselect. Double-tap to set as primary.</p>
        {store.primarySportId && store.otherSportIds.length > 0 && (
          <p className="mt-1 text-green-600">
            {store.otherSportIds.length + 1} sport
            {store.otherSportIds.length > 0 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  )
}
