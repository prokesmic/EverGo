/**
 * Ribbon Metrics Configuration Registry
 *
 * SINGLE SOURCE OF TRUTH for sport-aware ribbon metrics.
 *
 * The ribbon shows 5 tiles. Tile #1 is ALWAYS Global Rank.
 * Remaining 4 tiles depend on user's primary sport.
 *
 * Resolution order:
 * 1. Sport-specific override (e.g., "kitesurfing")
 * 2. Category default (e.g., "WATER")
 * 3. Universal fallback
 */

import type { SportCategory } from "@prisma/client"

// =============================================================================
// TYPES
// =============================================================================

export type RibbonRange = "week" | "month" | "year" | "all"

/**
 * Stable internal keys for ribbon metrics.
 * These map to data fields and determine what gets computed/displayed.
 */
export type RibbonMetricKey =
  | "GLOBAL_RANK"      // User's global rank for their primary sport
  | "SPORT_INDEX"      // Overall Sport Index score (0-1000)
  | "POWER"            // Total power earned in range
  | "SESSIONS"         // Number of workout sessions
  | "ACTIVITIES"       // Activity count (alias for sessions in most contexts)
  | "ACTIVE_TIME"      // Total active time in range
  | "DISTANCE"         // Total distance (for GPS sports)
  | "ELEVATION"        // Total elevation gain (for outdoor/endurance)
  | "DAYS_ACTIVE"      // Unique days with activities
  | "VARIETY"          // Number of distinct sports practiced (MultiSport)
  | "ELO"              // ELO rating (for competitive sports)
  | "WIN_RATE"         // Win percentage (team/combat/racket sports)
  | "STREAK"           // Current day streak
  | "PR_COUNT"         // Personal records achieved in range
  | "VOLUME"           // Total volume/tonnage (strength sports)
  | "AVG_PACE"         // Average pace (endurance sports)
  | "AVG_HEART_RATE"   // Average heart rate
  | "CALORIES"         // Total calories burned

/**
 * Format types for displaying metric values
 */
export type MetricFormat =
  | "int"        // 1234
  | "float1"     // 123.4
  | "duration"   // 2h 45m
  | "pace"       // 5:30/km
  | "percent"    // 85%
  | "rank"       // #123
  | "score"      // 847/1000
  | "distance"   // 42.5 km

/**
 * UI descriptor for a single ribbon metric tile
 */
export type RibbonMetricDescriptor = {
  key: RibbonMetricKey
  label: string
  unit?: string  // "km" | "m" | "min" | "days" | "%" | etc.
  format: MetricFormat
  /** Fallback keys if primary data is unavailable */
  fallback?: RibbonMetricKey[]
}

/**
 * Complete ribbon configuration (5 tiles)
 */
export type RibbonConfig = [
  RibbonMetricDescriptor,  // Tile 1: ALWAYS Global Rank
  RibbonMetricDescriptor,  // Tile 2
  RibbonMetricDescriptor,  // Tile 3
  RibbonMetricDescriptor,  // Tile 4
  RibbonMetricDescriptor   // Tile 5
]

// =============================================================================
// METRIC DESCRIPTORS (REUSABLE)
// =============================================================================

const METRIC = {
  GLOBAL_RANK: {
    key: "GLOBAL_RANK",
    label: "Global Rank",
    format: "rank",
  },
  SPORT_INDEX: {
    key: "SPORT_INDEX",
    label: "Sport Index",
    format: "score",
  },
  POWER: {
    key: "POWER",
    label: "Power",
    format: "int",
  },
  ACTIVITIES: {
    key: "ACTIVITIES",
    label: "Activities",
    format: "int",
  },
  SESSIONS: {
    key: "SESSIONS",
    label: "Sessions",
    format: "int",
  },
  ACTIVE_TIME: {
    key: "ACTIVE_TIME",
    label: "Active Time",
    format: "duration",
  },
  DISTANCE: {
    key: "DISTANCE",
    label: "Distance",
    unit: "km",
    format: "distance",
  },
  ELEVATION: {
    key: "ELEVATION",
    label: "Elevation",
    unit: "m",
    format: "int",
  },
  DAYS_ACTIVE: {
    key: "DAYS_ACTIVE",
    label: "Days Active",
    unit: "days",
    format: "int",
  },
  VARIETY: {
    key: "VARIETY",
    label: "Sports",
    format: "int",
  },
  STREAK: {
    key: "STREAK",
    label: "Streak",
    unit: "days",
    format: "int",
  },
  WIN_RATE: {
    key: "WIN_RATE",
    label: "Win Rate",
    unit: "%",
    format: "percent",
  },
  ELO: {
    key: "ELO",
    label: "ELO",
    format: "int",
  },
  PR_COUNT: {
    key: "PR_COUNT",
    label: "PRs",
    format: "int",
  },
  VOLUME: {
    key: "VOLUME",
    label: "Volume",
    unit: "kg",
    format: "int",
  },
  AVG_PACE: {
    key: "AVG_PACE",
    label: "Avg Pace",
    format: "pace",
  },
  CALORIES: {
    key: "CALORIES",
    label: "Calories",
    unit: "kcal",
    format: "int",
  },
  AVG_HEART_RATE: {
    key: "AVG_HEART_RATE",
    label: "Avg HR",
    unit: "bpm",
    format: "int",
  },
} as const satisfies Record<RibbonMetricKey, RibbonMetricDescriptor>

// =============================================================================
// UNIVERSAL FALLBACK
// =============================================================================

/**
 * Default configuration when no sport-specific or category override exists
 */
