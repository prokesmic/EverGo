"use client"

import { cn } from "@/lib/utils"
import { useOnboardingStore, type UserPersona } from "@/lib/onboarding/store"
import { Trophy, ClipboardList, Users } from "lucide-react"

/**
 * Step 0: Persona Selection (V11)
 *
 * Users choose how they primarily want to use EVERGO:
 * - COMPETITOR: Focused on rankings and competition
 * - TRACKER: Just want to log activities
 * - SOCIAL: Want to connect with friends
 *
 * This determines the onboarding flow emphasis and default settings.
 */

interface PersonaOption {
  id: UserPersona
  title: string
  subtitle: string
  description: string
  icon: typeof Trophy
  gradient: string
  borderColor: string
  features: string[]
}

const PERSONAS: PersonaOption[] = [
  {
    id: "COMPETITOR",
    title: "Competitor",
    subtitle: "I want to compete",
    description: "Track rankings, challenge rivals, and climb leaderboards",
    icon: Trophy,
    gradient: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500",
    features: [
      "Global & local rankings",
      "Head-to-head rivalries",
      "Gauntlets & seasons",
      "Verification badges",
    ],
  },
  {
    id: "TRACKER",
    title: "Tracker",
    subtitle: "I want to track",
    description: "Log activities, set personal goals, and track progress",
    icon: ClipboardList,
    gradient: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500",
    features: [
      "Activity logging",
      "Personal records",
      "Progress charts",
      "Multi-sport tracking",
    ],
  },
  {
    id: "SOCIAL",
    title: "Social",
    subtitle: "I want to connect",
    description: "Follow friends, share activities, and stay motivated together",
    icon: Users,
    gradient: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500",
    features: [
      "Follow friends",
      "Activity feed",
      "Comments & kudos",
      "Team challenges",
    ],
  },
]

export function Step0Persona() {
  const store = useOnboardingStore()
  const selectedPersona = store.persona

  const handleSelect = (persona: UserPersona) => {
    store.setFields({ persona })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What brings you to EVERGO?</h2>
        <p className="text-muted-foreground">
          Choose how you&apos;d like to use the app. You can always change this later.
        </p>
      </div>

      <div className="grid gap-4">
        {PERSONAS.map((persona) => {
          const Icon = persona.icon
          const isSelected = selectedPersona === persona.id

          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => handleSelect(persona.id)}
              className={cn(
                "relative w-full text-left p-6 rounded-xl border-2 transition-all duration-200",
                "hover:scale-[1.01] hover:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                isSelected
                  ? cn("bg-gradient-to-br", persona.gradient, persona.borderColor)
                  : "border-border bg-card hover:border-muted-foreground/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                    isSelected ? "bg-background/50" : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{persona.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {persona.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {persona.description}
                  </p>

                  {/* Feature list */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {persona.features.map((feature) => (
                      <span
                        key={feature}
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          isSelected
                            ? "bg-background/50 text-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selection indicator */}
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-foreground bg-foreground"
                      : "border-muted-foreground/50"
                  )}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-background"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        All features are available regardless of your choice. This just helps us personalize your experience.
      </p>
    </div>
  )
}
