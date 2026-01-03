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
  Wind,
  Sword,
  Zap,
  Timer,
  Medal,
  Sailboat,
  Anchor,
} from "lucide-react"

export type SportTag = { label: string; value: string; dbSlug?: string }

export type OnboardingSport = {
  slug: string
  label: string
  category: string
  icon: LucideIcon
  tags?: SportTag[]
}

// Comprehensive sports catalog including Olympic sports
export const ONBOARDING_SPORTS: OnboardingSport[] = [
  // ============ ENDURANCE ============
  {
    slug: "running",
    label: "Running",
    category: "Endurance",
    icon: Footprints,
    tags: [
      { label: "Road", value: "road" },
      { label: "Trail", value: "trail", dbSlug: "trail-running" },
      { label: "Track", value: "track" },
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
      { label: "Track", value: "track" },
      { label: "BMX", value: "bmx" },
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
  {
    slug: "marathon",
    label: "Marathon",
    category: "Endurance",
    icon: Medal,
  },
  {
    slug: "race-walking",
    label: "Race Walking",
    category: "Endurance",
    icon: PersonStanding,
  },
  {
    slug: "modern-pentathlon",
    label: "Modern Pentathlon",
    category: "Endurance",
    icon: Medal,
  },

  // ============ STRENGTH & FITNESS ============
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
  {
    slug: "weightlifting",
    label: "Weightlifting",
    category: "Strength",
    icon: Dumbbell,
  },
  {
    slug: "powerlifting",
    label: "Powerlifting",
    category: "Strength",
    icon: Dumbbell,
  },
  {
    slug: "calisthenics",
    label: "Calisthenics",
    category: "Strength",
    icon: Dumbbell,
  },

  // ============ OUTDOOR & ADVENTURE ============
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
    label: "Sport Climbing",
    category: "Outdoor",
    icon: Mountain,
  },
  {
    slug: "mountaineering",
    label: "Mountaineering",
    category: "Outdoor",
    icon: Mountain,
  },
  {
    slug: "skateboarding",
    label: "Skateboarding",
    category: "Outdoor",
    icon: Zap,
  },

  // ============ WATER SPORTS ============
  {
    slug: "kitesurfing",
    label: "Kitesurfing",
    category: "Water",
    icon: Wind,
  },
  {
    slug: "surfing",
    label: "Surfing",
    category: "Water",
    icon: Waves,
  },
  {
    slug: "windsurfing",
    label: "Windsurfing",
    category: "Water",
    icon: Wind,
  },
  {
    slug: "sailing",
    label: "Sailing",
    category: "Water",
    icon: Sailboat,
  },
  {
    slug: "kayaking",
    label: "Kayaking",
    category: "Water",
    icon: Waves,
  },
  {
    slug: "canoeing",
    label: "Canoeing",
    category: "Water",
    icon: Waves,
  },
  {
    slug: "diving",
    label: "Diving",
    category: "Water",
    icon: Waves,
  },
  {
    slug: "water-polo",
    label: "Water Polo",
    category: "Water",
    icon: Waves,
  },
  {
    slug: "stand-up-paddling",
    label: "Stand Up Paddling",
    category: "Water",
    icon: Anchor,
  },
  {
    slug: "wakeboarding",
    label: "Wakeboarding",
    category: "Water",
    icon: Waves,
  },

  // ============ WINTER SPORTS ============
  {
    slug: "skiing",
    label: "Alpine Skiing",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "cross-country-skiing",
    label: "Cross-Country Skiing",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "snowboarding",
    label: "Snowboarding",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "biathlon",
    label: "Biathlon",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "ski-jumping",
    label: "Ski Jumping",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "freestyle-skiing",
    label: "Freestyle Skiing",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "figure-skating",
    label: "Figure Skating",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "speed-skating",
    label: "Speed Skating",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "ice-hockey",
    label: "Ice Hockey",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "curling",
    label: "Curling",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "bobsled",
    label: "Bobsled",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "luge",
    label: "Luge",
    category: "Winter",
    icon: Snowflake,
  },
  {
    slug: "skeleton",
    label: "Skeleton",
    category: "Winter",
    icon: Snowflake,
  },

  // ============ COMBAT SPORTS ============
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
  {
    slug: "wrestling",
    label: "Wrestling",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "judo",
    label: "Judo",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "taekwondo",
    label: "Taekwondo",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "karate",
    label: "Karate",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "fencing",
    label: "Fencing",
    category: "Combat",
    icon: Sword,
  },
  {
    slug: "kickboxing",
    label: "Kickboxing",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "brazilian-jiu-jitsu",
    label: "Brazilian Jiu-Jitsu",
    category: "Combat",
    icon: Shield,
  },
  {
    slug: "muay-thai",
    label: "Muay Thai",
    category: "Combat",
    icon: Shield,
  },

  // ============ RACKET SPORTS ============
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
  {
    slug: "table-tennis",
    label: "Table Tennis",
    category: "Racket",
    icon: Target,
  },
  {
    slug: "squash",
    label: "Squash",
    category: "Racket",
    icon: Target,
  },
  {
    slug: "pickleball",
    label: "Pickleball",
    category: "Racket",
    icon: Target,
  },

  // ============ TEAM SPORTS ============
  {
    slug: "basketball",
    label: "Basketball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "football",
    label: "Football (Soccer)",
    category: "Team",
    icon: Users,
  },
  {
    slug: "volleyball",
    label: "Volleyball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "beach-volleyball",
    label: "Beach Volleyball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "handball",
    label: "Handball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "rugby",
    label: "Rugby",
    category: "Team",
    icon: Users,
  },
  {
    slug: "american-football",
    label: "American Football",
    category: "Team",
    icon: Users,
  },
  {
    slug: "baseball",
    label: "Baseball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "softball",
    label: "Softball",
    category: "Team",
    icon: Users,
  },
  {
    slug: "field-hockey",
    label: "Field Hockey",
    category: "Team",
    icon: Users,
  },
  {
    slug: "lacrosse",
    label: "Lacrosse",
    category: "Team",
    icon: Users,
  },
  {
    slug: "cricket",
    label: "Cricket",
    category: "Team",
    icon: Users,
  },

  // ============ GYMNASTICS & ACROBATICS ============
  {
    slug: "artistic-gymnastics",
    label: "Artistic Gymnastics",
    category: "Gymnastics",
    icon: Timer,
  },
  {
    slug: "rhythmic-gymnastics",
    label: "Rhythmic Gymnastics",
    category: "Gymnastics",
    icon: Timer,
  },
  {
    slug: "trampoline",
    label: "Trampoline",
    category: "Gymnastics",
    icon: Timer,
  },
  {
    slug: "acrobatics",
    label: "Acrobatics",
    category: "Gymnastics",
    icon: Timer,
  },
  {
    slug: "pole-dance",
    label: "Pole Dance",
    category: "Gymnastics",
    icon: Timer,
  },
  {
    slug: "cheerleading",
    label: "Cheerleading",
    category: "Gymnastics",
    icon: Timer,
  },

  // ============ PRECISION SPORTS ============
  {
    slug: "archery",
    label: "Archery",
    category: "Precision",
    icon: Target,
  },
  {
    slug: "shooting",
    label: "Shooting",
    category: "Precision",
    icon: Target,
  },
  {
    slug: "golf",
    label: "Golf",
    category: "Precision",
    icon: Target,
  },
  {
    slug: "darts",
    label: "Darts",
    category: "Precision",
    icon: Target,
  },
  {
    slug: "bowling",
    label: "Bowling",
    category: "Precision",
    icon: Target,
  },

  // ============ TRACK & FIELD ============
  {
    slug: "sprinting",
    label: "Sprinting",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "hurdles",
    label: "Hurdles",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "long-jump",
    label: "Long Jump",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "high-jump",
    label: "High Jump",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "pole-vault",
    label: "Pole Vault",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "triple-jump",
    label: "Triple Jump",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "shot-put",
    label: "Shot Put",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "discus",
    label: "Discus Throw",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "javelin",
    label: "Javelin Throw",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "hammer-throw",
    label: "Hammer Throw",
    category: "Athletics",
    icon: Zap,
  },
  {
    slug: "decathlon",
    label: "Decathlon",
    category: "Athletics",
    icon: Medal,
  },
  {
    slug: "heptathlon",
    label: "Heptathlon",
    category: "Athletics",
    icon: Medal,
  },

  // ============ MIND & BODY ============
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
  {
    slug: "tai-chi",
    label: "Tai Chi",
    category: "Mind & Body",
    icon: Heart,
  },
  {
    slug: "meditation",
    label: "Meditation",
    category: "Mind & Body",
    icon: Heart,
  },

  // ============ EQUESTRIAN ============
  {
    slug: "dressage",
    label: "Dressage",
    category: "Equestrian",
    icon: Trophy,
  },
  {
    slug: "show-jumping",
    label: "Show Jumping",
    category: "Equestrian",
    icon: Trophy,
  },
  {
    slug: "eventing",
    label: "Eventing",
    category: "Equestrian",
    icon: Trophy,
  },

  // ============ OTHER ============
  {
    slug: "break-dancing",
    label: "Breaking (Breakdance)",
    category: "Other",
    icon: Zap,
  },
  {
    slug: "roller-skating",
    label: "Roller Skating",
    category: "Other",
    icon: Zap,
  },
  {
    slug: "inline-skating",
    label: "Inline Skating",
    category: "Other",
    icon: Zap,
  },
  {
    slug: "parkour",
    label: "Parkour",
    category: "Other",
    icon: Zap,
  },
  {
    slug: "dance",
    label: "Dance",
    category: "Other",
    icon: Heart,
  },

  // ============ GENERAL ============
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
  "Water",
  "Strength",
  "Athletics",
  "Outdoor",
  "Winter",
  "Combat",
  "Racket",
  "Team",
  "Gymnastics",
  "Precision",
  "Mind & Body",
  "Equestrian",
  "Other",
  "General",
]
