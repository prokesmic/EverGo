/**
 * Fitness Score / Sport Index Test Vectors
 *
 * These tests verify the deterministic behavior of the scoring algorithms.
 * Run with: npx tsx tests/fitness-score.test.ts
 *
 * @module tests/fitness-score.test
 */

import {
  calculateMETHours,
  calculateIntensityFromHeartRate,
  calculateIntensityFromRPE,
  calculateIntensityFromElevation,
  calculateIntensityFactor,
  calculateActivityFitnessScore,
  calculateWindowedFitnessScore,
  calculateEffortPoints,
  SPORT_MET_DEFAULTS,
  type FitnessScoreInput,
} from "../lib/scoring/fitness-score"

// =============================================================================
// TEST UTILITIES
// =============================================================================

let passed = 0
let failed = 0

function assertEqual(actual: number, expected: number, tolerance: number, name: string) {
  const diff = Math.abs(actual - expected)
  if (diff <= tolerance) {
    passed++
    console.log(`  PASS: ${name}`)
  } else {
    failed++
    console.log(`  FAIL: ${name}`)
    console.log(`        Expected: ${expected} (+/- ${tolerance})`)
    console.log(`        Actual:   ${actual}`)
    console.log(`        Diff:     ${diff}`)
  }
}

function assertRange(actual: number, min: number, max: number, name: string) {
  if (actual >= min && actual <= max) {
    passed++
    console.log(`  PASS: ${name}`)
  } else {
    failed++
    console.log(`  FAIL: ${name}`)
    console.log(`        Expected: ${min} - ${max}`)
    console.log(`        Actual:   ${actual}`)
  }
}

// =============================================================================
// TEST VECTORS
// =============================================================================

console.log("\n=== Sport MET Defaults ===\n")

// Vector 1: Running MET should be 9.8
assertEqual(SPORT_MET_DEFAULTS.running, 9.8, 0.01, "Running MET = 9.8")

// Vector 2: Cycling MET should be 7.5
assertEqual(SPORT_MET_DEFAULTS.cycling, 7.5, 0.01, "Cycling MET = 7.5")

// Vector 3: Swimming MET should be 8.0
assertEqual(SPORT_MET_DEFAULTS.swimming, 8.0, 0.01, "Swimming MET = 8.0")

// Vector 4: Yoga MET should be 2.5
assertEqual(SPORT_MET_DEFAULTS.yoga, 2.5, 0.01, "Yoga MET = 2.5")

console.log("\n=== Intensity Calculations ===\n")

// Vector 5: No heart rate = intensity 1.0
assertEqual(calculateIntensityFromHeartRate(null, null), 1.0, 0.01, "No HR data = 1.0 intensity")

// Vector 6: 65% max HR = Zone 3 = 1.0 intensity (120/185 = 0.649)
assertEqual(calculateIntensityFromHeartRate(120, 185), 1.0, 0.01, "65% max HR = 1.0")

// Vector 7: 85% max HR = Zone 5a = 1.3 intensity
assertEqual(calculateIntensityFromHeartRate(157, 185), 1.3, 0.05, "85% max HR = 1.3")

// Vector 8: RPE 5 = moderate = ~1.05
assertEqual(calculateIntensityFromRPE(5), 0.6 + 5 * 0.09, 0.01, "RPE 5 = 1.05")

// Vector 9: RPE 10 = max = 1.5
assertEqual(calculateIntensityFromRPE(10), 0.6 + 10 * 0.09, 0.01, "RPE 10 = 1.5")

// Vector 10: Elevation 5m/min for 60 min = 1.15 intensity
assertEqual(calculateIntensityFromElevation(300, 60), 1.15, 0.01, "5m/min elevation = 1.15")

console.log("\n=== MET-Hours Calculation ===\n")

// Vector 11: 1 hour of running at base intensity
const runInput: FitnessScoreInput = {
  durationSeconds: 3600,
  sport: { metDefault: 9.8 },
}
assertEqual(calculateMETHours(runInput), 9.8, 0.1, "1hr running = 9.8 MET-hours")

// Vector 12: 30 min of cycling = 3.75 MET-hours
const cycleInput: FitnessScoreInput = {
  durationSeconds: 1800,
  sport: { metDefault: 7.5 },
}
assertEqual(calculateMETHours(cycleInput), 3.75, 0.1, "30min cycling = 3.75 MET-hours")

// Vector 13: 1 hour of running with high intensity (RPE 8) = ~12 MET-hours
const hardRunInput: FitnessScoreInput = {
  durationSeconds: 3600,
  sport: { metDefault: 9.8 },
  rpe: 8,
}
const expectedHardRun = 9.8 * 1 * (0.6 + 8 * 0.09) // 9.8 * 1.32
assertRange(calculateMETHours(hardRunInput), 12, 14, "1hr hard running = 12-14 MET-hours")

console.log("\n=== Effort Points ===\n")

// Vector 14: 1hr moderate run = 980 effort points (9.8 * 100)
assertEqual(calculateEffortPoints(runInput), 980, 10, "1hr moderate run = 980 effort points")

// Vector 15: 30min easy walk = ~200 points
const walkInput: FitnessScoreInput = {
  durationSeconds: 1800,
  sport: { metDefault: 4.0 }, // Walking
}
assertEqual(calculateEffortPoints(walkInput), 200, 20, "30min walk = 200 effort points")

console.log("\n=== Windowed Fitness Score ===\n")

// Vector 16: Weekly moderate training (5 x 1hr runs) = ~490 MET-hours * 2 = ~980
const weeklyActivities = Array(5).fill({
  durationSeconds: 3600,
  sport: { metDefault: 9.8 },
})
const windowedResult = calculateWindowedFitnessScore(weeklyActivities, 7)
assertRange(windowedResult.fitnessScore, 90, 110, "5 x 1hr runs in 7 days = ~100 fitness score")
assertEqual(windowedResult.activityCount, 5, 0, "Activity count = 5")

// Vector 17: Elite weekly training (10 x 2hr sessions at high intensity)
const eliteActivities = Array(10).fill({
  durationSeconds: 7200,
  sport: { metDefault: 10.0 },
  rpe: 7,
})
const eliteResult = calculateWindowedFitnessScore(eliteActivities, 7)
assertRange(eliteResult.fitnessScore, 400, 600, "Elite weekly training = 400-600 score")

// Vector 18: No activities = 0 score
const emptyResult = calculateWindowedFitnessScore([], 7)
assertEqual(emptyResult.fitnessScore, 0, 0, "No activities = 0 score")

console.log("\n=== Activity Fitness Score ===\n")

// Vector 19: Single 1hr run normalized score
const singleRunResult = calculateActivityFitnessScore(runInput)
assertRange(singleRunResult.normalizedScore, 90, 100, "1hr run normalized = 90-100")
assertRange(singleRunResult.rawEffort, 9, 10, "1hr run raw effort = 9-10 MET-hours")

// Vector 20: Intensity factor without data = 1.0
assertEqual(singleRunResult.intensityFactor, 1.0, 0.01, "No intensity data = 1.0 factor")

console.log("\n=== SUMMARY ===\n")
console.log(`Passed: ${passed}`)
console.log(`Failed: ${failed}`)
console.log(`Total:  ${passed + failed}`)

if (failed > 0) {
  process.exit(1)
}
