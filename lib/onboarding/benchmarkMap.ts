/**
 * Benchmark Map - Maps sport slugs to their recommended benchmark for onboarding
 *
 * Each sport has:
 * - benchmarkSlug: The discipline slug to use for initial PB
 * - label: Display name for the benchmark
 * - unit: Unit of measurement
 * - inputType: How to parse user input (time, number, grade)
 * - placeholder: Example input format
 * - requiresVerification: Whether global ranks need verification
 * - skipBenchmark: For team sports that don't have individual benchmarks
 */

export type BenchmarkConfig = {
  benchmarkSlug: string
  label: string
  unit: string
  inputType: "time" | "number" | "grade"
  placeholder: string
  requiresVerification: boolean
  fairnessBadge: "STANDARD" | "NORMALIZED" | "SEGMENT" | "RATING"
  sensorRequired?: boolean
  helpText?: string
}

export type SportBenchmarkConfig = BenchmarkConfig | { skipBenchmark: true; message: string }

/**
 * Maps sport slugs to their recommended onboarding benchmark
 */
export const SPORT_BENCHMARK_MAP: Record<string, SportBenchmarkConfig> = {
  // Endurance
  running: {
    benchmarkSlug: "5k",
    label: "5K Time",
    unit: "seconds",
    inputType: "time",
    placeholder: "25:30 or 25m 30s",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
    helpText: "Enter your best 5K running time",
  },
  "trail-running": {
    benchmarkSlug: "5k",
    label: "5K Time",
    unit: "seconds",
    inputType: "time",
    placeholder: "28:00",
    requiresVerification: true,
    fairnessBadge: "NORMALIZED",
    helpText: "Trail times are normalized for elevation",
  },

  // Cycling
  cycling: {
    benchmarkSlug: "20min-power",
    label: "20 min Power (FTP)",
    unit: "watts",
    inputType: "number",
    placeholder: "250",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
    sensorRequired: true,
    helpText: "Enter your 20-minute power in watts (requires power meter for verification)",
  },
  "mountain-biking": {
    benchmarkSlug: "20min-power",
    label: "20 min Power (FTP)",
    unit: "watts",
    inputType: "number",
    placeholder: "220",
    requiresVerification: true,
    fairnessBadge: "NORMALIZED",
    sensorRequired: true,
  },

  // Swimming
  swimming: {
    benchmarkSlug: "400m",
    label: "400m Time",
    unit: "seconds",
    inputType: "time",
    placeholder: "6:30 or 6m 30s",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
    helpText: "Enter your best 400m pool swim time",
  },
  "open-water-swimming": {
    benchmarkSlug: "1k-open-water",
    label: "1K Time",
    unit: "seconds",
    inputType: "time",
    placeholder: "18:00",
    requiresVerification: true,
    fairnessBadge: "NORMALIZED",
  },

  // Strength
  "gym-strength": {
    benchmarkSlug: "bench-1rm",
    label: "Bench Press 1RM",
    unit: "kg",
    inputType: "number",
    placeholder: "100",
    requiresVerification: false,
    fairnessBadge: "STANDARD",
    helpText: "Enter your one rep max in kg",
  },
  crossfit: {
    benchmarkSlug: "2k-row",
    label: "2K Row Time",
    unit: "seconds",
    inputType: "time",
    placeholder: "7:30",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
  },

  // Water/Board sports
  kitesurfing: {
    benchmarkSlug: "max-jump",
    label: "Highest Jump",
    unit: "meters",
    inputType: "number",
    placeholder: "12",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
    sensorRequired: true,
    helpText: "Woo sensor required for global rankings",
  },
  surfing: {
    benchmarkSlug: "max-speed",
    label: "Max Speed",
    unit: "kmh",
    inputType: "number",
    placeholder: "35",
    requiresVerification: true,
    fairnessBadge: "SEGMENT",
  },
  wakeboarding: {
    benchmarkSlug: "trick-level",
    label: "Trick Level",
    unit: "level",
    inputType: "grade",
    placeholder: "5",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  paddleboarding: {
    benchmarkSlug: "max-speed",
    label: "Max Speed",
    unit: "kmh",
    inputType: "number",
    placeholder: "12",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
  },

  // Outdoor
  hiking: {
    benchmarkSlug: "vertical-gain",
    label: "Single Day Vertical Gain",
    unit: "meters",
    inputType: "number",
    placeholder: "1500",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
    helpText: "Best single-day elevation gain",
  },
  "rock-climbing": {
    benchmarkSlug: "grade-level",
    label: "Redpoint Grade",
    unit: "level",
    inputType: "grade",
    placeholder: "7a / 5.11d",
    requiresVerification: false,
    fairnessBadge: "RATING",
    helpText: "Enter your best onsight or redpoint grade",
  },
  bouldering: {
    benchmarkSlug: "grade-level",
    label: "Max Grade",
    unit: "level",
    inputType: "grade",
    placeholder: "V6 / 6c",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },

  // Winter
  skiing: {
    benchmarkSlug: "max-speed",
    label: "Max Speed",
    unit: "kmh",
    inputType: "number",
    placeholder: "80",
    requiresVerification: true,
    fairnessBadge: "SEGMENT",
  },
  snowboarding: {
    benchmarkSlug: "max-speed",
    label: "Max Speed",
    unit: "kmh",
    inputType: "number",
    placeholder: "70",
    requiresVerification: true,
    fairnessBadge: "SEGMENT",
  },
  "cross-country-skiing": {
    benchmarkSlug: "10k",
    label: "10K Time",
    unit: "seconds",
    inputType: "time",
    placeholder: "35:00",
    requiresVerification: true,
    fairnessBadge: "STANDARD",
  },

  // Team sports - skip benchmark, use Fitness Score
  football: {
    skipBenchmark: true,
    message: "Your Fitness Score will rank you as you log activity and matches.",
  },
  basketball: {
    skipBenchmark: true,
    message: "Your Fitness Score will rank you as you log activity and matches.",
  },
  volleyball: {
    skipBenchmark: true,
    message: "Your Fitness Score will rank you as you log activity and matches.",
  },
  hockey: {
    skipBenchmark: true,
    message: "Your Fitness Score will rank you as you log activity and matches.",
  },
  handball: {
    skipBenchmark: true,
    message: "Your Fitness Score will rank you as you log activity and matches.",
  },
  rugby: {
    skipBenchmark: true,
    message: "Your Fitness Score will rank you as you log activity and matches.",
  },

  // Racket sports
  tennis: {
    benchmarkSlug: "wins",
    label: "Match Wins",
    unit: "wins",
    inputType: "number",
    placeholder: "10",
    requiresVerification: false,
    fairnessBadge: "RATING",
    helpText: "ELO rating builds from match results",
  },
  badminton: {
    benchmarkSlug: "wins",
    label: "Match Wins",
    unit: "wins",
    inputType: "number",
    placeholder: "5",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  squash: {
    benchmarkSlug: "wins",
    label: "Match Wins",
    unit: "wins",
    inputType: "number",
    placeholder: "5",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  "table-tennis": {
    benchmarkSlug: "wins",
    label: "Match Wins",
    unit: "wins",
    inputType: "number",
    placeholder: "10",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  pickleball: {
    benchmarkSlug: "wins",
    label: "Match Wins",
    unit: "wins",
    inputType: "number",
    placeholder: "5",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  padel: {
    benchmarkSlug: "wins",
    label: "Match Wins",
    unit: "wins",
    inputType: "number",
    placeholder: "5",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },

  // Combat
  boxing: {
    benchmarkSlug: "belt-level",
    label: "Experience Level",
    unit: "level",
    inputType: "grade",
    placeholder: "Amateur / Semi-Pro / Pro",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  mma: {
    benchmarkSlug: "belt-level",
    label: "Belt Level",
    unit: "level",
    inputType: "grade",
    placeholder: "Blue Belt",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  "brazilian-jiu-jitsu": {
    benchmarkSlug: "belt-level",
    label: "Belt",
    unit: "level",
    inputType: "grade",
    placeholder: "Blue Belt",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },
  wrestling: {
    benchmarkSlug: "belt-level",
    label: "Experience Level",
    unit: "level",
    inputType: "grade",
    placeholder: "Intermediate",
    requiresVerification: false,
    fairnessBadge: "RATING",
  },

  // Mind & Body
  yoga: {
    benchmarkSlug: "weekly-sessions",
    label: "Weekly Sessions",
    unit: "sessions",
    inputType: "number",
    placeholder: "4",
    requiresVerification: false,
    fairnessBadge: "STANDARD",
    helpText: "How many yoga sessions do you do per week?",
  },
  pilates: {
    benchmarkSlug: "weekly-sessions",
    label: "Weekly Sessions",
    unit: "sessions",
    inputType: "number",
    placeholder: "3",
    requiresVerification: false,
    fairnessBadge: "STANDARD",
  },
}

/**
 * Get benchmark config for a sport
 */
export function getBenchmarkConfig(sportSlug: string): SportBenchmarkConfig | undefined {
  return SPORT_BENCHMARK_MAP[sportSlug]
}

/**
 * Check if a sport requires benchmark skip (team sports)
 */
export function isBenchmarkSkipped(config: SportBenchmarkConfig): config is { skipBenchmark: true; message: string } {
  return "skipBenchmark" in config && config.skipBenchmark === true
}

/**
 * Parse time input to seconds
 * Accepts formats: "25:30", "25m 30s", "25m30s", "1530" (raw seconds)
 */
export function parseTimeToSeconds(input: string): number | null {
  // Clean input
  const cleaned = input.trim().toLowerCase()

  // Try MM:SS or HH:MM:SS format
  const colonMatch = cleaned.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/)
  if (colonMatch) {
    const parts = colonMatch.slice(1).filter(Boolean).map(Number)
    if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }
  }

  // Try "Xm Ys" or "XmYs" format
  const minsMatch = cleaned.match(/(\d+)\s*m(?:in(?:ute)?s?)?\s*(\d+)?\s*s(?:ec(?:ond)?s?)?/i)
  if (minsMatch) {
    const mins = parseInt(minsMatch[1], 10)
    const secs = minsMatch[2] ? parseInt(minsMatch[2], 10) : 0
    return mins * 60 + secs
  }

  // Try pure seconds
  const secsMatch = cleaned.match(/^(\d+)(?:\s*s(?:ec(?:ond)?s?)?)?$/)
  if (secsMatch) {
    return parseInt(secsMatch[1], 10)
  }

  return null
}

/**
 * Format seconds to display time (MM:SS or HH:MM:SS)
 */
export function formatSecondsToTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/**
 * Parse grade input to numeric value (for climbing, martial arts, etc.)
 * This is a simplified implementation - real app would have grade conversion tables
 */
export function parseGradeToNumeric(input: string, sportSlug: string): number | null {
  const cleaned = input.trim().toLowerCase()

  // Climbing grades (simplified French -> numeric)
  if (sportSlug === "rock-climbing" || sportSlug === "bouldering") {
    const gradeMap: Record<string, number> = {
      "4": 4, "5a": 5, "5b": 5.5, "5c": 6, "6a": 6.5, "6a+": 7, "6b": 7.5, "6b+": 8,
      "6c": 8.5, "6c+": 9, "7a": 9.5, "7a+": 10, "7b": 10.5, "7b+": 11, "7c": 11.5,
      "7c+": 12, "8a": 12.5, "8a+": 13, "8b": 13.5, "8b+": 14, "8c": 14.5, "8c+": 15,
      // V grades for bouldering
      "v0": 4, "v1": 5, "v2": 6, "v3": 7, "v4": 8, "v5": 9, "v6": 10, "v7": 11,
      "v8": 12, "v9": 13, "v10": 14, "v11": 15, "v12": 16, "v13": 17, "v14": 18,
    }
    return gradeMap[cleaned] ?? null
  }

  // Belt levels for martial arts
  if (sportSlug === "brazilian-jiu-jitsu" || sportSlug === "mma") {
    const beltMap: Record<string, number> = {
      "white": 1, "blue": 2, "purple": 3, "brown": 4, "black": 5,
      "white belt": 1, "blue belt": 2, "purple belt": 3, "brown belt": 4, "black belt": 5,
    }
    return beltMap[cleaned] ?? null
  }

  // Try parsing as plain number
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

/**
 * Parse any benchmark input based on type
 */
export function parseBenchmarkInput(
  input: string,
  inputType: "time" | "number" | "grade",
  sportSlug: string
): number | null {
  switch (inputType) {
    case "time":
      return parseTimeToSeconds(input)
    case "grade":
      return parseGradeToNumeric(input, sportSlug)
    case "number":
      const num = parseFloat(input.replace(/[^\d.]/g, ""))
      return isNaN(num) ? null : num
  }
}
