/**
 * Benchmark Catalog - Source of truth for discipline-based rankings
 *
 * Each benchmark defines a specific measurable achievement that can be
 * ranked in real units (time, distance, speed, power, etc.)
 */

export type BenchmarkKind = "time" | "distance" | "speed" | "power" | "reps" | "score"
export type Better = "lower" | "higher"

export type BenchmarkDef = {
  id: string
  sportSlug: string
  name: string
  kind: BenchmarkKind
  unit: string
  better: Better
  validityMonths: number
  description?: string
  /** For timed distances (e.g., 5K time), the target distance in meters */
  targetDistanceM?: number
  /** For distance/time benchmarks (e.g., 20min power), the target duration in seconds */
  targetDurationSec?: number
  /** Display priority within sport (lower = higher priority) */
  displayOrder?: number
}

export const BENCHMARKS: BenchmarkDef[] = [
  // ============= RUNNING =============
  {
    id: "run_5k_time",
    sportSlug: "running",
    name: "5K Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 5000,
    displayOrder: 1,
    description: "Fastest 5 kilometer run",
  },
  {
    id: "run_10k_time",
    sportSlug: "running",
    name: "10K Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 10000,
    displayOrder: 2,
    description: "Fastest 10 kilometer run",
  },
  {
    id: "run_hm_time",
    sportSlug: "running",
    name: "Half Marathon",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 36,
    targetDistanceM: 21097,
    displayOrder: 3,
    description: "Fastest half marathon (21.1 km)",
  },
  {
    id: "run_marathon_time",
    sportSlug: "running",
    name: "Marathon",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 60,
    targetDistanceM: 42195,
    displayOrder: 4,
    description: "Fastest marathon (42.2 km)",
  },
  {
    id: "run_1k_time",
    sportSlug: "running",
    name: "1K Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 1000,
    displayOrder: 5,
    description: "Fastest 1 kilometer run",
  },

  // ============= CYCLING =============
  {
    id: "cyc_20m_power",
    sportSlug: "cycling",
    name: "20min Power",
    kind: "power",
    unit: "w",
    better: "higher",
    validityMonths: 24,
    targetDurationSec: 1200,
    displayOrder: 1,
    description: "Average power over 20 minutes",
  },
  {
    id: "cyc_ftp",
    sportSlug: "cycling",
    name: "FTP",
    kind: "power",
    unit: "w",
    better: "higher",
    validityMonths: 24,
    displayOrder: 2,
    description: "Functional Threshold Power (estimated)",
  },
  {
    id: "cyc_40k_time",
    sportSlug: "cycling",
    name: "40K Time Trial",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 36,
    targetDistanceM: 40000,
    displayOrder: 3,
    description: "Fastest 40 kilometer time trial",
  },
  {
    id: "cyc_100k_time",
    sportSlug: "cycling",
    name: "100K Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 36,
    targetDistanceM: 100000,
    displayOrder: 4,
    description: "Fastest 100 kilometer ride",
  },
  {
    id: "cyc_longest_ride",
    sportSlug: "cycling",
    name: "Longest Ride",
    kind: "distance",
    unit: "km",
    better: "higher",
    validityMonths: 24,
    displayOrder: 5,
    description: "Longest single ride distance",
  },

  // ============= SWIMMING =============
  {
    id: "swim_100m_time",
    sportSlug: "swimming",
    name: "100m Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 100,
    displayOrder: 1,
    description: "Fastest 100 meter swim",
  },
  {
    id: "swim_400m_time",
    sportSlug: "swimming",
    name: "400m Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 400,
    displayOrder: 2,
    description: "Fastest 400 meter swim",
  },
  {
    id: "swim_1500m_time",
    sportSlug: "swimming",
    name: "1500m Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 1500,
    displayOrder: 3,
    description: "Fastest 1500 meter swim",
  },
  {
    id: "swim_longest",
    sportSlug: "swimming",
    name: "Longest Swim",
    kind: "distance",
    unit: "m",
    better: "higher",
    validityMonths: 24,
    displayOrder: 4,
    description: "Longest continuous swim distance",
  },

  // ============= KITESURFING =============
  {
    id: "kite_top_speed",
    sportSlug: "kitesurfing",
    name: "Top Speed",
    kind: "speed",
    unit: "km/h",
    better: "higher",
    validityMonths: 24,
    displayOrder: 1,
    description: "Maximum recorded speed",
  },
  {
    id: "kite_best_jump",
    sportSlug: "kitesurfing",
    name: "Best Jump",
    kind: "distance",
    unit: "m",
    better: "higher",
    validityMonths: 24,
    displayOrder: 2,
    description: "Highest recorded jump",
  },
  {
    id: "kite_longest_session",
    sportSlug: "kitesurfing",
    name: "Longest Session",
    kind: "time",
    unit: "s",
    better: "higher",
    validityMonths: 24,
    displayOrder: 3,
    description: "Longest single session duration",
  },

  // ============= STRENGTH / GYM =============
  {
    id: "strength_bench_1rm",
    sportSlug: "strength",
    name: "Bench Press 1RM",
    kind: "score",
    unit: "kg",
    better: "higher",
    validityMonths: 12,
    displayOrder: 1,
    description: "One rep max bench press",
  },
  {
    id: "strength_squat_1rm",
    sportSlug: "strength",
    name: "Squat 1RM",
    kind: "score",
    unit: "kg",
    better: "higher",
    validityMonths: 12,
    displayOrder: 2,
    description: "One rep max squat",
  },
  {
    id: "strength_deadlift_1rm",
    sportSlug: "strength",
    name: "Deadlift 1RM",
    kind: "score",
    unit: "kg",
    better: "higher",
    validityMonths: 12,
    displayOrder: 3,
    description: "One rep max deadlift",
  },
  {
    id: "strength_pullups_max",
    sportSlug: "strength",
    name: "Max Pull-ups",
    kind: "reps",
    unit: "reps",
    better: "higher",
    validityMonths: 12,
    displayOrder: 4,
    description: "Maximum consecutive pull-ups",
  },

  // ============= HIKING / OUTDOOR =============
  {
    id: "hiking_elevation",
    sportSlug: "hiking",
    name: "Single Hike Elevation",
    kind: "distance",
    unit: "m",
    better: "higher",
    validityMonths: 24,
    displayOrder: 1,
    description: "Most elevation gain in a single hike",
  },
  {
    id: "hiking_longest",
    sportSlug: "hiking",
    name: "Longest Hike",
    kind: "distance",
    unit: "km",
    better: "higher",
    validityMonths: 24,
    displayOrder: 2,
    description: "Longest single hike distance",
  },

  // ============= YOGA / MINDBODY =============
  {
    id: "yoga_longest_session",
    sportSlug: "yoga",
    name: "Longest Session",
    kind: "time",
    unit: "s",
    better: "higher",
    validityMonths: 12,
    displayOrder: 1,
    description: "Longest yoga session",
  },

  // ============= TENNIS / RACKET =============
  {
    id: "tennis_longest_match",
    sportSlug: "tennis",
    name: "Longest Match",
    kind: "time",
    unit: "s",
    better: "higher",
    validityMonths: 24,
    displayOrder: 1,
    description: "Longest match duration",
  },

  // ============= SKIING =============
  {
    id: "skiing_top_speed",
    sportSlug: "skiing",
    name: "Top Speed",
    kind: "speed",
    unit: "km/h",
    better: "higher",
    validityMonths: 24,
    displayOrder: 1,
    description: "Maximum recorded skiing speed",
  },
  {
    id: "skiing_vertical",
    sportSlug: "skiing",
    name: "Vertical Drop",
    kind: "distance",
    unit: "m",
    better: "higher",
    validityMonths: 24,
    displayOrder: 2,
    description: "Most vertical meters in a single day",
  },

  // ============= ROWING =============
  {
    id: "rowing_2k_time",
    sportSlug: "rowing",
    name: "2K Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 2000,
    displayOrder: 1,
    description: "Fastest 2000m row (erg or water)",
  },
  {
    id: "rowing_5k_time",
    sportSlug: "rowing",
    name: "5K Time",
    kind: "time",
    unit: "s",
    better: "lower",
    validityMonths: 24,
    targetDistanceM: 5000,
    displayOrder: 2,
    description: "Fastest 5000m row",
  },
]

