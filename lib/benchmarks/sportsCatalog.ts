import { BenchmarkMeasurementType, SportCategory } from "@prisma/client"

export type BenchmarkSeed = {
  slug: string
  name: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
  targetJson?: Record<string, unknown>
  rankWeight?: number
}

export type SportSeed = {
  name: string
  slug: string
  icon: string
  category: SportCategory
  benchmarks: BenchmarkSeed[]
}

/**
 * Canonical supported sports with top 1-5 ranked achievements each.
 * Notes:
 * - TIME benchmarks store seconds (value).
 * - DISTANCE benchmarks store meters (value).
 * - SPEED is km/h. POWER is watts. WEIGHT_REPS stores kg (1RM estimate).
 * - RESULT is numeric mapped (WIN=1, DRAW=0.5, LOSS=0).
 */
export const SPORTS_CATALOG: SportSeed[] = [
  // ========== ENDURANCE ==========
  {
    name: "Running",
    slug: "running",
    icon: "running",
    category: "ENDURANCE",
    benchmarks: [
      { slug: "1-mile", name: "1 Mile", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 1609 }, rankWeight: 1.0 },
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 1.2 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 1.1 },
      { slug: "half-marathon", name: "Half Marathon", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 21097 }, rankWeight: 0.9 },
      { slug: "marathon", name: "Marathon", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 42195 }, rankWeight: 0.8 },
    ],
  },
  {
    name: "Trail Running",
    slug: "trail-running",
    icon: "mountain",
    category: "ENDURANCE",
    benchmarks: [
      { slug: "trail-10k", name: "10K Trail", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 1.0 },
      { slug: "trail-21k", name: "21K Trail", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 21000 }, rankWeight: 0.9 },
      { slug: "vert-1h", name: "Vertical Gain in 1h", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { durationSec: 3600, metric: "elevationGainM" }, rankWeight: 0.8 },
      { slug: "longest-trail", name: "Longest Trail Run", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "best-climb-segment", name: "Best Climb Segment", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.6 },
    ],
  },
  {
    name: "Triathlon",
    slug: "triathlon",
    icon: "medal",
    category: "ENDURANCE",
    benchmarks: [
      { slug: "sprint", name: "Sprint", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 1.0 },
      { slug: "olympic", name: "Olympic", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 1.0 },
      { slug: "70-3", name: "70.3", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.9 },
      { slug: "ironman", name: "Ironman", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.8 },
      { slug: "best-placing", name: "Best Placing", measurementType: "RESULT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Rowing",
    slug: "rowing",
    icon: "waves",
    category: "ENDURANCE",
    benchmarks: [
      { slug: "2k", name: "2K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 2000 }, rankWeight: 1.0 },
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 0.9 },
      { slug: "30min-distance", name: "30 min Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { durationSec: 1800 }, rankWeight: 0.8 },
      { slug: "1h-distance", name: "1h Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { durationSec: 3600 }, rankWeight: 0.8 },
      { slug: "peak-power", name: "Peak Power", measurementType: "POWER", unit: "w", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Inline Skating",
    slug: "inline-skating",
    icon: "circle",
    category: "ENDURANCE",
    benchmarks: [
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 1.0 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 0.9 },
      { slug: "half-marathon", name: "Half Marathon", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 21097 }, rankWeight: 0.8 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-distance", name: "Longest Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },

  // ========== CYCLING ==========
  {
    name: "Cycling (Road)",
    slug: "cycling-road",
    icon: "bike",
    category: "CYCLING",
    benchmarks: [
      { slug: "20min-power", name: "20 min Power", measurementType: "POWER", unit: "w", higherIsBetter: true, targetJson: { durationSec: 1200 }, rankWeight: 1.1 },
      { slug: "40k-tt", name: "40K Time Trial", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 40000 }, rankWeight: 1.0 },
      { slug: "100k-time", name: "100K Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 100000 }, rankWeight: 0.9 },
      { slug: "1h-distance", name: "1h Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { durationSec: 3600 }, rankWeight: 0.9 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Mountain Biking",
    slug: "mountain-biking",
    icon: "mountain",
    category: "CYCLING",
    benchmarks: [
      { slug: "mtb-20k-time", name: "20K MTB Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 20000 }, rankWeight: 0.9 },
      { slug: "vert-per-ride", name: "Vertical Gain (Ride)", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { metric: "elevationGainM" }, rankWeight: 1.0 },
      { slug: "longest-ride", name: "Longest Ride", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "best-segment", name: "Best Segment", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.6 },
    ],
  },
  {
    name: "Gravel Cycling",
    slug: "gravel-cycling",
    icon: "bike",
    category: "CYCLING",
    benchmarks: [
      { slug: "50k-time", name: "50K Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 50000 }, rankWeight: 1.0 },
      { slug: "100k-time", name: "100K Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 100000 }, rankWeight: 0.9 },
      { slug: "longest-ride", name: "Longest Ride", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "vert-gain", name: "Vertical Gain", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { metric: "elevationGainM" }, rankWeight: 0.8 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },

  // ========== SWIMMING ==========
  {
    name: "Swimming (Pool)",
    slug: "swimming-pool",
    icon: "waves",
    category: "SWIMMING",
    benchmarks: [
      { slug: "100m", name: "100m", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 100 }, rankWeight: 1.0 },
      { slug: "200m", name: "200m", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 200 }, rankWeight: 1.0 },
      { slug: "400m", name: "400m", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 400 }, rankWeight: 0.9 },
      { slug: "1500m", name: "1500m", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 1500 }, rankWeight: 0.8 },
      { slug: "1k-continuous", name: "1K Continuous", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 1000 }, rankWeight: 0.8 },
    ],
  },
  {
    name: "Open Water Swimming",
    slug: "open-water-swimming",
    icon: "waves",
    category: "SWIMMING",
    benchmarks: [
      { slug: "1k", name: "1K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 1000 }, rankWeight: 1.0 },
      { slug: "2k", name: "2K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 2000 }, rankWeight: 0.9 },
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 0.8 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 0.7 },
      { slug: "longest-swim", name: "Longest Swim", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },

  // ========== WATER & BOARD ==========
  {
    name: "Kayaking / Canoeing",
    slug: "kayaking-canoeing",
    icon: "ship",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 0.9 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 0.8 },
      { slug: "longest-paddle", name: "Longest Paddle", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "session-duration", name: "Session Duration", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "SUP (Stand-up Paddle)",
    slug: "sup",
    icon: "ship",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 0.9 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 0.8 },
      { slug: "longest-paddle", name: "Longest Paddle", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "session-duration", name: "Session Duration", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Kitesurfing",
    slug: "kitesurfing",
    icon: "wind",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "max-jump", name: "Max Jump Height", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 1.1 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "longest-distance", name: "Longest Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "longest-session", name: "Longest Session", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "trick-level", name: "Trick Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
    ],
  },
  {
    name: "Windsurfing",
    slug: "windsurfing",
    icon: "wind",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "10km-avg-speed", name: "10km Avg Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "longest-distance", name: "Longest Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "session-duration", name: "Session Duration", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "trick-level", name: "Trick Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Wakeboarding",
    slug: "wakeboarding",
    icon: "waves",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "trick-level", name: "Trick Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "best-run-score", name: "Best Run Score", measurementType: "SCORE", unit: "points", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "max-air-time", name: "Max Air Time", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "session-duration", name: "Session Duration", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Surfing",
    slug: "surfing",
    icon: "waves",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "waves-ridden", name: "Waves Ridden", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "longest-ride", name: "Longest Ride", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "session-duration", name: "Session Duration", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "trick-level", name: "Trick Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "best-session-score", name: "Best Session Score", measurementType: "SCORE", unit: "points", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Sailing",
    slug: "sailing",
    icon: "ship",
    category: "WATER_BOARD",
    benchmarks: [
      { slug: "regatta-points", name: "Regatta Points", measurementType: "SCORE", unit: "points", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "best-placing", name: "Best Placing", measurementType: "RESULT", unit: "count", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "total-distance", name: "Total Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "time-on-water", name: "Time on Water", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },

  // ========== WINTER ==========
  {
    name: "Skiing (Downhill)",
    slug: "skiing-downhill",
    icon: "mountain",
    category: "WINTER",
    benchmarks: [
      { slug: "vertical", name: "Vertical", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { metric: "elevationGainM" }, rankWeight: 1.0 },
      { slug: "distance", name: "Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "best-run-time", name: "Best Run Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.6 },
      { slug: "ski-days-streak", name: "Ski Days Streak", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Cross-country Skiing",
    slug: "cross-country-skiing",
    icon: "mountain",
    category: "WINTER",
    benchmarks: [
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 1.0 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 1.0 },
      { slug: "20k", name: "20K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 20000 }, rankWeight: 0.9 },
      { slug: "vertical", name: "Vertical", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { metric: "elevationGainM" }, rankWeight: 0.8 },
      { slug: "longest-distance", name: "Longest Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
    ],
  },
  {
    name: "Snowboarding",
    slug: "snowboarding",
    icon: "mountain",
    category: "WINTER",
    benchmarks: [
      { slug: "vertical", name: "Vertical", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { metric: "elevationGainM" }, rankWeight: 0.9 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "trick-level", name: "Trick Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "distance", name: "Distance", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "session-duration", name: "Session Duration", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Ice Skating",
    slug: "ice-skating",
    icon: "circle",
    category: "WINTER",
    benchmarks: [
      { slug: "1k", name: "1K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 1000 }, rankWeight: 1.0 },
      { slug: "5k", name: "5K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 5000 }, rankWeight: 0.9 },
      { slug: "10k", name: "10K", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 10000 }, rankWeight: 0.8 },
      { slug: "max-speed", name: "Max Speed", measurementType: "SPEED", unit: "kmh", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-session", name: "Longest Session", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },

  // ========== OUTDOOR ==========
  {
    name: "Hiking",
    slug: "hiking",
    icon: "mountain",
    category: "OUTDOOR",
    benchmarks: [
      { slug: "vertical-gain", name: "Vertical Gain", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, targetJson: { metric: "elevationGainM" }, rankWeight: 1.0 },
      { slug: "longest-hike", name: "Longest Hike", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "fastest-ascent", name: "Fastest Ascent", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.7 },
      { slug: "peak-elevation", name: "Peak Elevation", measurementType: "DISTANCE", unit: "m", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "time-on-trail", name: "Time on Trail", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Climbing (Sport)",
    slug: "climbing-sport",
    icon: "mountain",
    category: "OUTDOOR",
    benchmarks: [
      { slug: "max-grade", name: "Max Grade Sent", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 1.2 },
      { slug: "max-onsight", name: "Max Onsight Grade", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "routes-at-grade", name: "Routes ≥ Grade", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "hardest-project", name: "Hardest Project Completed", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "climb-days-month", name: "Climb Days / Month", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Bouldering",
    slug: "bouldering",
    icon: "mountain",
    category: "OUTDOOR",
    benchmarks: [
      { slug: "max-grade", name: "Max Boulder Grade", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 1.2 },
      { slug: "problems-at-grade", name: "Problems ≥ Grade", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "flash-grade", name: "Flash Grade", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "session-volume", name: "Session Volume", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
      { slug: "climb-days-month", name: "Climb Days / Month", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },

  // ========== STRENGTH ==========
  {
    name: "Gym / Strength",
    slug: "gym-strength",
    icon: "dumbbell",
    category: "STRENGTH",
    benchmarks: [
      { slug: "squat-1rm", name: "Squat 1RM", measurementType: "WEIGHT_REPS", unit: "kg", higherIsBetter: true, targetJson: { lift: "SQUAT", reps: 1 }, rankWeight: 1.1 },
      { slug: "bench-1rm", name: "Bench 1RM", measurementType: "WEIGHT_REPS", unit: "kg", higherIsBetter: true, targetJson: { lift: "BENCH", reps: 1 }, rankWeight: 1.0 },
      { slug: "deadlift-1rm", name: "Deadlift 1RM", measurementType: "WEIGHT_REPS", unit: "kg", higherIsBetter: true, targetJson: { lift: "DEADLIFT", reps: 1 }, rankWeight: 1.1 },
      { slug: "pullups-max", name: "Pull-ups Max", measurementType: "COUNT", unit: "reps", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "2k-row", name: "2K Row", measurementType: "TIME", unit: "sec", higherIsBetter: false, targetJson: { distanceMeters: 2000 }, rankWeight: 0.8 },
    ],
  },
  {
    name: "CrossFit",
    slug: "crossfit",
    icon: "dumbbell",
    category: "STRENGTH",
    benchmarks: [
      { slug: "fran", name: "Fran Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 1.0 },
      { slug: "grace", name: "Grace Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.9 },
      { slug: "murph", name: "Murph Time", measurementType: "TIME", unit: "sec", higherIsBetter: false, rankWeight: 0.9 },
      { slug: "max-reps-benchmark", name: "Max Reps Benchmark", measurementType: "COUNT", unit: "reps", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "total-load", name: "Total Load Benchmark", measurementType: "WEIGHT_REPS", unit: "kg", higherIsBetter: true, rankWeight: 0.8 },
    ],
  },

  // ========== MINDBODY ==========
  {
    name: "Yoga",
    slug: "yoga",
    icon: "heart",
    category: "MINDBODY",
    benchmarks: [
      { slug: "streak", name: "Streak", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "minutes-week", name: "Minutes / Week", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "longest-session", name: "Longest Session", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "difficulty-level", name: "Difficulty Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "sessions-week", name: "Sessions / Week", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Pilates",
    slug: "pilates",
    icon: "heart",
    category: "MINDBODY",
    benchmarks: [
      { slug: "sessions-week", name: "Sessions / Week", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "minutes-week", name: "Minutes / Week", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "longest-session", name: "Longest Session", measurementType: "TIME", unit: "sec", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "difficulty-level", name: "Difficulty Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "streak", name: "Streak", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },

  // ========== TEAM ==========
  {
    name: "Football / Soccer",
    slug: "football-soccer",
    icon: "circle",
    category: "TEAM",
    benchmarks: [
      { slug: "wins", name: "Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "goals", name: "Goals", measurementType: "SCORE", unit: "points", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "assists", name: "Assists", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "match-rating", name: "Match Rating", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "matches-played", name: "Matches Played", measurementType: "COUNT", unit: "matches", higherIsBetter: true, rankWeight: 0.4 },
    ],
  },
  {
    name: "Basketball",
    slug: "basketball",
    icon: "circle",
    category: "TEAM",
    benchmarks: [
      { slug: "wins", name: "Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "points", name: "Points", measurementType: "SCORE", unit: "points", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "assists", name: "Assists", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "rebounds", name: "Rebounds", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "match-rating", name: "Match Rating", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "Volleyball",
    slug: "volleyball",
    icon: "circle",
    category: "TEAM",
    benchmarks: [
      { slug: "wins", name: "Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "points", name: "Points", measurementType: "SCORE", unit: "points", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "aces", name: "Aces", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "blocks", name: "Blocks", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "match-rating", name: "Match Rating", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },

  // ========== RACKET ==========
  {
    name: "Tennis",
    slug: "tennis",
    icon: "circle",
    category: "RACKET",
    benchmarks: [
      { slug: "match-wins", name: "Match Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "win-rate", name: "Win Rate", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "tournament-level", name: "Tournament Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "sets-won", name: "Sets Won", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-rally", name: "Longest Rally", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Padel",
    slug: "padel",
    icon: "circle",
    category: "RACKET",
    benchmarks: [
      { slug: "match-wins", name: "Match Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "win-rate", name: "Win Rate", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "tournament-level", name: "Tournament Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "sets-won", name: "Sets Won", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-rally", name: "Longest Rally", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Badminton",
    slug: "badminton",
    icon: "circle",
    category: "RACKET",
    benchmarks: [
      { slug: "match-wins", name: "Match Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "win-rate", name: "Win Rate", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "tournament-level", name: "Tournament Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "games-won", name: "Games Won", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-rally", name: "Longest Rally", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Squash",
    slug: "squash",
    icon: "circle",
    category: "RACKET",
    benchmarks: [
      { slug: "match-wins", name: "Match Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "win-rate", name: "Win Rate", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "tournament-level", name: "Tournament Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "games-won", name: "Games Won", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-rally", name: "Longest Rally", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },
  {
    name: "Table Tennis",
    slug: "table-tennis",
    icon: "circle",
    category: "RACKET",
    benchmarks: [
      { slug: "match-wins", name: "Match Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "win-rate", name: "Win Rate", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "league-level", name: "Rating / League Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "games-won", name: "Games Won", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.6 },
      { slug: "longest-rally", name: "Longest Rally", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.5 },
    ],
  },

  // ========== COMBAT ==========
  {
    name: "Boxing",
    slug: "boxing",
    icon: "shield",
    category: "COMBAT",
    benchmarks: [
      { slug: "wins", name: "Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "knockdowns", name: "Knockdowns", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.8 },
      { slug: "rounds", name: "Rounds", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "skill-level", name: "Skill Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "match-rating", name: "Match Rating", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
  {
    name: "MMA",
    slug: "mma",
    icon: "shield",
    category: "COMBAT",
    benchmarks: [
      { slug: "wins", name: "Wins", measurementType: "RESULT", unit: "wins", higherIsBetter: true, rankWeight: 1.0 },
      { slug: "submissions-ko", name: "Submissions / KO", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.9 },
      { slug: "rounds", name: "Rounds", measurementType: "COUNT", unit: "count", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "skill-level", name: "Skill Level", measurementType: "GRADE_LEVEL", unit: "level", higherIsBetter: true, rankWeight: 0.7 },
      { slug: "match-rating", name: "Match Rating", measurementType: "SCORE", unit: "rating", higherIsBetter: true, rankWeight: 0.6 },
    ],
  },
]
