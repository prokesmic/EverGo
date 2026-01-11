/**
 * Power System Unit Tests
 *
 * Tests the core power computation engine:
 * - Saturation curves prevent duration gaming
 * - Intensity multipliers are bounded for manual entries
 * - Confidence reduces when data is suspicious
 * - Race guardrails work correctly
 *
 * Run with: npx tsx tests/power.test.ts
 */

import { computePower, PowerInput } from "../lib/power/computePower"
import { computeConfidence, ConfidenceInput } from "../lib/power/confidence"
import { validateIntensity, rpeToIntensityMode } from "../lib/power/validateIntensity"
import { SportCategory, VerificationTier } from "@prisma/client"

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

function assertTrue(condition: boolean, name: string) {
  if (condition) {
    passed++
    console.log(`  PASS: ${name}`)
  } else {
    failed++
    console.log(`  FAIL: ${name}`)
  }
}

function assertFalse(condition: boolean, name: string) {
  assertTrue(!condition, name)
}

// =============================================================================
// TEST HELPERS
// =============================================================================

function makeInput(overrides: Partial<PowerInput> = {}): PowerInput {
  return {
    durationSeconds: 3600, // 1 hour
    sportCategory: "ENDURANCE" as SportCategory,
    intensityMode: "moderate",
    source: "STRAVA",
    verificationTier: "SILVER" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: false,
    hasPower: false,
    isAnomalous: false,
    ...overrides,
  }
}

// =============================================================================
// SATURATION CURVE TESTS
// =============================================================================

console.log("\n=== Duration Saturation Tests ===")

{
  const result30min = computePower(makeInput({ durationSeconds: 30 * 60 }))
  const result45min = computePower(makeInput({ durationSeconds: 45 * 60 }))
  const ratio = result45min.durationFactor / result30min.durationFactor
  assertRange(ratio, 1.4, 1.6, "45min should be ~1.5x 30min power (linear zone)")
}

{
  const result60min = computePower(makeInput({ durationSeconds: 60 * 60 }))
  const result120min = computePower(makeInput({ durationSeconds: 120 * 60 }))
  const ratio = result120min.durationFactor / result60min.durationFactor
  assertTrue(ratio < 2, "2 hours should NOT be 2x the 1 hour power (diminishing)")
  assertTrue(ratio > 1, "2 hours should be more than 1 hour")
}

{
  const result3hr = computePower(makeInput({ durationSeconds: 180 * 60 }))
  const result6hr = computePower(makeInput({ durationSeconds: 360 * 60 }))
  const ratio = result6hr.durationFactor / result3hr.durationFactor
  assertTrue(ratio < 1.3, "6 hours should only be slightly more than 3 hours (flat zone)")
}

{
  // Walking vs running test
  const walkResult = computePower(
    makeInput({
      durationSeconds: 5 * 60 * 60, // 5 hour walk
      sportCategory: "OUTDOOR" as SportCategory,
      intensityMode: "moderate",
    })
  )

  const runResult = computePower(
    makeInput({
      durationSeconds: 45 * 60, // 45 min HIIT
      sportCategory: "ENDURANCE" as SportCategory,
      intensityMode: "hard",
    })
  )

  assertTrue(
    runResult.powerFinal >= walkResult.powerFinal * 0.8,
    "45-min hard run should beat or nearly equal 5-hour moderate walk"
  )
}

// =============================================================================
// INTENSITY TESTS
// =============================================================================

console.log("\n=== Intensity Multiplier Tests ===")

{
  const easyManual = computePower(
    makeInput({ source: "MANUAL", intensityMode: "easy" })
  )
  const hardManual = computePower(
    makeInput({ source: "MANUAL", intensityMode: "hard" })
  )
  const ratio = hardManual.intensityFactor / easyManual.intensityFactor
  assertTrue(ratio < 1.35, "Manual: hard should be <35% more than easy")
}

{
  const easyVerified = computePower(
    makeInput({ source: "STRAVA", intensityMode: "easy" })
  )
  const hardVerified = computePower(
    makeInput({ source: "STRAVA", intensityMode: "hard" })
  )
  const ratio = hardVerified.intensityFactor / easyVerified.intensityFactor
  assertTrue(ratio > 1.3, "Verified: hard should be >30% more than easy")
}

// =============================================================================
// CONFIDENCE TESTS
// =============================================================================

console.log("\n=== Confidence Weight Tests ===")

{
  const manualConf = computeConfidence({
    source: "MANUAL",
    verificationTier: "BRONZE" as VerificationTier,
    hasGPS: false,
    hasHeartRate: false,
    hasCadence: false,
    hasPower: false,
    isAnomalous: false,
    intensityMode: "moderate",
  })

  const stravaConf = computeConfidence({
    source: "STRAVA",
    verificationTier: "SILVER" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: false,
    hasPower: false,
    isAnomalous: false,
    intensityMode: "moderate",
  })

  assertTrue(manualConf.weight < stravaConf.weight, "Manual entries should have lower confidence")
}