export const UNIVERSAL_FALLBACK: RibbonConfig = [
  METRIC.GLOBAL_RANK,
  METRIC.SPORT_INDEX,
  METRIC.ACTIVITIES,
  METRIC.ACTIVE_TIME,
  METRIC.POWER,
]

// =============================================================================
// MULTISPORT DEFAULT
// =============================================================================

/**
 * MultiSport users see variety-focused metrics
 */
export const MULTISPORT_CONFIG: RibbonConfig = [
  METRIC.GLOBAL_RANK,
  METRIC.SPORT_INDEX,
  METRIC.DAYS_ACTIVE,
  METRIC.ACTIVE_TIME,
  METRIC.VARIETY,
]

// =============================================================================
// CATEGORY DEFAULTS
// =============================================================================

/**
 * Default configurations by sport category.
 * Uses Prisma SportCategory enum values: ENDURANCE, CYCLING, SWIMMING, STRENGTH,
 * TEAM, RACKET, COMBAT, WATER_BOARD, OUTDOOR, WINTER, MINDBODY, GENERIC
 */
export const CATEGORY_DEFAULTS: Partial<Record<SportCategory, RibbonConfig>> = {
  // ENDURANCE: Distance-focused sports (running, triathlon, etc.)
  ENDURANCE: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.ELEVATION,
  ],

  // CYCLING: Similar to endurance but always has distance/elevation
  CYCLING: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
  ],

  // SWIMMING: Duration-focused, no GPS
  SWIMMING: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // STRENGTH: Volume and session focused
  STRENGTH: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  // TEAM: Match-based, win rate matters
  TEAM: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  // RACKET: Match-based competitive sports
  RACKET: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  // COMBAT: Session and intensity focused
  COMBAT: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  // WATER_BOARD: Session-based board/water sports (kitesurfing, surfing, etc.)
  WATER_BOARD: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DISTANCE,
  ],

  // OUTDOOR: Hiking, climbing - elevation matters
  OUTDOOR: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
  ],

  // WINTER: Similar to endurance, elevation matters
  WINTER: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.SESSIONS,
  ],

  // MINDBODY: Yoga, pilates - consistency matters
  MINDBODY: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DAYS_ACTIVE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // GENERIC: For MultiSport and general-purpose
  GENERIC: MULTISPORT_CONFIG,
}

// =============================================================================
// SPORT-SPECIFIC OVERRIDES
// =============================================================================

/**
 * Sport-specific configurations (by slug)
 * These override category defaults when more specific metrics make sense.
 */
export const SPORT_OVERRIDES: Record<string, RibbonConfig> = {
  // ========== MULTISPORT ==========
  multisport: MULTISPORT_CONFIG,

  // ========== ENDURANCE ==========
  running: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  cycling: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
  ],

  swimming: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  triathlon: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.VARIETY,
  ],

  // ========== WATER SPORTS ==========
  kitesurfing: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DISTANCE,
  ],

  surfing: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DAYS_ACTIVE,
  ],

  windsurfing: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DISTANCE,
  ],

  // ========== WINTER SPORTS ==========
  skiing: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.SESSIONS,
  ],

  snowboarding: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.SESSIONS,
  ],

  "cross-country-skiing": [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.ELEVATION,
  ],

  // ========== STRENGTH ==========
  "gym-strength": [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  crossfit: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  weightlifting: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.PR_COUNT,
  ],

  // ========== RACKET SPORTS ==========
  tennis: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  padel: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  badminton: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  squash: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  // ========== TEAM SPORTS ==========
  football: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DISTANCE,
  ],

  basketball: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  volleyball: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  // ========== OUTDOOR ==========
  hiking: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
  ],

  climbing: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.ELEVATION,
  ],

  bouldering: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DAYS_ACTIVE,
  ],

  // ========== MIND & BODY ==========
  yoga: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DAYS_ACTIVE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  pilates: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.DAYS_ACTIVE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // ========== COMBAT ==========
  boxing: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  mma: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],

  judo: [
    METRIC.GLOBAL_RANK,
    METRIC.SPORT_INDEX,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.POWER,
  ],
}

// =============================================================================
// CONFIG RESOLVER
// =============================================================================

/**
 * Resolves the ribbon configuration for a given sport.
 *
 * Resolution order:
 * 1. Sport-specific override (by slug)
 * 2. Category default (by sport category)
 * 3. Universal fallback
 *
 * @param sportSlug - Normalized sport slug (e.g., "kitesurfing", "running")
 * @param sportCategory - Sport category from database
 * @returns 5-tile ribbon configuration
 */
export function resolveRibbonConfig(
  sportSlug: string | null,
  sportCategory: SportCategory | null
): RibbonConfig {
  // 1. Check sport-specific override
  if (sportSlug && SPORT_OVERRIDES[sportSlug]) {
    return SPORT_OVERRIDES[sportSlug]
  }

  // 2. Check category default
  if (sportCategory && CATEGORY_DEFAULTS[sportCategory]) {
    return CATEGORY_DEFAULTS[sportCategory]!
  }

  // 3. Universal fallback
  return UNIVERSAL_FALLBACK
}

/**
 * Get all available metric keys (for documentation/validation)
 */
export function getAllMetricKeys(): RibbonMetricKey[] {
  return Object.keys(METRIC) as RibbonMetricKey[]
}

/**
 * Get metric descriptor by key
 */
export function getMetricDescriptor(key: RibbonMetricKey): RibbonMetricDescriptor {
  return METRIC[key] ?? METRIC.POWER
}
