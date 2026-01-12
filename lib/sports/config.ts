/**
 * Sports Configuration Registry - Single Source of Truth
 *
 * This file defines the "Vanity Metrics" each sport brags about:
 * - primaryMetric: The main metric displayed prominently (hero number + default leaderboard)
 * - secondaryMetrics: Additional metrics shown in ribbon
 * - rankingMetrics: All available metrics with sensor requirements and formatting
 *
 * KEY PRINCIPLE: Sensor-required metrics can ONLY be earned from sensor sources
 * (Strava, Garmin, file upload), not from manual entry.
 *
 * The "Three Lens" categories:
 * - PERFORMANCE: Competitive endurance/speed sports (running, cycling, skiing)
 * - TEAM: Team-based sports with matches/games
 * - MINDBODY: Yoga, pilates, meditation - consistency matters
 * - ADVENTURE: Outdoor/exploration (hiking, climbing, water sports)
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Metric type classification
 */
export type MetricType = "PERFORMANCE" | "VOLUME" | "CONSISTENCY" | "SKILL"

/**
 * Display format for metric values
 */
export type FormatType =
  | "TIME"     // MM:SS or HH:MM:SS
  | "DISTANCE" // km with decimals
  | "SPEED"    // km/h
  | "POWER"    // watts or W/kg
  | "NUMBER"   // plain integer
  | "HEIGHT"   // meters with decimals
  | "WEIGHT"   // kg
  | "PACE"     // MM:SS/km
  | "PERCENT"  // percentage
  | "DURATION" // hours/minutes
  | "GRADE"    // climbing grade (V-scale, French, etc.)
  | "SCORE"    // 0-1000 or similar

/**
 * Sport category for grouping (Three Lens approach)
 */
export type SportCategoryLens = "PERFORMANCE" | "TEAM" | "MINDBODY" | "ADVENTURE"

/**
 * Ranking metric definition with sensor requirements
 */
export interface RankingMetric {
  key: string
  type: MetricType
  label: string
  format: FormatType
  unit?: string
  higherIsBetter: boolean
  /** If true, only sensor-verified activities contribute to this metric */
  requiresSensor: boolean
  /** Optional description for UI tooltips */
  description?: string
}

/**
 * Complete sport configuration
 */
export interface SportConfig {
  slug: string
  name: string
  category: SportCategoryLens
  /** The main "brag" metric - displayed prominently */
  primaryMetric: string
  /** Additional metrics for ribbon display (excluding Global Rank which is always shown) */
  secondaryMetrics: string[]
  /** All available ranking metrics with full configuration */
  rankingMetrics: RankingMetric[]
}

// =============================================================================
// SENSOR SOURCES - Activities from these sources are considered "verified"
// =============================================================================

/**
 * Activity sources that count as "sensor-verified"
 * Used for metrics that require sensor validation (e.g., max jump height)
 */
export const SENSOR_SOURCES = [
  "STRAVA",
  "GARMIN",
  "IMPORT_STRAVA",
  "IMPORT_GARMIN",
  "IMPORT_APPLE_HEALTH",
  "IMPORT_GOOGLE_FIT",
  "ACTIVITY_DERIVED",
  "FIT_FILE",
  "GPX",
  "TCX",
  "DEVICE",
] as const

export type SensorSource = (typeof SENSOR_SOURCES)[number]

/**
 * Check if an activity source is sensor-verified
 */
export function isSensorSource(source: string | null | undefined): boolean {
  if (!source) return false
  return SENSOR_SOURCES.includes(source.toUpperCase() as SensorSource)
}

// =============================================================================
// COMMON METRIC DEFINITIONS (reusable across sports)
// =============================================================================

