/**
 * Sport Media Registry
 *
 * Single source of truth for sport-specific images.
 * Maps sport keys/slugs to hero and thumbnail images.
 *
 * Uses Unsplash images that are already allowlisted in next.config.ts
 * to ensure reliability across all environments.
 */

export type SportMedia = {
  /** Wide banner image for hero sections */
  heroSrc: string
  /** Square thumbnail for chips/badges */
  thumbSrc: string
  /** Accent color variant for theming */
  accent: "primary" | "secondary" | "water" | "outdoor" | "strength" | "neutral"
  /** Sport category for grouping */
  category: string
}

// High-quality Unsplash images for each sport
// All URLs are already allowlisted in next.config.ts
const SPORT_MEDIA_REGISTRY: Record<string, SportMedia> = {
  // Water Sports
  kitesurfing: {
    heroSrc: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },
  surfing: {
    heroSrc: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },
  swimming: {
    heroSrc: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },
  sup: {
    heroSrc: "https://images.unsplash.com/photo-1526188717906-ab4a2f949f0d?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1526188717906-ab4a2f949f0d?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },
  kayaking: {
    heroSrc: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },
  sailing: {
    heroSrc: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },
  windsurfing: {
    heroSrc: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "water",
  },

  // Endurance Sports
  running: {
    heroSrc: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "endurance",
  },
  trailrunning: {
    heroSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=200&q=80",
    accent: "outdoor",
    category: "endurance",
  },
  cycling: {
    heroSrc: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "endurance",
  },
  mountainbiking: {
    heroSrc: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=200&q=80",
    accent: "outdoor",
    category: "endurance",
  },
  triathlon: {
    heroSrc: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "endurance",
  },

  // Outdoor/Adventure
  hiking: {
    heroSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=200&q=80",
    accent: "outdoor",
    category: "outdoor",
  },
  climbing: {
    heroSrc: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=200&q=80",
    accent: "outdoor",
    category: "outdoor",
  },
  bouldering: {
    heroSrc: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=200&q=80",
    accent: "outdoor",
    category: "outdoor",
  },

  // Winter Sports
  skiing: {
    heroSrc: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "winter",
  },
  snowboarding: {
    heroSrc: "https://images.unsplash.com/photo-1478700823809-50c28f8e2c7b?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1478700823809-50c28f8e2c7b?auto=format&fit=crop&w=200&q=80",
    accent: "water",
    category: "winter",
  },

  // Racket Sports
  tennis: {
    heroSrc: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "racket",
  },
  padel: {
    heroSrc: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "racket",
  },
  badminton: {
    heroSrc: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "racket",
  },

  // Team Sports
  football: {
    heroSrc: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "team",
  },
  soccer: {
    heroSrc: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "team",
  },
  basketball: {
    heroSrc: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "team",
  },
  volleyball: {
    heroSrc: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=200&q=80",
    accent: "primary",
    category: "team",
  },

  // Strength & Fitness
  gym: {
    heroSrc: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "strength",
  },
  strength: {
    heroSrc: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "strength",
  },
  weightlifting: {
    heroSrc: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "strength",
  },
  crossfit: {
    heroSrc: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "strength",
  },
  calisthenics: {
    heroSrc: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "strength",
  },

  // Mind & Body
  yoga: {
    heroSrc: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=200&q=80",
    accent: "secondary",
    category: "mindbody",
  },
  pilates: {
    heroSrc: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=200&q=80",
    accent: "secondary",
    category: "mindbody",
  },

  // Combat Sports
  boxing: {
    heroSrc: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "combat",
  },
  mma: {
    heroSrc: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=200&q=80",
    accent: "strength",
    category: "combat",
  },

  // Other Sports
  golf: {
    heroSrc: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=200&q=80",
    accent: "outdoor",
    category: "other",
  },
  skateboarding: {
    heroSrc: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=200&q=80",
    accent: "secondary",
    category: "other",
  },
  dance: {
    heroSrc: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=200&q=80",
    accent: "secondary",
    category: "other",
  },

  // Generic fallback
  generic: {
    heroSrc: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80",
    thumbSrc: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=200&q=80",
    accent: "neutral",
    category: "generic",
  },
}

// Aliases for common variations
const SPORT_ALIASES: Record<string, string> = {
  // Kitesurfing variations
  "kite surfing": "kitesurfing",
  "kite-surfing": "kitesurfing",
  "kiteboarding": "kitesurfing",
  "kite boarding": "kitesurfing",

  // Running variations
  "trail running": "trailrunning",
  "trail-running": "trailrunning",

  // Cycling variations
  "road cycling": "cycling",
  "road-cycling": "cycling",
  "mountain biking": "mountainbiking",
  "mountain-biking": "mountainbiking",
  "mtb": "mountainbiking",

  // Strength variations
  "weights": "strength",
  "weight training": "strength",
  "gym workout": "gym",
  "fitness": "gym",
  "workout": "gym",

  // Swimming variations
  "open water swimming": "swimming",
  "open-water-swimming": "swimming",
  "pool swimming": "swimming",

  // SUP variations
  "stand up paddle": "sup",
  "stand-up-paddle": "sup",
  "paddleboarding": "sup",

  // Combat variations
  "martial arts": "mma",
  "jiu-jitsu": "mma",
  "bjj": "mma",
  "judo": "mma",
  "karate": "mma",
  "taekwondo": "mma",

  // Team sports
  "football (soccer)": "football",
  "american football": "football",
  "beach volleyball": "volleyball",

  // Other
  "rock climbing": "climbing",
  "ice skating": "skiing",
  "cross-country skiing": "skiing",
}

/**
 * Normalizes a sport key for lookup.
 * Handles various input formats: labels, slugs, enums.
 */
function normalizeSportKey(sportKey: string): string {
  // Lowercase and trim
  let normalized = sportKey.toLowerCase().trim()

  // Remove diacritics
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // Check aliases first (before removing special chars)
  if (SPORT_ALIASES[normalized]) {
    return SPORT_ALIASES[normalized]
  }

  // Remove spaces and hyphens for matching
  const condensed = normalized.replace(/[\s-]/g, "")

  // Check condensed form in registry
  if (SPORT_MEDIA_REGISTRY[condensed]) {
    return condensed
  }

  // Check aliases with condensed form
  for (const [alias, target] of Object.entries(SPORT_ALIASES)) {
    if (alias.replace(/[\s-]/g, "") === condensed) {
      return target
    }
  }

  // Return as-is if we can't normalize further
  return condensed
}

/**
 * Gets media assets for a sport.
 *
 * @param sportKey - Sport name, slug, or key. Can be any format.
 * @returns SportMedia object with hero and thumbnail URLs
 *
 * @example
 * getSportMedia("Kitesurfing") // Returns kitesurfing images
 * getSportMedia("kite surfing") // Returns kitesurfing images
 * getSportMedia("gym") // Returns gym/strength images
 * getSportMedia(null) // Returns generic fallback
 */
export function getSportMedia(sportKey?: string | null): SportMedia {
  if (!sportKey) {
    return SPORT_MEDIA_REGISTRY.generic
  }

  const normalized = normalizeSportKey(sportKey)
  return SPORT_MEDIA_REGISTRY[normalized] ?? SPORT_MEDIA_REGISTRY.generic
}

/**
 * Gets just the hero image URL for a sport.
 * Convenience function for hero banners.
 */
export function getSportHeroImage(sportKey?: string | null): string {
  return getSportMedia(sportKey).heroSrc
}

/**
 * Gets just the thumbnail URL for a sport.
 * Convenience function for chips/badges.
 */
export function getSportThumbImage(sportKey?: string | null): string {
  return getSportMedia(sportKey).thumbSrc
}

/**
 * Checks if we have a specific image for this sport.
 * Returns false if it would fall back to generic.
 */
export function hasSportMedia(sportKey?: string | null): boolean {
  if (!sportKey) return false
  const normalized = normalizeSportKey(sportKey)
  return normalized in SPORT_MEDIA_REGISTRY && normalized !== "generic"
}
