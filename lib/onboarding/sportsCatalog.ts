// lib/onboarding/sportsCatalog.ts
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bike,
  Dumbbell,
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

export type SportTag = { label: string; value: string; dbSlug?: string }

export type OnboardingSport = {
  slug: string
  label: string
  category: string
  icon: LucideIcon
  tags?: SportTag[]
}

// IMPORTANT: only canonical sports here (no cycling-road, no swimming-pool etc.)
// Variants become tags within the canonical sport
export const ONBOARDING_SPORTS: OnboardingSport[] = [
  // Endurance
  {
    slug: "running",
    label: "Running",
    category: "Endurance",
    icon: Footprints,
    tags: [
      { label: "Road", value: "road" },
      { label: "Trail", value: "trail", dbSlug: "trail-running" },
    ],
  },
  {
    slug: "cycling",
    label: "Cycling",
    category: "Endurance",
    icon: Bike,
    tags: [
      { label: "Road", value: "road", dbSlug: "cycling-road" },
      { label: "Gravel", value: "gravel", dbSlug: "gravel-cycling" },
      { label: "MTB", value: "mtb", dbSlug: "mountain-biking" },
    ],
  },
  {
    slug: "swimming",
    label: "Swimming",
    category: "Endurance",
    icon: Waves,
    tags: [
      { label: "Pool", value: "pool", dbSlug: "swimming-pool" },
      { label: "Open Water", value: "open-water", dbSlug: "open-water-swimming" },
    ],
  },
  {
    slug: "rowing",
    label: "Rowing",
    category: "Endurance",
    icon: Waves,
  },
  {
    slug: "triathlon",
    label: "Triathlon",
    category: "Endurance",
    icon: Trophy,
  },

  // Strength
  {
    slug: "gym-strength",
    label: "Gym / Strength",
    category: "Strength",
    icon: Dumbbell,
  },
  {
    slug: "crossfit",
    label: "CrossFit",
    category: "Strength",
    icon: Dumbbell,
  },

  // Outdoor
  {
    slug: "hiking",
    label: "Hiking",
    category: "Outdoor",
    icon: Mountain,
  },
  {
    slug: "walking",
    label: "Walking",
    category: "Outdoor",
    icon: PersonStanding,
  },
  {
    slug: "bouldering",
    label: "Bouldering",
    category: "Outdoor",
    icon: Mountain,
  },
  {
    slug: "climbing-sport",
    label: "Climbing",
    category: "Outdoor",
    icon: Mountain,
  },

  // Winter
  {
    slug: "skiing",
    label: "Skiing",
    category: "Winter",
    icon: Snowflake,
    tags: [
      { label: "Alpine", value: "alpine" },
      { label: "Cross-country", value: "xc" },
    ],
  },

  // Mind & Body
  {
    slug: "yoga",
    label: "Yoga",
    category: "Mind & Body",
    icon: Heart,
  },
  {
    slug: "pilates",
    label: "Pilates",
    category: "Mind & Body",
    icon: Heart,
  },

  // Combat
  {
    slug: "boxing",
    label: "Boxing",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "mma",
    label: "MMA",
    category: "Combat",
    icon: Shield,
  },

  // Racket Sports
  {
    slug: "tennis",
    label: "Tennis",
    category: "Racket",
    icon: Target,
  },
  {
    slug: "padel",
    label: "Padel",
    category: "Racket",
    icon: Target,
  },
  {
    slug: "badminton",
    label: "Badminton",
    category: "Racket",
    icon: Target,
  },

  // Team Sports
  {
    slug: "basketball",
    label: "Basketball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "football",
    label: "Football",
    category: "Team",
    icon: Users,
  },
  {
    slug: "volleyball",
    label: "Volleyball",
    category: "Team",
    icon: Users,
  },

  // General
  {
    slug: "all-sports",
    label: "All Sports",
    category: "General",
    icon: Activity,
  },
]

// Category display order
export const CATEGORY_ORDER = [
  "Endurance",
  "Strength",
  "Outdoor",
  "Winter",
  "Mind & Body",
  "Combat",
  "Racket",
  "Team",
  "General",
]