const COMMON_METRICS = {
  // Performance metrics
  sport_index: {
    key: "sport_index",
    type: "PERFORMANCE" as MetricType,
    label: "Sport Index",
    format: "SCORE" as FormatType,
    higherIsBetter: true,
    requiresSensor: false,
    description: "Overall fitness score (0-1000)",
  },
  multisport_index: {
    key: "multisport_index",
    type: "PERFORMANCE" as MetricType,
    label: "MultiSport Index",
    format: "SCORE" as FormatType,
    higherIsBetter: true,
    requiresSensor: false,
    description: "Combined score across multiple sports using Podium Points",
  },

  // Volume metrics
  distance: {
    key: "distance",
    type: "VOLUME" as MetricType,
    label: "Distance",
    format: "DISTANCE" as FormatType,
    unit: "km",
    higherIsBetter: true,
    requiresSensor: false, // Manual distance acceptable
  },
  elevation_gain: {
    key: "elevation_gain",
    type: "VOLUME" as MetricType,
    label: "Elevation",
    format: "HEIGHT" as FormatType,
    unit: "m",
    higherIsBetter: true,
    requiresSensor: true, // Requires GPS for accuracy
  },
  active_time: {
    key: "active_time",
    type: "VOLUME" as MetricType,
    label: "Active Time",
    format: "DURATION" as FormatType,
    higherIsBetter: true,
    requiresSensor: false,
  },
  sessions: {
    key: "sessions",
    type: "VOLUME" as MetricType,
    label: "Sessions",
    format: "NUMBER" as FormatType,
    higherIsBetter: true,
    requiresSensor: false,
  },
  calories: {
    key: "calories",
    type: "VOLUME" as MetricType,
    label: "Calories",
    format: "NUMBER" as FormatType,
    unit: "kcal",
    higherIsBetter: true,
    requiresSensor: false,
  },

  // Consistency metrics
  days_active: {
    key: "days_active",
    type: "CONSISTENCY" as MetricType,
    label: "Days Active",
    format: "NUMBER" as FormatType,
    unit: "days",
    higherIsBetter: true,
    requiresSensor: false,
  },
  streak: {
    key: "streak",
    type: "CONSISTENCY" as MetricType,
    label: "Streak",
    format: "NUMBER" as FormatType,
    unit: "days",
    higherIsBetter: true,
    requiresSensor: false,
  },
  variety: {
    key: "variety",
    type: "CONSISTENCY" as MetricType,
    label: "Sports",
    format: "NUMBER" as FormatType,
    higherIsBetter: true,
    requiresSensor: false,
    description: "Number of different sports practiced",
  },

  // Skill metrics (often require sensor)
  max_speed: {
    key: "max_speed",
    type: "SKILL" as MetricType,
    label: "Max Speed",
    format: "SPEED" as FormatType,
    unit: "km/h",
    higherIsBetter: true,
    requiresSensor: true,
  },
  avg_pace: {
    key: "avg_pace",
    type: "PERFORMANCE" as MetricType,
    label: "Avg Pace",
    format: "PACE" as FormatType,
    unit: "/km",
    higherIsBetter: false, // Lower pace is better
    requiresSensor: true,
  },
} as const

// =============================================================================
// SPORTS CONFIGURATION
// =============================================================================

