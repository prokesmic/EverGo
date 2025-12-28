import { BenchmarkMeasurementType } from "@prisma/client"
import { isBetter } from "./validity"

/**
 * Activity data needed for benchmark evaluation
 */
export interface ActivityForEvaluation {
  id: string
  userId: string
  sportId: string | null
  activityDate: Date
  durationSeconds: number | null
  distanceMeters: number | null
  avgSpeed: number | null // km/h
  elevationGain: number | null // meters
  avgPace: number | null // seconds per km
}

/**
 * Benchmark definition for evaluation
 */
export interface BenchmarkDefForEvaluation {
  id: string
  measurementType: BenchmarkMeasurementType
  unit: string
  higherIsBetter: boolean
  targetJson: unknown
  validityMonths: number
  decayAfterMonths: number
}

/**
 * Result of evaluating a benchmark against an activity
 */
export interface BenchmarkEvaluationResult {
  benchmarkId: string
  value: number
  source: "AUTO"
}

// Distance tolerance for matching (1%)
const DIST_TOLERANCE = 0.01
// Minimum absolute tolerance for short distances (100m)
const DIST_MIN_ABS = 100

/**
 * Check if an activity distance approximately matches a target distance
 */
function approxDistanceMatch(activityMeters: number, targetMeters: number): boolean {
  const diff = Math.abs(activityMeters - targetMeters)
  return diff <= Math.max(targetMeters * DIST_TOLERANCE, DIST_MIN_ABS)
}

/**
 * Extract target from JSON config
 */
function getTarget(targetJson: unknown): { distanceMeters?: number; durationSec?: number } {
  if (typeof targetJson !== "object" || targetJson === null) {
    return {}
  }
  const t = targetJson as Record<string, unknown>
  return {
    distanceMeters: typeof t.distanceMeters === "number" ? t.distanceMeters : undefined,
    durationSec: typeof t.durationSec === "number" ? t.durationSec : undefined,
  }
}

/**
 * Evaluate an activity against a set of benchmark definitions
 * Returns computed benchmark results that can be saved
 */
export function evaluateActivityBenchmarks(
  activity: ActivityForEvaluation,
  benchmarks: BenchmarkDefForEvaluation[]
): BenchmarkEvaluationResult[] {
  const results: BenchmarkEvaluationResult[] = []

  for (const benchmark of benchmarks) {
    const target = getTarget(benchmark.targetJson)

    switch (benchmark.measurementType) {
      case "TIME": {
        // TIME benchmarks with distance target: e.g., 5K time
        if (target.distanceMeters && activity.distanceMeters && activity.durationSeconds) {
          if (approxDistanceMatch(activity.distanceMeters, target.distanceMeters)) {
            results.push({
              benchmarkId: benchmark.id,
              value: activity.durationSeconds,
              source: "AUTO",
            })
          }
        }
        // TIME benchmarks with duration target: e.g., "20 min power test"
        // For these, we'd need segment/lap data - skip for MVP
        break
      }

      case "DISTANCE": {
        // DISTANCE benchmarks with duration target: e.g., "1h distance"
        if (target.durationSec && activity.durationSeconds && activity.distanceMeters) {
          // Only match if duration is within 2% of target
          const durationDiff = Math.abs(activity.durationSeconds - target.durationSec)
          if (durationDiff <= target.durationSec * 0.02) {
            results.push({
              benchmarkId: benchmark.id,
              value: activity.distanceMeters,
              source: "AUTO",
            })
          }
        }
        // Generic distance benchmark: longest distance
        if (!target.durationSec && !target.distanceMeters && activity.distanceMeters) {
          results.push({
            benchmarkId: benchmark.id,
            value: activity.distanceMeters,
            source: "AUTO",
          })
        }
        // Vertical gain
        if (benchmark.unit === "m" && activity.elevationGain && benchmark.id.includes("vertical")) {
          results.push({
            benchmarkId: benchmark.id,
            value: activity.elevationGain,
            source: "AUTO",
          })
        }
        break
      }

      case "SPEED": {
        // Max/avg speed
        if (activity.avgSpeed != null) {
          results.push({
            benchmarkId: benchmark.id,
            value: activity.avgSpeed,
            source: "AUTO",
          })
        }
        break
      }

      case "POWER": {
        // Power benchmarks require power data which isn't in our basic activity
        // Would need avgPower field from device sync
        break
      }

      // WEIGHT_REPS, GRADE_LEVEL, SCORE, RESULT, COUNT
      // These require structured user input in the activity form - handled separately
      default:
        break
    }
  }

  return results
}

/**
 * Check if an evaluated result is a new personal best
 */
export function checkIfPersonalBest(
  result: BenchmarkEvaluationResult,
  currentPb: { value: number } | null | undefined,
  higherIsBetter: boolean
): boolean {
  return isBetter({
    value: result.value,
    current: currentPb?.value ?? null,
    higherIsBetter,
  })
}