// ============= HELPER FUNCTIONS =============

/**
 * Get all benchmarks for a specific sport
 */
export function getBenchmarksForSport(sportSlug: string): BenchmarkDef[] {
  return BENCHMARKS.filter((b) => b.sportSlug === sportSlug).sort(
    (a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99)
  )
}

/**
 * Get a single benchmark by ID
 */
export function getBenchmark(id: string): BenchmarkDef | undefined {
  return BENCHMARKS.find((b) => b.id === id)
}

/**
 * Get the default/primary benchmark for a sport (first by display order)
 */
export function getDefaultBenchmarkForSport(sportSlug: string): BenchmarkDef | undefined {
  const sportBenchmarks = getBenchmarksForSport(sportSlug)
  return sportBenchmarks[0]
}

/**
 * Get all unique sport slugs that have benchmarks
 */
export function getSportsWithBenchmarks(): string[] {
  return [...new Set(BENCHMARKS.map((b) => b.sportSlug))]
}

/**
 * Format a benchmark value for display
 */
export function formatBenchmarkValue(value: number, benchmark: BenchmarkDef): string {
  switch (benchmark.kind) {
    case "time":
      return formatTime(value)
    case "distance":
      if (benchmark.unit === "km") {
        return `${value.toFixed(1)} km`
      } else if (benchmark.unit === "m") {
        return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${Math.round(value)} m`
      }
      return `${value} ${benchmark.unit}`
    case "speed":
      return `${value.toFixed(1)} ${benchmark.unit}`
    case "power":
      return `${Math.round(value)} ${benchmark.unit}`
    case "reps":
      return `${Math.round(value)} ${benchmark.unit}`
    case "score":
      return `${value.toFixed(1)} ${benchmark.unit}`
    default:
      return `${value} ${benchmark.unit}`
  }
}

/**
 * Format seconds as mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return "--:--"

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}

/**
 * Parse a time string (mm:ss or hh:mm:ss) to seconds
 */
export function parseTimeToSeconds(timeStr: string): number | null {
  const parts = timeStr.split(":").map(Number)
  if (parts.some(isNaN)) return null

  if (parts.length === 2) {
    // mm:ss
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // hh:mm:ss
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return null
}

/**
 * Compare two benchmark values and return whether first is better
 */
export function isBetterValue(
  value1: number,
  value2: number,
  better: Better
): boolean {
  if (better === "lower") {
    return value1 < value2
  }
  return value1 > value2
}
