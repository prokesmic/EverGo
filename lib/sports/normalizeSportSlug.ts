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

    // Cycling variants
    "road-cycling": "cycling",
    "road-bike": "cycling",
    "bike": "cycling",
    "biking": "cycling",
    "mtb": "mountain-biking",
    "mountain-bike": "mountain-biking",

    // Water sports
    "kite-surfing": "kitesurfing",
    "kiteboarding": "kitesurfing",
    "kite-board": "kitesurfing",
    "kite-boarding": "kitesurfing",
    "wind-surfing": "windsurfing",
    "wind-surf": "windsurfing",
    "stand-up-paddleboard": "sup",
    "stand-up-paddle": "sup",
    "paddleboard": "sup",
    "standup-paddle": "sup",
    "open-water": "open-water-swimming",
    "open-water-swim": "open-water-swimming",

    // Running variants
    "run": "running",
    "road-running": "running",
    "jogging": "running",
    "trail": "trail-running",
    "trail-run": "trail-running",
    "ultrarunning": "trail-running",
    "ultra-running": "trail-running",

    // Winter sports
    "ski": "skiing",
    "alpine-skiing": "skiing",
    "downhill-skiing": "skiing",
    "xc-skiing": "cross-country-skiing",
    "xc-ski": "cross-country-skiing",
    "nordic-skiing": "cross-country-skiing",
    "snowboard": "snowboarding",

    // Team sports
    "soccer": "football",
    "beach-volley": "beach-volleyball",
    "ice-hockey": "hockey",
    "field-hockey": "hockey",

    // Racket sports
    "ping-pong": "table-tennis",
    "pingpong": "table-tennis",

    // Combat sports
    "brazilian-jiu-jitsu": "jiu-jitsu",
    "bjj": "jiu-jitsu",
    "mixed-martial-arts": "mma",
    "muay-thai": "mma",
    "kickboxing": "boxing",

    // Strength
    "weight-training": "gym",
    "weights": "gym",
    "strength-training": "gym",
    "resistance-training": "gym",
    "bodybuilding": "gym",
    "functional-training": "crossfit",
    "functional-fitness": "crossfit",

    // Mind & body
    "mindfulness": "meditation",
    "breathwork": "meditation",
    "stretch": "stretching",
    "mobility": "stretching",

    // Outdoor
    "hike": "hiking",
    "trekking": "hiking",
    "backpacking": "hiking",
    "mountaineering": "climbing",
    "rock-climbing": "climbing",
    "sport-climbing": "climbing",

    // Triathlon
    "tri": "triathlon",
    "ironman": "triathlon",
    "70-3": "triathlon",
    "half-ironman": "triathlon",
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