export const SPORTS_CONFIG: Record<string, SportConfig> = {
  // ============================================================================
  // MULTISPORT (default for all users)
  // ============================================================================
  multisport: {
    slug: "multisport",
    name: "MultiSport",
    category: "ADVENTURE",
    primaryMetric: "multisport_index",
    secondaryMetrics: ["sport_index", "days_active", "variety"],
    rankingMetrics: [
      COMMON_METRICS.multisport_index,
      COMMON_METRICS.sport_index,
      COMMON_METRICS.days_active,
      COMMON_METRICS.variety,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
    ],
  },

  // ============================================================================
  // WATER SPORTS (ADVENTURE category)
  // ============================================================================
  kitesurfing: {
    slug: "kitesurfing",
    name: "Kitesurfing",
    category: "ADVENTURE",
    primaryMetric: "max_jump_height",
    secondaryMetrics: ["total_airtime", "max_speed", "sessions"],
    rankingMetrics: [
      {
        key: "max_jump_height",
        type: "SKILL",
        label: "Max Jump",
        format: "HEIGHT",
        unit: "m",
        higherIsBetter: true,
        requiresSensor: true, // SENSOR ONLY - must come from WOO/device
        description: "Highest jump recorded from WOO or similar device",
      },
      {
        key: "total_airtime",
        type: "SKILL",
        label: "Airtime",
        format: "DURATION",
        unit: "s",
        higherIsBetter: true,
        requiresSensor: true, // SENSOR ONLY
        description: "Total time in the air",
      },
      COMMON_METRICS.max_speed,
      COMMON_METRICS.sessions,
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
    ],
  },

  surfing: {
    slug: "surfing",
    name: "Surfing",
    category: "ADVENTURE",
    primaryMetric: "longest_ride",
    secondaryMetrics: ["session_rating", "sessions", "days_active"],
    rankingMetrics: [
      {
        key: "longest_ride",
        type: "SKILL",
        label: "Longest Ride",
        format: "DURATION",
        unit: "s",
        higherIsBetter: true,
        requiresSensor: true, // SENSOR ONLY - requires GPS/app
        description: "Longest wave ride duration",
      },
      {
        key: "session_rating",
        type: "SKILL",
        label: "Stoke Score",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: false, // Manual allowed - subjective rating 1-10
        description: "Self-rated session quality",
      },
      {
        key: "wave_count",
        type: "VOLUME",
        label: "Waves",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: true, // SENSOR ONLY
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
      COMMON_METRICS.active_time,
    ],
  },

  windsurfing: {
    slug: "windsurfing",
    name: "Windsurfing",
    category: "ADVENTURE",
    primaryMetric: "max_speed",
    secondaryMetrics: ["distance", "sessions", "active_time"],
    rankingMetrics: [
      COMMON_METRICS.max_speed,
      COMMON_METRICS.distance,
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.days_active,
    ],
  },

  sup: {
    slug: "sup",
    name: "Stand Up Paddle",
    category: "ADVENTURE",
    primaryMetric: "distance",
    secondaryMetrics: ["active_time", "sessions", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
      COMMON_METRICS.calories,
    ],
  },

  // ============================================================================
  // WINTER SPORTS (PERFORMANCE category)
  // ============================================================================
  skiing: {
    slug: "skiing",
    name: "Alpine Skiing",
    category: "PERFORMANCE",
    primaryMetric: "vertical_descent",
    secondaryMetrics: ["max_speed", "sessions", "distance"],
    rankingMetrics: [
      {
        key: "vertical_descent",
        type: "PERFORMANCE",
        label: "Vert",
        format: "HEIGHT",
        unit: "m",
        higherIsBetter: true,
        requiresSensor: true, // SENSOR ONLY - requires GPS
        description: "Total vertical meters descended",
      },
      COMMON_METRICS.max_speed,
      COMMON_METRICS.distance,
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
    ],
  },

  snowboarding: {
    slug: "snowboarding",
    name: "Snowboarding",
    category: "PERFORMANCE",
    primaryMetric: "vertical_descent",
    secondaryMetrics: ["max_speed", "sessions", "distance"],
    rankingMetrics: [
      {
        key: "vertical_descent",
        type: "PERFORMANCE",
        label: "Vert",
        format: "HEIGHT",
        unit: "m",
        higherIsBetter: true,
        requiresSensor: true,
      },
      COMMON_METRICS.max_speed,
      COMMON_METRICS.distance,
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
    ],
  },

  "cross-country-skiing": {
    slug: "cross-country-skiing",
    name: "Cross-Country Skiing",
    category: "PERFORMANCE",
    primaryMetric: "distance",
    secondaryMetrics: ["elevation_gain", "active_time", "sessions"],
    rankingMetrics: [
      COMMON_METRICS.distance,
      COMMON_METRICS.elevation_gain,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.streak,
    ],
  },

  // ============================================================================
  // ENDURANCE - CYCLING (PERFORMANCE category)
  // ============================================================================
  cycling: {
    slug: "cycling",
    name: "Cycling",
    category: "PERFORMANCE",
    primaryMetric: "power_20min_wkg",
    secondaryMetrics: ["elevation_gain", "distance", "active_time"],
    rankingMetrics: [
      {
        key: "power_20min_wkg",
        type: "PERFORMANCE",
        label: "20min Power",
        format: "POWER",
        unit: "W/kg",
        higherIsBetter: true,
        requiresSensor: true, // SENSOR ONLY - requires power meter
        description: "20-minute power normalized by body weight",
      },
      {
        key: "ftp",
        type: "PERFORMANCE",
        label: "FTP",
        format: "POWER",
        unit: "W",
        higherIsBetter: true,
        requiresSensor: true,
        description: "Functional Threshold Power",
      },
      COMMON_METRICS.elevation_gain,
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
    ],
  },

  "mountain-biking": {
    slug: "mountain-biking",
    name: "Mountain Biking",
    category: "ADVENTURE",
    primaryMetric: "elevation_gain",
    secondaryMetrics: ["distance", "max_speed", "sessions"],
    rankingMetrics: [
      COMMON_METRICS.elevation_gain,
      COMMON_METRICS.distance,
      COMMON_METRICS.max_speed,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
    ],
  },

  // ============================================================================
  // ENDURANCE - RUNNING (PERFORMANCE category)
  // ============================================================================
  running: {
    slug: "running",
    name: "Running",
    category: "PERFORMANCE",
    primaryMetric: "pace_5k",
    secondaryMetrics: ["distance", "elevation_gain", "streak"],
    rankingMetrics: [
      {
        key: "pace_5k",
        type: "PERFORMANCE",
        label: "5K Pace",
        format: "PACE",
        unit: "/km",
        higherIsBetter: false, // Lower is better
        requiresSensor: true, // SENSOR ONLY - requires GPS
        description: "Best 5K pace from GPS-tracked runs",
      },
      {
        key: "pace_10k",
        type: "PERFORMANCE",
        label: "10K Pace",
        format: "PACE",
        unit: "/km",
        higherIsBetter: false,
        requiresSensor: true,
      },
      COMMON_METRICS.distance,
      COMMON_METRICS.elevation_gain,
      COMMON_METRICS.streak,
      COMMON_METRICS.sessions,
    ],
  },

  "trail-running": {
    slug: "trail-running",
    name: "Trail Running",
    category: "ADVENTURE",
    primaryMetric: "elevation_gain",
    secondaryMetrics: ["distance", "active_time", "sessions"],
    rankingMetrics: [
      COMMON_METRICS.elevation_gain,
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.streak,
    ],
  },

  // ============================================================================
  // OUTDOOR (ADVENTURE category)
  // ============================================================================
  hiking: {
    slug: "hiking",
    name: "Hiking",
    category: "ADVENTURE",
    primaryMetric: "elevation_gain",
    secondaryMetrics: ["distance", "active_time", "sessions"],
    rankingMetrics: [
      { ...COMMON_METRICS.elevation_gain, requiresSensor: false }, // Accept manual for hiking
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
    ],
  },

  climbing: {
    slug: "climbing",
    name: "Climbing",
    category: "ADVENTURE",
    primaryMetric: "pyramid_top5_points",
    secondaryMetrics: ["hardest_grade", "sessions", "days_active"],
    rankingMetrics: [
      {
        key: "pyramid_top5_points",
        type: "SKILL",
        label: "Pyramid Score",
        format: "SCORE",
        higherIsBetter: true,
        requiresSensor: false, // Manual grades acceptable
        description: "Points from top 5 hardest sends (grade-weighted)",
      },
      {
        key: "hardest_grade",
        type: "SKILL",
        label: "Hardest Grade",
        format: "GRADE",
        higherIsBetter: true,
        requiresSensor: false, // Manual grades acceptable
        description: "Highest grade sent",
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
      COMMON_METRICS.active_time,
    ],
  },

  bouldering: {
    slug: "bouldering",
    name: "Bouldering",
    category: "ADVENTURE",
    primaryMetric: "pyramid_top5_points",
    secondaryMetrics: ["hardest_grade", "sessions", "days_active"],
    rankingMetrics: [
      {
        key: "pyramid_top5_points",
        type: "SKILL",
        label: "Pyramid Score",
        format: "SCORE",
        higherIsBetter: true,
        requiresSensor: false,
      },
      {
        key: "hardest_grade",
        type: "SKILL",
        label: "Hardest V",
        format: "GRADE",
        higherIsBetter: true,
        requiresSensor: false,
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
      COMMON_METRICS.active_time,
    ],
  },

  // ============================================================================
  // STRENGTH (PERFORMANCE category)
  // ============================================================================
  "gym-strength": {
    slug: "gym-strength",
    name: "Gym / Strength",
    category: "PERFORMANCE",
    primaryMetric: "strength_index",
    secondaryMetrics: ["tonnage", "sessions", "streak"],
    rankingMetrics: [
      {
        key: "strength_index",
        type: "SKILL",
        label: "Strength Index",
        format: "SCORE",
        higherIsBetter: true,
        requiresSensor: false, // Manual logging acceptable
        description: "Composite strength score based on lifts",
      },
      {
        key: "tonnage",
        type: "VOLUME",
        label: "Tonnage",
        format: "WEIGHT",
        unit: "kg",
        higherIsBetter: true,
        requiresSensor: false,
        description: "Total weight moved",
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.streak,
      COMMON_METRICS.days_active,
    ],
  },

  crossfit: {
    slug: "crossfit",
    name: "CrossFit",
    category: "PERFORMANCE",
    primaryMetric: "benchmark_wod",
    secondaryMetrics: ["sessions", "streak", "active_time"],
    rankingMetrics: [
      {
        key: "benchmark_wod",
        type: "SKILL",
        label: "Benchmark WOD",
        format: "TIME",
        higherIsBetter: false, // Lower time is better
        requiresSensor: false, // Manual WOD times acceptable
        description: "Best benchmark WOD time (Fran, Murph, etc.)",
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.streak,
      COMMON_METRICS.active_time,
      COMMON_METRICS.days_active,
    ],
  },

  weightlifting: {
    slug: "weightlifting",
    name: "Weightlifting",
    category: "PERFORMANCE",
    primaryMetric: "sinclair_total",
    secondaryMetrics: ["sessions", "active_time", "streak"],
    rankingMetrics: [
      {
        key: "sinclair_total",
        type: "SKILL",
        label: "Sinclair Total",
        format: "WEIGHT",
        unit: "kg",
        higherIsBetter: true,
        requiresSensor: false,
        description: "Bodyweight-normalized Olympic total",
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.streak,
      COMMON_METRICS.active_time,
    ],
  },

  // ============================================================================
  // TEAM SPORTS
  // ============================================================================
  football: {
    slug: "football",
    name: "Football (Soccer)",
    category: "TEAM",
    primaryMetric: "matches_played",
    secondaryMetrics: ["distance", "active_time", "sessions"],
    rankingMetrics: [
      {
        key: "matches_played",
        type: "VOLUME",
        label: "Matches",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: false,
      },
      {
        key: "elo_rating",
        type: "SKILL",
        label: "ELO",
        format: "SCORE",
        higherIsBetter: true,
        requiresSensor: false,
        description: "Competitive rating (if tracked)",
      },
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
    ],
  },

  basketball: {
    slug: "basketball",
    name: "Basketball",
    category: "TEAM",
    primaryMetric: "matches_played",
    secondaryMetrics: ["sessions", "active_time", "days_active"],
    rankingMetrics: [
      {
        key: "matches_played",
        type: "VOLUME",
        label: "Games",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: false,
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.days_active,
    ],
  },

  volleyball: {
    slug: "volleyball",
    name: "Volleyball",
    category: "TEAM",
    primaryMetric: "matches_played",
    secondaryMetrics: ["sessions", "active_time", "days_active"],
    rankingMetrics: [
      {
        key: "matches_played",
        type: "VOLUME",
        label: "Matches",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: false,
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.days_active,
    ],
  },

  // ============================================================================
  // RACKET SPORTS (TEAM category - competitive)
  // ============================================================================
  tennis: {
    slug: "tennis",
    name: "Tennis",
    category: "TEAM",
    primaryMetric: "matches_played",
    secondaryMetrics: ["sessions", "active_time", "days_active"],
    rankingMetrics: [
      {
        key: "matches_played",
        type: "VOLUME",
        label: "Matches",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: false,
      },
      {
        key: "elo_rating",
        type: "SKILL",
        label: "Rating",
        format: "SCORE",
        higherIsBetter: true,
        requiresSensor: false,
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
    ],
  },

  padel: {
    slug: "padel",
    name: "Padel",
    category: "TEAM",
    primaryMetric: "matches_played",
    secondaryMetrics: ["sessions", "active_time", "days_active"],
    rankingMetrics: [
      {
        key: "matches_played",
        type: "VOLUME",
        label: "Matches",
        format: "NUMBER",
        higherIsBetter: true,
        requiresSensor: false,
      },
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.days_active,
    ],
  },

  // ============================================================================
  // MIND & BODY (MINDBODY category)
  // ============================================================================
  yoga: {
    slug: "yoga",
    name: "Yoga",
    category: "MINDBODY",
    primaryMetric: "streak",
    secondaryMetrics: ["active_time", "sessions", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.streak,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
      COMMON_METRICS.calories,
    ],
  },

  pilates: {
    slug: "pilates",
    name: "Pilates",
    category: "MINDBODY",
    primaryMetric: "streak",
    secondaryMetrics: ["active_time", "sessions", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.streak,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
    ],
  },

  meditation: {
    slug: "meditation",
    name: "Meditation",
    category: "MINDBODY",
    primaryMetric: "streak",
    secondaryMetrics: ["active_time", "sessions", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.streak,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.days_active,
    ],
  },

  // ============================================================================
  // COMBAT SPORTS (PERFORMANCE category)
  // ============================================================================
  boxing: {
    slug: "boxing",
    name: "Boxing",
    category: "PERFORMANCE",
    primaryMetric: "sessions",
    secondaryMetrics: ["active_time", "streak", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.streak,
      COMMON_METRICS.days_active,
      COMMON_METRICS.calories,
    ],
  },

  mma: {
    slug: "mma",
    name: "MMA",
    category: "PERFORMANCE",
    primaryMetric: "sessions",
    secondaryMetrics: ["active_time", "streak", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.streak,
      COMMON_METRICS.days_active,
    ],
  },

  "jiu-jitsu": {
    slug: "jiu-jitsu",
    name: "Jiu-Jitsu",
    category: "PERFORMANCE",
    primaryMetric: "sessions",
    secondaryMetrics: ["active_time", "streak", "days_active"],
    rankingMetrics: [
      COMMON_METRICS.sessions,
      COMMON_METRICS.active_time,
      COMMON_METRICS.streak,
      COMMON_METRICS.days_active,
    ],
  },

  // ============================================================================
  // SWIMMING (PERFORMANCE category)
  // ============================================================================
  swimming: {
    slug: "swimming",
    name: "Swimming",
    category: "PERFORMANCE",
    primaryMetric: "distance",
    secondaryMetrics: ["active_time", "sessions", "streak"],
    rankingMetrics: [
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.sessions,
      COMMON_METRICS.streak,
      COMMON_METRICS.days_active,
    ],
  },

  triathlon: {
    slug: "triathlon",
    name: "Triathlon",
    category: "PERFORMANCE",
    primaryMetric: "sport_index",
    secondaryMetrics: ["distance", "active_time", "variety"],
    rankingMetrics: [
      COMMON_METRICS.sport_index,
      COMMON_METRICS.distance,
      COMMON_METRICS.active_time,
      COMMON_METRICS.variety,
      COMMON_METRICS.sessions,
    ],
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

import { normalizeSportSlug } from "./normalizeSportSlug"

/**
 * Get sport configuration by slug (with normalization)
 * Falls back to multisport if sport not found
 */
export function getSportConfig(slug: string | null | undefined): SportConfig {
  if (!slug) return SPORTS_CONFIG.multisport

  const normalized = normalizeSportSlug(slug)
  if (!normalized) return SPORTS_CONFIG.multisport

  return SPORTS_CONFIG[normalized] ?? SPORTS_CONFIG.multisport
}

/**
 * Get all available sports
 */
export function getAllSports(): SportConfig[] {
  return Object.values(SPORTS_CONFIG)
}

/**
 * Get sports by category
 */
export function getSportsByCategory(category: SportCategoryLens): SportConfig[] {
  return Object.values(SPORTS_CONFIG).filter((s) => s.category === category)
}

/**
 * Get a specific ranking metric for a sport
 */
export function getSportMetric(
  sportSlug: string,
  metricKey: string
): RankingMetric | undefined {
  const config = getSportConfig(sportSlug)
  return config.rankingMetrics.find((m) => m.key === metricKey)
}

/**
 * Check if a metric requires sensor data for a sport
 */
export function metricRequiresSensor(
  sportSlug: string,
  metricKey: string
): boolean {
  const metric = getSportMetric(sportSlug, metricKey)
  return metric?.requiresSensor ?? false
}

/**
 * Get default leaderboard metric for a sport
 */
export function getDefaultLeaderboardMetric(sportSlug: string): string {
  const config = getSportConfig(sportSlug)
  return config.primaryMetric
}

/**
 * Check if sport config exists
 */
export function hasSportConfig(slug: string): boolean {
  const normalized = normalizeSportSlug(slug)
  return normalized ? slug in SPORTS_CONFIG || normalized in SPORTS_CONFIG : false
}

/**
 * Get all ranking metrics for a sport
 */
export function getSportMetrics(sportSlug: string): RankingMetric[] {
  const config = getSportConfig(sportSlug)
  return config.rankingMetrics
}
