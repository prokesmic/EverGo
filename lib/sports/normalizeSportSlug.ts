/**
 * Normalizes sport names to canonical slugs for consistent hero image mapping.
 * This is the single source of truth for sport slug normalization.
 *
 * Examples:
 * - "Cycling" -> "cycling"
 * - "Road Cycling" -> "cycling"
 * - "Mountain Biking" -> "mountain-biking"
 * - "Kite Surfing" -> "kitesurfing"
 * - "Cross-country Skiing" -> "cross-country-skiing"
 */
export function normalizeSportSlug(input?: string | null): string | null {
  if (!input) return null

  const s = String(input).trim().toLowerCase()

  // Remove parentheses content: "Climbing (Sport)" -> "climbing"
  const noParens = s.replace(/\s*\(.*?\)\s*/g, "")

  // Normalize separators and special characters
  const slug = noParens
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "")

  // Canonical aliases - map variant names to their canonical form
  const alias: Record<string, string> = {
    // MultiSport variants
    "multi-sport": "multisport",
    "all-sports": "multisport",
    "multi": "multisport",
    "general": "multisport",
    "generic": "multisport",

    // Cycling variants
    "road-cycling": "cycling",
    "road-bike": "cycling",
    "bike": "cycling",
    "biking": "cycling",
    "mtb": "mountain-biking",
    "mountain-bike": "mountain-biking",
    "gravel": "cycling",
    "gravel-cycling": "cycling",
    "e-bike": "cycling",
    "ebike": "cycling",

    // Water sports
    "kite-surfing": "kitesurfing",
    "kiteboarding": "kitesurfing",
    "kite-board": "kitesurfing",
    "kite-boarding": "kitesurfing",
    "kite": "kitesurfing",
    "wind-surfing": "windsurfing",
    "wind-surf": "windsurfing",
    "stand-up-paddleboard": "sup",
    "stand-up-paddle": "sup",
    "paddleboard": "sup",
    "standup-paddle": "sup",
    "paddle-boarding": "sup",
    "paddleboarding": "sup",
    "open-water": "open-water-swimming",
    "open-water-swim": "open-water-swimming",
    "surf": "surfing",
    "longboard": "surfing",
    "shortboard": "surfing",
    "bodyboard": "surfing",
    "wakeboard": "wakeboarding",
    "wake": "wakeboarding",
    "kayak": "kayaking",
    "canoe": "kayaking",

    // Running variants
    "run": "running",
    "road-running": "running",
    "jogging": "running",
    "trail": "trail-running",
    "trail-run": "trail-running",
    "ultrarunning": "trail-running",
    "ultra-running": "trail-running",
    "ultra": "trail-running",

    // Winter sports - IMPORTANT: map all alpine variants to "skiing"
    "ski": "skiing",
    "alpine-skiing": "skiing",
    "downhill-skiing": "skiing",
    "alpine": "skiing",
    "downhill": "skiing",
    "skiing-alpine": "skiing",
    "skiing-downhill": "skiing",
    "resort-skiing": "skiing",
    "xc-skiing": "cross-country-skiing",
    "xc-ski": "cross-country-skiing",
    "nordic-skiing": "cross-country-skiing",
    "nordic": "cross-country-skiing",
    "classic-skiing": "cross-country-skiing",
    "skate-skiing": "cross-country-skiing",
    "snowboard": "snowboarding",
    "backcountry-skiing": "skiing",
    "backcountry": "skiing",
    "ski-touring": "skiing",

    // Team sports
    "soccer": "football",
    "football-soccer": "football",
    "futsal": "football",
    "beach-volley": "beach-volleyball",
    "ice-hockey": "hockey",
    "field-hockey": "hockey",

    // Racket sports
    "ping-pong": "table-tennis",
    "pingpong": "table-tennis",
    "pickle-ball": "pickleball",

    // Combat sports
    "brazilian-jiu-jitsu": "jiu-jitsu",
    "bjj": "jiu-jitsu",
    "judo": "jiu-jitsu",
    "mixed-martial-arts": "mma",
    "muay-thai": "mma",
    "kickboxing": "boxing",
    "martial-arts": "mma",

    // Strength - map to gym-strength
    "weight-training": "gym-strength",
    "weights": "gym-strength",
    "strength-training": "gym-strength",
    "resistance-training": "gym-strength",
    "bodybuilding": "gym-strength",
    "gym": "gym-strength",
    "strength": "gym-strength",
    "powerlifting": "gym-strength",
    "functional-training": "crossfit",
    "functional-fitness": "crossfit",
    "hiit": "crossfit",
    "circuit-training": "crossfit",
    "olympic-weightlifting": "weightlifting",
    "oly-lifting": "weightlifting",

    // Mind & body
    "mindfulness": "meditation",
    "breathwork": "meditation",
    "stretch": "stretching",
    "mobility": "stretching",
    "flexibility": "stretching",
    "yin-yoga": "yoga",
    "vinyasa": "yoga",
    "hot-yoga": "yoga",
    "ashtanga": "yoga",

    // Outdoor / Climbing
    "hike": "hiking",
    "trekking": "hiking",
    "backpacking": "hiking",
    "mountaineering": "climbing",
    "rock-climbing": "climbing",
    "sport-climbing": "climbing",
    "trad-climbing": "climbing",
    "lead-climbing": "climbing",
    "top-rope": "climbing",
    "indoor-climbing": "climbing",
    "boulder": "bouldering",

    // Triathlon
    "tri": "triathlon",
    "ironman": "triathlon",
    "70-3": "triathlon",
    "half-ironman": "triathlon",
    "sprint-triathlon": "triathlon",
    "olympic-triathlon": "triathlon",
  }

  return alias[slug] ?? slug
}

/**
 * Converts a sport name to a URL-safe slug (without canonical mapping).
 * Use this for URL generation where you want to preserve the original sport.
 */
export function sportToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
