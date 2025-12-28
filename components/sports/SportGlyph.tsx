import {
  Bike,
  Footprints,
  Waves,
  Dumbbell,
  Users,
  Snowflake,
  Shield,
  Mountain,
  Wind,
  Trophy,
  Circle,
  Heart,
  Target,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SportLike = {
  slug?: string
  category?: string
  name?: string
  icon?: string
}

function pickIcon(sport: SportLike): LucideIcon {
  const slug = (sport.slug ?? sport.name ?? "").toLowerCase()
  const cat = (sport.category ?? "").toUpperCase()
  const iconName = (sport.icon ?? "").toLowerCase()

  // Category-based mapping (most reliable)
  if (cat === "CYCLING") return Bike
  if (cat === "SWIMMING") return Waves
  if (cat === "STRENGTH") return Dumbbell
  if (cat === "TEAM") return Users
  if (cat === "WINTER") return Snowflake
  if (cat === "COMBAT") return Shield
  if (cat === "OUTDOOR") return Mountain
  if (cat === "WATER_BOARD") return Wind
  if (cat === "RACKET") return Trophy
  if (cat === "ENDURANCE") return Footprints
  if (cat === "MINDBODY") return Heart
  if (cat === "PRECISION") return Target

  // Icon name mapping (database stores icon names like "bike", "circle", etc.)
  if (iconName === "bike" || iconName === "bicycle") return Bike
  if (iconName === "footprints" || iconName === "run" || iconName === "running") return Footprints
  if (iconName === "waves" || iconName === "swim" || iconName === "swimming") return Waves
  if (iconName === "dumbbell" || iconName === "weight" || iconName === "strength") return Dumbbell
  if (iconName === "users" || iconName === "team") return Users
  if (iconName === "snowflake" || iconName === "snow" || iconName === "winter") return Snowflake
  if (iconName === "shield" || iconName === "combat" || iconName === "boxing") return Shield
  if (iconName === "mountain" || iconName === "hiking" || iconName === "climb") return Mountain
  if (iconName === "wind" || iconName === "surf" || iconName === "board") return Wind
  if (iconName === "trophy" || iconName === "racket" || iconName === "tennis") return Trophy
  if (iconName === "heart" || iconName === "yoga" || iconName === "meditation") return Heart
  if (iconName === "target" || iconName === "archery" || iconName === "shooting") return Target

  // Slug-based fallbacks
  if (slug.includes("run") || slug.includes("jog") || slug.includes("marathon")) return Footprints
  if (slug.includes("cycle") || slug.includes("bike") || slug.includes("cycling")) return Bike
  if (slug.includes("swim")) return Waves
  if (slug.includes("ski") || slug.includes("snow") || slug.includes("ice") || slug.includes("skate")) return Snowflake
  if (slug.includes("climb") || slug.includes("boulder") || slug.includes("hike") || slug.includes("mountain")) return Mountain
  if (slug.includes("box") || slug.includes("mma") || slug.includes("martial") || slug.includes("fight")) return Shield
  if (slug.includes("yoga") || slug.includes("pilates") || slug.includes("meditation")) return Heart
  if (slug.includes("surf") || slug.includes("paddle") || slug.includes("kayak")) return Wind
  if (slug.includes("tennis") || slug.includes("badminton") || slug.includes("squash") || slug.includes("racket")) return Trophy
  if (slug.includes("football") || slug.includes("soccer") || slug.includes("basketball") || slug.includes("volleyball")) return Users
  if (slug.includes("weight") || slug.includes("gym") || slug.includes("crossfit") || slug.includes("strength")) return Dumbbell
  if (slug.includes("triathlon") || slug.includes("duathlon")) return Target

  return Circle
}

interface SportGlyphProps {
  sport: SportLike
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
}

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function SportGlyph({ sport, className, size = "md" }: SportGlyphProps) {
  const Icon = pickIcon(sport)

  return (
    <div
      className={cn(
        "shrink-0 rounded-xl border bg-white shadow-sm flex items-center justify-center",
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      <Icon className={cn("text-muted-foreground", iconSizes[size])} />
    </div>
  )
}
