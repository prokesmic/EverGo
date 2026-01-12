/**
 * Unit tests for Sports Configuration
 *
 * V11: Tests for SPORTS_CONFIG and sensor source validation
 */

import { describe, test, expect } from "vitest"
import {
  getSportConfig,
  getSportMetric,
  getSportMetrics,
  isSensorSource,
  SENSOR_SOURCES,
  metricRequiresSensor,
  getDefaultLeaderboardMetric,
} from "../lib/sports/config"

describe("isSensorSource", () => {
  test("identifies STRAVA as sensor source", () => {
    expect(isSensorSource("STRAVA")).toBe(true)
    expect(isSensorSource("strava")).toBe(true)
  })

  test("identifies GARMIN as sensor source", () => {
    expect(isSensorSource("GARMIN")).toBe(true)
    expect(isSensorSource("garmin")).toBe(true)
  })

  test("identifies file imports as sensor sources", () => {
    expect(isSensorSource("FIT_FILE")).toBe(true)
    expect(isSensorSource("GPX")).toBe(true)
    expect(isSensorSource("TCX")).toBe(true)
  })

  test("MANUAL is NOT a sensor source", () => {
    expect(isSensorSource("MANUAL")).toBe(false)
    expect(isSensorSource("manual")).toBe(false)
  })

  test("handles null/undefined", () => {
    expect(isSensorSource(null)).toBe(false)
    expect(isSensorSource(undefined)).toBe(false)
    expect(isSensorSource("")).toBe(false)
  })
})

describe("getSportConfig", () => {
  test("returns kitesurfing config", () => {
    const config = getSportConfig("kitesurfing")
    expect(config.slug).toBe("kitesurfing")
    expect(config.primaryMetric).toBe("max_jump_height")
  })

  test("returns running config", () => {
    const config = getSportConfig("running")
    expect(config.slug).toBe("running")
    expect(config.primaryMetric).toBe("pace_5k")
  })

  test("returns multisport as default for unknown sport", () => {
    const config = getSportConfig("unknown-sport-xyz")
    expect(config.slug).toBe("multisport")
  })

  test("handles normalized slugs", () => {
    const config = getSportConfig("mtb") // Should normalize to mountain-biking
    expect(config.slug).toBe("mountain-biking")
  })
})

describe("getSportMetrics", () => {
  test("returns all metrics for a sport", () => {
    const metrics = getSportMetrics("kitesurfing")
    expect(metrics.length).toBeGreaterThan(0)
    expect(metrics.some((m) => m.key === "max_jump_height")).toBe(true)
  })

  test("includes requiresSensor flag", () => {
    const metrics = getSportMetrics("kitesurfing")
    const maxJump = metrics.find((m) => m.key === "max_jump_height")
    expect(maxJump?.requiresSensor).toBe(true)
  })
})

describe("metricRequiresSensor", () => {
  test("max_jump_height requires sensor for kitesurfing", () => {
    expect(metricRequiresSensor("kitesurfing", "max_jump_height")).toBe(true)
  })

  test("sessions does NOT require sensor", () => {
    expect(metricRequiresSensor("kitesurfing", "sessions")).toBe(false)
  })

  test("returns false for unknown metrics", () => {
    expect(metricRequiresSensor("kitesurfing", "unknown_metric")).toBe(false)
  })
})

describe("getDefaultLeaderboardMetric", () => {
  test("returns primaryMetric for kitesurfing", () => {
    expect(getDefaultLeaderboardMetric("kitesurfing")).toBe("max_jump_height")
  })

  test("returns primaryMetric for running", () => {
    expect(getDefaultLeaderboardMetric("running")).toBe("pace_5k")
  })

  test("returns multisport_index for multisport", () => {
    expect(getDefaultLeaderboardMetric("multisport")).toBe("multisport_index")
  })
})

describe("Sensor Required Metrics", () => {
  test("vanity metrics that require sensors are marked correctly", () => {
    // These metrics should require sensor data
    const sensorRequiredMetrics = [
      { sport: "kitesurfing", metric: "max_jump_height" },
      { sport: "kitesurfing", metric: "total_airtime" },
      { sport: "kitesurfing", metric: "max_speed" },
      { sport: "skiing", metric: "vertical_descent" },
      { sport: "skiing", metric: "max_speed" },
      { sport: "cycling", metric: "power_20min_wkg" },
      { sport: "running", metric: "pace_5k" },
    ]

    for (const { sport, metric } of sensorRequiredMetrics) {
      const requiresSensor = metricRequiresSensor(sport, metric)
      expect(requiresSensor).toBe(true)
    }
  })

  test("volume metrics do NOT require sensors", () => {
    // These metrics can be logged manually
    const manualMetrics = [
      { sport: "kitesurfing", metric: "sessions" },
      { sport: "running", metric: "distance" },
      { sport: "yoga", metric: "days_active" },
    ]

    for (const { sport, metric } of manualMetrics) {
      const requiresSensor = metricRequiresSensor(sport, metric)
      expect(requiresSensor).toBe(false)
    }
  })
})
