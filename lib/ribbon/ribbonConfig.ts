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
  | "GLOBAL_RANK"        // User's global rank for their primary sport
  | "SPORT_INDEX"        // Overall Sport Index score (0-1000)
  | "MULTISPORT_INDEX"   // MultiSport Index (Podium Points)
  | "POWER"              // Total power earned in range
  | "SESSIONS"           // Number of workout sessions
  | "ACTIVITIES"         // Activity count (alias for sessions in most contexts)
  | "ACTIVE_TIME"        // Total active time in range
  | "DISTANCE"           // Total distance (for GPS sports)
  | "ELEVATION"          // Total elevation gain (for outdoor/endurance)
  | "DAYS_ACTIVE"        // Unique days with activities
  | "VARIETY"            // Number of distinct sports practiced (MultiSport)
  | "ELO"                // ELO rating (for competitive sports)
  | "WIN_RATE"           // Win percentage (team/combat/racket sports)
  | "STREAK"             // Current day streak
  | "PR_COUNT"           // Personal records achieved in range
  | "VOLUME"             // Total volume/tonnage (strength sports)
  | "AVG_PACE"           // Average pace (endurance sports)
  | "AVG_HEART_RATE"     // Average heart rate
  | "CALORIES"           // Total calories burned
  // V11: Vanity Metrics
  | "MAX_JUMP"           // Kitesurfing: max jump height
  | "AIRTIME"            // Kitesurfing: total airtime
  | "MAX_SPEED"          // Top speed (water/winter sports)
  | "VERTICAL"           // Skiing/snowboarding: vertical descent
  | "LONGEST_RIDE"       // Surfing: longest wave ride
  | "STOKE_SCORE"        // Surfing: session rating
  | "POWER_WKG"          // Cycling: 20min power W/kg
  | "PACE_5K"            // Running: best 5K pace
  | "PYRAMID_SCORE"      // Climbing: pyramid top-5 points
  | "HARDEST_GRADE"      // Climbing: hardest grade
  | "STRENGTH_INDEX"     // Gym: composite strength score
  | "TONNAGE"            // Gym: total weight moved
  | "BENCHMARK_WOD"      // CrossFit: best benchmark WOD
  | "MATCHES"            // Team sports: matches played

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
  // V11: Vanity Metrics
  MULTISPORT_INDEX: {
    key: "MULTISPORT_INDEX",
    label: "MultiSport",
    format: "score",
  },
  MAX_JUMP: {
    key: "MAX_JUMP",
    label: "Max Jump",
    unit: "m",
    format: "float1",
  },
  AIRTIME: {
    key: "AIRTIME",
    label: "Airtime",
    format: "duration",
  },
  MAX_SPEED: {
    key: "MAX_SPEED",
    label: "Max Speed",
    unit: "km/h",
    format: "float1",
  },
  VERTICAL: {
    key: "VERTICAL",
    label: "Vert",
    unit: "m",
    format: "int",
  },
  LONGEST_RIDE: {
    key: "LONGEST_RIDE",
    label: "Best Ride",
    format: "duration",
  },
  STOKE_SCORE: {
    key: "STOKE_SCORE",
    label: "Stoke",
    format: "int",
  },
  POWER_WKG: {
    key: "POWER_WKG",
    label: "20m Power",
    unit: "W/kg",
    format: "float1",
  },
  PACE_5K: {
    key: "PACE_5K",
    label: "5K Pace",
    format: "pace",
  },
  PYRAMID_SCORE: {
    key: "PYRAMID_SCORE",
    label: "Pyramid",
    format: "int",
  },
  HARDEST_GRADE: {
    key: "HARDEST_GRADE",
    label: "Hardest",
    format: "int", // Will be formatted as grade string
  },
  STRENGTH_INDEX: {
    key: "STRENGTH_INDEX",
    label: "Strength",
    format: "score",
  },
  TONNAGE: {
    key: "TONNAGE",
    label: "Tonnage",
    unit: "kg",
    format: "int",
  },
  BENCHMARK_WOD: {
    key: "BENCHMARK_WOD",
    label: "Benchmark",
    format: "duration",
  },
  MATCHES: {
    key: "MATCHES",
    label: "Matches",
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
 * V11: Primary metric is now MULTISPORT_INDEX (Podium Points)
 */
export const MULTISPORT_CONFIG: RibbonConfig = [
  METRIC.GLOBAL_RANK,
  METRIC.MULTISPORT_INDEX,  // V11: Podium Points score
  METRIC.VARIETY,           // Number of sports practiced
  METRIC.DAYS_ACTIVE,
  METRIC.ACTIVE_TIME,
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
  // V11: Primary vanity metric is pace or distance
  ENDURANCE: [
    METRIC.GLOBAL_RANK,
    METRIC.PACE_5K,        // V11: Vanity metric - best pace
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // CYCLING: Power-focused with distance/elevation
  // V11: Primary vanity metric is W/kg
  CYCLING: [
    METRIC.GLOBAL_RANK,
    METRIC.POWER_WKG,      // V11: Vanity metric - 20min power W/kg
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
  ],

  // SWIMMING: Duration-focused, no GPS
  SWIMMING: [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary for swimming
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // STRENGTH: Volume and session focused
  // V11: Primary vanity metric is strength index or tonnage
  STRENGTH: [
    METRIC.GLOBAL_RANK,
    METRIC.STRENGTH_INDEX, // V11: Vanity metric - composite strength
    METRIC.TONNAGE,        // V11: Total weight moved
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // TEAM: Match-based, win rate matters
  // V11: Primary vanity metric is matches played
  TEAM: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,        // V11: Vanity metric - matches played
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // RACKET: Match-based competitive sports
  // V11: Primary vanity metric is matches
  RACKET: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,        // V11: Vanity metric - matches played
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // COMBAT: Session and intensity focused
  COMBAT: [
    METRIC.GLOBAL_RANK,
    METRIC.SESSIONS,       // Primary for combat sports
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.DAYS_ACTIVE,
  ],

  // WATER_BOARD: Session-based board/water sports (kitesurfing, surfing, etc.)
  // V11: Primary vanity metric is max jump or max speed
  WATER_BOARD: [
    METRIC.GLOBAL_RANK,
    METRIC.MAX_JUMP,       // V11: Vanity metric - max jump height
    METRIC.AIRTIME,        // V11: Total airtime
    METRIC.MAX_SPEED,      // V11: Top speed
    METRIC.SESSIONS,
  ],

  // OUTDOOR: Hiking, climbing - elevation matters
  // V11: Primary vanity metric is pyramid score for climbing
  OUTDOOR: [
    METRIC.GLOBAL_RANK,
    METRIC.ELEVATION,      // Primary for outdoor
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // WINTER: Vertical descent is the brag metric
  // V11: Primary vanity metric is vertical
  WINTER: [
    METRIC.GLOBAL_RANK,
    METRIC.VERTICAL,       // V11: Vanity metric - vertical descent
    METRIC.MAX_SPEED,      // V11: Top speed
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // MINDBODY: Yoga, pilates - consistency matters
  MINDBODY: [
    METRIC.GLOBAL_RANK,
    METRIC.DAYS_ACTIVE,    // Primary for mind/body
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.SESSIONS,
  ],

  // GENERIC: For MultiSport and general-purpose
  GENERIC: MULTISPORT_CONFIG,
}

// =============================================================================
// SPORT-SPECIFIC OVERRIDES
// =============================================================================

/**
 * Sport-specific configurations (by slug)
 *
 * V11 VANITY METRICS: Each sport shows its "brag" metric as Tile 2
 * Format: [GLOBAL_RANK, primaryMetric, ...secondaryMetrics]
 */
export const SPORT_OVERRIDES: Record<string, RibbonConfig> = {
  // ========== MULTISPORT ==========
  multisport: MULTISPORT_CONFIG,

  // ========== ENDURANCE ==========
  // Running: Brag = 5K pace (how fast can you run?)
  running: [
    METRIC.GLOBAL_RANK,
    METRIC.PACE_5K,        // V11: Vanity metric - best 5K pace
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Trail Running: Brag = distance (how far can you go?)
  "trail-running": [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary: total distance
    METRIC.ELEVATION,      // Secondary: elevation gain
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // Cycling: Brag = W/kg (how much power can you push?)
  cycling: [
    METRIC.GLOBAL_RANK,
    METRIC.POWER_WKG,      // V11: Vanity metric - 20min power W/kg
    METRIC.DISTANCE,
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
  ],

  // Mountain Biking: Brag = distance with elevation
  "mountain-biking": [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary: total distance
    METRIC.ELEVATION,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // Swimming: Brag = distance (how many laps/meters?)
  swimming: [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary: distance covered
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Triathlon: Multi-sport variety matters
  triathlon: [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary: total distance
    METRIC.VARIETY,        // Sports practiced
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // ========== WATER SPORTS ==========
  // Kitesurfing: Brag = Max Jump Height (how high can you fly?)
  kitesurfing: [
    METRIC.GLOBAL_RANK,
    METRIC.MAX_JUMP,       // V11: Vanity metric - max jump height (sensor only)
    METRIC.AIRTIME,        // Total airtime
    METRIC.MAX_SPEED,      // Top speed
    METRIC.SESSIONS,
  ],

  // Surfing: Brag = Stoke Score / Session Rating
  surfing: [
    METRIC.GLOBAL_RANK,
    METRIC.STOKE_SCORE,    // V11: Vanity metric - session rating
    METRIC.LONGEST_RIDE,   // Best wave ride duration
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // Windsurfing: Brag = Max Speed
  windsurfing: [
    METRIC.GLOBAL_RANK,
    METRIC.MAX_SPEED,      // V11: Vanity metric - top speed
    METRIC.SESSIONS,
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
  ],

  // SUP: Consistency matters
  sup: [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary: distance paddled
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DAYS_ACTIVE,
  ],

  // ========== WINTER SPORTS ==========
  // Skiing: Brag = Vertical Descent (how much vert did you ski?)
  skiing: [
    METRIC.GLOBAL_RANK,
    METRIC.VERTICAL,       // V11: Vanity metric - vertical descent
    METRIC.MAX_SPEED,      // Top speed
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // Snowboarding: Same as skiing - Vert is king
  snowboarding: [
    METRIC.GLOBAL_RANK,
    METRIC.VERTICAL,       // V11: Vanity metric - vertical descent
    METRIC.MAX_SPEED,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // Cross-Country Skiing: Endurance focused
  "cross-country-skiing": [
    METRIC.GLOBAL_RANK,
    METRIC.DISTANCE,       // Primary: distance covered
    METRIC.ELEVATION,
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // ========== STRENGTH ==========
  // Gym/Strength: Brag = Strength Index or Tonnage
  "gym-strength": [
    METRIC.GLOBAL_RANK,
    METRIC.STRENGTH_INDEX, // V11: Vanity metric - composite strength score
    METRIC.TONNAGE,        // Total weight moved
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // CrossFit: Brag = Benchmark WOD Time
  crossfit: [
    METRIC.GLOBAL_RANK,
    METRIC.BENCHMARK_WOD,  // V11: Vanity metric - best benchmark time
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.VARIETY,
  ],

  // Olympic Weightlifting: Brag = Total lifted
  weightlifting: [
    METRIC.GLOBAL_RANK,
    METRIC.TONNAGE,        // V11: Vanity metric - total tonnage (Sinclair coming)
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.PR_COUNT,
  ],

  // ========== RACKET SPORTS ==========
  // Tennis: Brag = Matches played
  tennis: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,        // V11: Vanity metric - matches played
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Padel: Same as tennis
  padel: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,        // V11: Vanity metric - matches played
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Badminton
  badminton: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Squash
  squash: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Table Tennis
  "table-tennis": [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Pickleball
  pickleball: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // ========== TEAM SPORTS ==========
  // Football/Soccer: Brag = Matches played
  football: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,        // V11: Vanity metric - matches played
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.DISTANCE,
  ],

  // Basketball
  basketball: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,        // V11: Vanity metric - matches played
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Volleyball
  volleyball: [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // Beach Volleyball
  "beach-volleyball": [
    METRIC.GLOBAL_RANK,
    METRIC.MATCHES,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
  ],

  // ========== OUTDOOR ==========
  // Hiking: Elevation is the brag
  hiking: [
    METRIC.GLOBAL_RANK,
    METRIC.ELEVATION,      // V11: Vanity metric - total elevation gain
    METRIC.DISTANCE,
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // Climbing: Brag = Pyramid Score (hardest climbs)
  climbing: [
    METRIC.GLOBAL_RANK,
    METRIC.PYRAMID_SCORE,  // V11: Vanity metric - pyramid top-5 points
    METRIC.HARDEST_GRADE,  // Hardest grade sent
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
  ],

  // Bouldering: Same as climbing
  bouldering: [
    METRIC.GLOBAL_RANK,
    METRIC.PYRAMID_SCORE,  // V11: Vanity metric - pyramid points
    METRIC.HARDEST_GRADE,
    METRIC.SESSIONS,
    METRIC.DAYS_ACTIVE,
  ],

  // ========== MIND & BODY ==========
  // Yoga: Consistency is key
  yoga: [
    METRIC.GLOBAL_RANK,
    METRIC.DAYS_ACTIVE,    // Primary: consistency
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.SESSIONS,
  ],

  // Pilates: Same as yoga
  pilates: [
    METRIC.GLOBAL_RANK,
    METRIC.DAYS_ACTIVE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.SESSIONS,
  ],

  // Meditation
  meditation: [
    METRIC.GLOBAL_RANK,
    METRIC.STREAK,         // Primary: how many days in a row?
    METRIC.DAYS_ACTIVE,
    METRIC.ACTIVE_TIME,
    METRIC.SESSIONS,
  ],

  // Stretching
  stretching: [
    METRIC.GLOBAL_RANK,
    METRIC.DAYS_ACTIVE,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.SESSIONS,
  ],

  // ========== COMBAT ==========
  // Boxing: Sessions and training time
  boxing: [
    METRIC.GLOBAL_RANK,
    METRIC.SESSIONS,       // Primary: training frequency
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.DAYS_ACTIVE,
  ],

  // MMA: Same as boxing
  mma: [
    METRIC.GLOBAL_RANK,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.DAYS_ACTIVE,
  ],

  // Jiu-Jitsu/BJJ
  "jiu-jitsu": [
    METRIC.GLOBAL_RANK,
    METRIC.SESSIONS,
    METRIC.ACTIVE_TIME,
    METRIC.STREAK,
    METRIC.DAYS_ACTIVE,
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
