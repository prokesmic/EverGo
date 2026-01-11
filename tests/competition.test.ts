/**
 * Competition System Unit Tests
 *
 * Tests for Phase 2 Competition Fatigue features:
 * - Recovery Mode activation rules
 * - Consistency League (idempotent per day)
 * - Community Goals contribution
 *
 * Run with: npx tsx tests/competition.test.ts
 */

import { RECOVERY_CONFIG } from "../lib/competition/recoveryMode"
import {
  getCurrentWeekKey,
  getCurrentMonthKey,
  getSeasonKey,
} from "../lib/competition/consistency"

// =============================================================================
// TEST UTILITIES
// =============================================================================

let passed = 0
let failed = 0

function assertEqual<T>(actual: T, expected: T, name: string) {
  if (actual === expected) {
    passed++
    console.log(`  PASS: ${name}`)
  } else {
    failed++
    console.log(`  FAIL: ${name}`)
    console.log(`        Expected: ${expected}`)
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
// RECOVERY MODE CONFIG TESTS
// =============================================================================

console.log("\n=== Recovery Mode Configuration Tests ===")

{
  assertEqual(RECOVERY_CONFIG.minDurationDays, 3, "Min recovery duration is 3 days")
  assertEqual(RECOVERY_CONFIG.maxDurationDays, 14, "Max recovery duration is 14 days")
  assertEqual(RECOVERY_CONFIG.maxUsesPerSeason, 2, "Max 2 recovery periods per season")
  assertEqual(RECOVERY_CONFIG.cooldownDays, 7, "7 day cooldown between uses")
}

// =============================================================================
// RECOVERY MODE LOGIC TESTS (Mock-based)
// =============================================================================

console.log("\n=== Recovery Mode Logic Tests ===")

{
  // Test: Can't activate when already active
  const mockActiveStreak = {
    isRecoveryMode: true,
    recoveryModeEndsAt: new Date(Date.now() + 86400000), // Tomorrow
    recoveryModeUsesThisSeason: 1,
    lastRecoveryModeEndedAt: null,
  }

  const now = new Date()
  const isActive = mockActiveStreak.isRecoveryMode &&
    mockActiveStreak.recoveryModeEndsAt &&
    mockActiveStreak.recoveryModeEndsAt > now

  assertTrue(isActive, "Should detect active recovery mode")
}

{
  // Test: Can't activate when uses exhausted
  const mockExhaustedStreak = {
    isRecoveryMode: false,
    recoveryModeEndsAt: null,
    recoveryModeUsesThisSeason: 2,
    lastRecoveryModeEndedAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
  }

  const usesRemaining = RECOVERY_CONFIG.maxUsesPerSeason - mockExhaustedStreak.recoveryModeUsesThisSeason
  assertEqual(usesRemaining, 0, "No uses remaining after 2 uses")
}

{
  // Test: Cooldown enforcement
  const mockCooldownStreak = {
    isRecoveryMode: false,
    recoveryModeEndsAt: null,
    recoveryModeUsesThisSeason: 1,
    lastRecoveryModeEndedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
  }

  const cooldownEnds = new Date(
    mockCooldownStreak.lastRecoveryModeEndedAt!.getTime() +
    RECOVERY_CONFIG.cooldownDays * 86400000
  )
  const isInCooldown = new Date() < cooldownEnds

  assertTrue(isInCooldown, "Should be in cooldown period (3 days < 7 days)")
}

{
  // Test: Can activate after cooldown
  const mockReadyStreak = {
    isRecoveryMode: false,
    recoveryModeEndsAt: null,
    recoveryModeUsesThisSeason: 1,
    lastRecoveryModeEndedAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
  }

  const cooldownEnds = new Date(
    mockReadyStreak.lastRecoveryModeEndedAt!.getTime() +
    RECOVERY_CONFIG.cooldownDays * 86400000
  )
  const isInCooldown = new Date() < cooldownEnds

  assertFalse(isInCooldown, "Should NOT be in cooldown (10 days > 7 days)")

  const usesRemaining = RECOVERY_CONFIG.maxUsesPerSeason - mockReadyStreak.recoveryModeUsesThisSeason
  assertTrue(usesRemaining > 0, "Should have uses remaining")
}

// =============================================================================
// CONSISTENCY PERIOD KEY TESTS
// =============================================================================

console.log("\n=== Consistency Period Key Tests ===")

{
  const weekKey = getCurrentWeekKey()
  assertTrue(weekKey.match(/^\d{4}-W\d{2}$/) !== null, "Week key format: YYYY-Www")
}

{
  const monthKey = getCurrentMonthKey()
  assertTrue(monthKey.match(/^\d{4}-\d{2}$/) !== null, "Month key format: YYYY-MM")
}

{
  const seasonKey = getSeasonKey()
  assertTrue(seasonKey.startsWith("season-"), "Season key starts with 'season-'")
  assertTrue(
    seasonKey.includes("winter") ||
    seasonKey.includes("spring") ||
    seasonKey.includes("summer") ||
    seasonKey.includes("fall"),
    "Season key includes season name"
  )
}

{
  const customSeasonKey = getSeasonKey("custom-123")
  assertEqual(customSeasonKey, "season-custom-123", "Custom season ID is wrapped")
}

// =============================================================================
// CONSISTENCY IDEMPOTENCY LOGIC TESTS
// =============================================================================

console.log("\n=== Consistency Idempotency Tests ===")

{
  // Test: Same day should not increment daysActive
  const activeDays = ["2025-01-10", "2025-01-11"]
  const newDate = "2025-01-11" // Same as existing

  const isNewDay = !activeDays.includes(newDate)
  assertFalse(isNewDay, "Same day should NOT count as new")
}

{
  // Test: Different day should increment daysActive
  const activeDays = ["2025-01-10", "2025-01-11"]
  const newDate = "2025-01-12" // New day

  const isNewDay = !activeDays.includes(newDate)
  assertTrue(isNewDay, "Different day SHOULD count as new")
}

{
  // Test: Multiple activities same day still count as 1 day
  const activeDays: string[] = []
  const activities = [
    { date: "2025-01-10", duration: 3600 },
    { date: "2025-01-10", duration: 1800 }, // Same day
    { date: "2025-01-11", duration: 2700 },
  ]

  let daysActive = 0
  let totalActivities = 0

  for (const act of activities) {
    totalActivities++
    if (!activeDays.includes(act.date)) {
      activeDays.push(act.date)
      daysActive++
    }
  }

  assertEqual(daysActive, 2, "Only 2 unique days despite 3 activities")
  assertEqual(totalActivities, 3, "Total activities is 3")
}

// =============================================================================
// COMMUNITY GOAL METRIC TESTS
// =============================================================================

console.log("\n=== Community Goal Metric Tests ===")

{
  // Test: Distance conversion
  const distanceMeters = 5000 // 5km
  const distanceKm = distanceMeters / 1000
  assertEqual(distanceKm, 5, "Distance converts meters to km correctly")
}

{
  // Test: Duration conversion
  const durationSeconds = 3600 // 1 hour
  const durationMin = durationSeconds / 60
  assertEqual(durationMin, 60, "Duration converts seconds to minutes correctly")
}

{
  // Test: Activity count metric
  const metricType = "ACTIVITIES"
  const value = metricType === "ACTIVITIES" ? 1 : 0
  assertEqual(value, 1, "Activity count metric is always 1 per activity")
}

{
  // Test: Progress percentage calculation
  const targetValue = 1000
  const currentValue = 750
  const progressPercent = Math.min(100, (currentValue / targetValue) * 100)
  assertEqual(progressPercent, 75, "Progress percentage is 75% at 750/1000")
}

{
  // Test: Progress clamped at 100%
  const targetValue = 1000
  const currentValue = 1200 // Over target
  const progressPercent = Math.min(100, (currentValue / targetValue) * 100)
  assertEqual(progressPercent, 100, "Progress percentage capped at 100%")
}

{
  // Test: Goal completion detection
  const targetValue = 1000
  const currentValue = 1000
  const goalCompleted = currentValue >= targetValue
  assertTrue(goalCompleted, "Goal detected as completed at target")
}

// =============================================================================
// SPORT MATCHING TESTS
// =============================================================================

console.log("\n=== Community Goal Sport Matching Tests ===")

{
  // Test: Global goal (null sportId) matches any sport
  const goalSportId: string | null = null
  const activitySportId = "running"

  const matches = goalSportId === null || goalSportId === activitySportId
  assertTrue(matches, "Global goal (null sportId) matches any activity")
}

{
  // Test: Sport-specific goal matches same sport
  const goalSportId = "running"
  const activitySportId = "running"

  const matches = goalSportId === null || goalSportId === activitySportId
  assertTrue(matches, "Running goal matches running activity")
}

{
  // Test: Sport-specific goal doesn't match different sport
  const goalSportId: string = "running"
  const activitySportId: string = "cycling"

  const matches = goalSportId === null || goalSportId === activitySportId
  assertFalse(matches, "Running goal does NOT match cycling activity")
}

// =============================================================================
// BOUNDARY TESTS
// =============================================================================

console.log("\n=== Boundary Tests ===")

{
  // Test: Recovery mode duration clamping - below min
  const requestedDuration = 1
  const clampedDuration = Math.max(
    RECOVERY_CONFIG.minDurationDays,
    Math.min(RECOVERY_CONFIG.maxDurationDays, requestedDuration)
  )
  assertEqual(clampedDuration, 3, "Duration clamped to minimum (3 days)")
}

{
  // Test: Recovery mode duration clamping - above max
  const requestedDuration = 30
  const clampedDuration = Math.max(
    RECOVERY_CONFIG.minDurationDays,
    Math.min(RECOVERY_CONFIG.maxDurationDays, requestedDuration)
  )
  assertEqual(clampedDuration, 14, "Duration clamped to maximum (14 days)")
}

{
  // Test: Recovery mode duration clamping - within range
  const requestedDuration = 7
  const clampedDuration = Math.max(
    RECOVERY_CONFIG.minDurationDays,
    Math.min(RECOVERY_CONFIG.maxDurationDays, requestedDuration)
  )
  assertEqual(clampedDuration, 7, "Valid duration passed through unchanged")
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
