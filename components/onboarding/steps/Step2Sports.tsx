"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useOnboardingStore } from "@/lib/onboarding/store"
import {
  Check,
  Dumbbell,
  Star,
  Activity,
  Bike,
  Footprints,
  Mountain,
  PersonStanding,
  Snowflake,
  Waves,
  Heart,
  Shield,
  Trophy,
  Users,
  Target,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { CATEGORY_ORDER } from "@/lib/onboarding/sportsCatalog"
import type { CatalogSportWithId } from "../OnboardingWizard"

// Icon lookup map (since icons can't be serialized from server)
const SPORT_ICONS: Record<string, LucideIcon> = {
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
  rowing: Waves,
  triathlon: Trophy,
  "gym-strength": Dumbbell,
  crossfit: Dumbbell,
  hiking: Mountain,
  walking: PersonStanding,
  bouldering: Mountain,
  "climbing-sport": Mountain,
  skiing: Snowflake,
  yoga: Heart,
  pilates: Heart,
  boxing: Shield,
  mma: Shield,
  tennis: Target,
  padel: Target,
  badminton: Target,
  basketball: Users,
  football: Users,
  volleyball: Users,
  "all-sports": Activity,
}

interface Step2SportsProps {
  sports: CatalogSportWithId[]
}

export function Step2Sports({ sports }: Step2SportsProps) {
  const store = useOnboardingStore()

  // Group sports by category
  const grouped = useMemo(() => {
    const m = new Map<string, CatalogSportWithId[]>()
    for (const s of sports) {
      const existing = m.get(s.category) ?? []
      m.set(s.category, [...existing, s])
    }
    // Sort by CATEGORY_ORDER
    return CATEGORY_ORDER.filter((cat) => m.has(cat)).map((cat) => ({
      category: cat,
      items: m.get(cat)!,
    }))
  }, [sports])

  const handleSportToggle = (sportId: string) => {
    // If it's the primary sport and selected, we can't deselect it (must have primary)
    if (store.primarySportId === sportId) {
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

  const handleSetPrimary = (sportId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (store.primarySportId === sportId) return

    // Move current primary to secondary (if exists)
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
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Dumbbell className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Choose your sports</h2>
        <p className="text-gray-600 mt-2">
          Select sports you do regularly. Mark one as Primary.
        </p>
      </div>

      {/* Selection Summary */}
      {store.primarySportId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="text-sm text-amber-800">
            Primary sport determines your default ranking lens
          </span>
        </div>
      )}

      {/* Sport Categories */}
      <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <div className="mb-3 text-sm font-semibold text-gray-500">
              {category}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {items.map((sport) => {
                const selected = isSelected(sport.id)
                const primary = isPrimary(sport.id)
                const Icon = SPORT_ICONS[sport.slug] || Activity

                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => handleSportToggle(sport.id)}
                    className={cn(
                      "group relative rounded-2xl border bg-white px-4 py-4 text-left shadow-sm transition",
                      "hover:shadow-md hover:border-blue-300",
                      selected
                        ? primary
                          ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50"
                          : "border-emerald-400 ring-2 ring-emerald-100"
                        : "border-gray-200"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl",
                            selected
                              ? primary
                                ? "bg-amber-100"
                                : "bg-emerald-100"
                              : "bg-gray-100"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5",
                              selected
                                ? primary
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                                : "text-gray-500"
                            )}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {sport.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selected
                              ? primary
                                ? "Primary"
                                : "Selected"
                              : "Tap to select"}
                          </div>
                        </div>
                      </div>

                      {/* Selected check / Star for primary */}
                      {selected && (
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full",
                            primary ? "bg-amber-500" : "bg-emerald-500"
                          )}
                        >
                          {primary ? (
                            <Star className="h-3.5 w-3.5 text-white fill-white" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Set as Primary button - shown when selected but not primary */}
                    {selected && !primary && (
                      <button
                        type="button"
                        onClick={(e) => handleSetPrimary(sport.id, e)}
                        className={cn(
                          "mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600",
                          "transition hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700",
                          "flex items-center justify-center gap-1.5"
                        )}
                      >
                        <Star className="h-3.5 w-3.5" />
                        Set as Primary
                      </button>
                    )}

                    {/* Tags shown only if selected and tags exist */}
                    {selected && sport.tags && sport.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {sport.tags.map((tag) => (
                          <span
                            key={tag.value}
                            className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selection count */}
      {store.primarySportId && (
        <div className="text-center text-sm text-gray-500">
          {store.otherSportIds.length + 1} sport
          {store.otherSportIds.length > 0 ? "s" : ""} selected
        </div>
      )}
    </div>
  )
}