{
  const normal = computeConfidence({
    source: "STRAVA",
    verificationTier: "SILVER" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: false,
    hasPower: false,
    isAnomalous: false,
    intensityMode: "moderate",
  })

  const anomalous = computeConfidence({
    source: "STRAVA",
    verificationTier: "SILVER" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: false,
    hasPower: false,
    isAnomalous: true,
    intensityMode: "moderate",
  })

  assertTrue(anomalous.weight < normal.weight, "Anomaly flag should reduce confidence")
}

{
  const consistentHR = computeConfidence({
    source: "STRAVA",
    verificationTier: "SILVER" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: false,
    hasPower: false,
    isAnomalous: false,
    intensityMode: "hard",
    avgHeartRate: 170,
    userMaxHR: 200,
  })

  const inconsistentHR = computeConfidence({
    source: "STRAVA",
    verificationTier: "SILVER" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: false,
    hasPower: false,
    isAnomalous: false,
    intensityMode: "hard",
    avgHeartRate: 120, // Too low for "hard"
    userMaxHR: 200,
  })

  assertTrue(inconsistentHR.weight < consistentHR.weight, "RPE/HR mismatch should reduce confidence")
}

{
  const manualWithData = computeConfidence({
    source: "MANUAL",
    verificationTier: "GOLD" as VerificationTier,
    hasGPS: true,
    hasHeartRate: true,
    hasCadence: true,
    hasPower: true,
    isAnomalous: false,
    intensityMode: "moderate",
  })

  assertTrue(manualWithData.weight <= 1.0, "Manual entries should cap at 1.0 confidence")
}

// =============================================================================
// RACE GUARDRAILS TESTS
// =============================================================================

console.log("\n=== Race Multiplier Guardrails Tests ===")

{
  const result = validateIntensity({
    claimedIntensity: "race",
    verificationTier: "BRONZE" as VerificationTier,
    hasEventLink: true,
    weeklyRaceCount: 10,
  })
  assertTrue(result.allowedIntensity === "race", "Event-linked races should always be allowed")
  assertFalse(result.wasDowngraded, "Event-linked races should not be downgraded")
}

{
  const result = validateIntensity({
    claimedIntensity: "race",
    verificationTier: "GOLD" as VerificationTier,
    hasEventLink: false,
    weeklyRaceCount: 100,
  })
  assertTrue(result.allowedIntensity === "race", "Gold tier gets unlimited races")
  assertFalse(result.wasDowngraded, "Gold tier races should not be downgraded")
}

{
  const result = validateIntensity({
    claimedIntensity: "race",
    verificationTier: "SILVER" as VerificationTier,
    hasEventLink: false,
    weeklyRaceCount: 5,
  })
  assertTrue(result.allowedIntensity === "hard", "Should downgrade race to hard when limit exceeded")
  assertTrue(result.wasDowngraded, "Should flag as downgraded")
  assertTrue(!!result.downgradeReason, "Should provide downgrade reason")
}

{
  const result = validateIntensity({
    claimedIntensity: "hard",
    verificationTier: "BRONZE" as VerificationTier,
    hasEventLink: false,
    weeklyRaceCount: 100,
  })
  assertTrue(result.allowedIntensity === "hard", "Non-race intensities should be allowed")
  assertFalse(result.wasDowngraded, "Non-race should not be downgraded")
}

// =============================================================================
// RPE MAPPING TESTS
// =============================================================================

console.log("\n=== RPE to Intensity Mapping Tests ===")

assertTrue(rpeToIntensityMode(1) === "easy", "RPE 1 -> easy")
assertTrue(rpeToIntensityMode(3) === "easy", "RPE 3 -> easy")
assertTrue(rpeToIntensityMode(4) === "moderate", "RPE 4 -> moderate")
assertTrue(rpeToIntensityMode(5) === "moderate", "RPE 5 -> moderate")
assertTrue(rpeToIntensityMode(6) === "hard", "RPE 6 -> hard")
assertTrue(rpeToIntensityMode(7) === "hard", "RPE 7 -> hard")
assertTrue(rpeToIntensityMode(8) === "race", "RPE 8 -> race")
assertTrue(rpeToIntensityMode(10) === "race", "RPE 10 -> race")
assertTrue(rpeToIntensityMode(null) === "moderate", "RPE null -> moderate")

// =============================================================================
// POWER CEILING TESTS
// =============================================================================

console.log("\n=== Power Ceiling Tests ===")

{
  const result = computePower(
    makeInput({
      durationSeconds: 10 * 60 * 60, // 10 hours
      intensityMode: "race",
      verificationTier: "GOLD" as VerificationTier,
    })
  )
  // Either clamped OR already within ceiling due to saturation - both are valid
  assertTrue(
    result.powerFinal <= 300 || !!result.clampReason,
    "Power should be capped by ceiling or saturation"
  )
  assertTrue(result.powerFinal <= 300, "Should not exceed ENDURANCE max total (300)")
}

// =============================================================================
// RESULTS
// =============================================================================

console.log("\n" + "=".repeat(50))
console.log(`RESULTS: ${passed} passed, ${failed} failed`)
console.log("=".repeat(50))

if (failed > 0) {
  process.exit(1)
}
