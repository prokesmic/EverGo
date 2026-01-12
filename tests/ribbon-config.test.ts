/**
 * Unit tests for Ribbon Config Registry
 *
 * Tests:
 * 1. normalizeSportSlug maps kiteboarding -> kitesurfing
 * 2. ribbonConfig resolver picks correct config for sport/category
 * 3. MultiSport default metrics set includes VARIETY and DAYS_ACTIVE
 * 4. Global Rank is always tile #1
 */

import { describe, test, expect } from "vitest"
import { normalizeSportSlug } from "../lib/sports/normalizeSportSlug"
import {
  resolveRibbonConfig,
  MULTISPORT_CONFIG,
  UNIVERSAL_FALLBACK,
  SPORT_OVERRIDES,
  CATEGORY_DEFAULTS,
} from "../lib/ribbon/ribbonConfig"

describe("normalizeSportSlug", () => {
  test("maps kiteboarding to kitesurfing", () => {
    expect(normalizeSportSlug("kiteboarding")).toBe("kitesurfing")
    expect(normalizeSportSlug("kite-boarding")).toBe("kitesurfing")
    expect(normalizeSportSlug("Kite Boarding")).toBe("kitesurfing")
  })

  test("maps multisport variants", () => {
    expect(normalizeSportSlug("multi-sport")).toBe("multisport")
    expect(normalizeSportSlug("all-sports")).toBe("multisport")
    expect(normalizeSportSlug("MultiSport")).toBe("multisport")
  })

  test("preserves unknown slugs", () => {
    expect(normalizeSportSlug("running")).toBe("running")
    expect(normalizeSportSlug("cycling")).toBe("cycling")
  })

  test("handles null/undefined", () => {
    expect(normalizeSportSlug(null)).toBe(null)
    expect(normalizeSportSlug(undefined)).toBe(null)
  })
})

describe("resolveRibbonConfig", () => {
  test("returns sport override when available", () => {
    const config = resolveRibbonConfig("kitesurfing", "WATER_BOARD")
    expect(config).toBe(SPORT_OVERRIDES["kitesurfing"])
    expect(config[0].key).toBe("GLOBAL_RANK") // First tile is always Global Rank
  })

  test("returns category default when no sport override", () => {
    const config = resolveRibbonConfig("unknown-sport", "ENDURANCE")
    expect(config).toBe(CATEGORY_DEFAULTS["ENDURANCE"])
    expect(config[0].key).toBe("GLOBAL_RANK")
  })

  test("returns universal fallback when no sport or category match", () => {
    const config = resolveRibbonConfig("unknown-sport", null)
    expect(config).toBe(UNIVERSAL_FALLBACK)
    expect(config[0].key).toBe("GLOBAL_RANK")
  })

  test("returns MultiSport config for multisport slug", () => {
    const config = resolveRibbonConfig("multisport", "GENERIC")
    expect(config).toBe(SPORT_OVERRIDES["multisport"])
  })
})

describe("MultiSport Config", () => {
  test("includes VARIETY metric", () => {
    const hasVariety = MULTISPORT_CONFIG.some((m) => m.key === "VARIETY")
    expect(hasVariety).toBe(true)
  })

  test("includes DAYS_ACTIVE metric", () => {
    const hasDaysActive = MULTISPORT_CONFIG.some((m) => m.key === "DAYS_ACTIVE")
    expect(hasDaysActive).toBe(true)
  })

  test("has Global Rank as first tile", () => {
    expect(MULTISPORT_CONFIG[0].key).toBe("GLOBAL_RANK")
  })

  test("has exactly 5 tiles", () => {
    expect(MULTISPORT_CONFIG.length).toBe(5)
  })
})

describe("All Configs", () => {
  test("all sport overrides have Global Rank first", () => {
    for (const [slug, config] of Object.entries(SPORT_OVERRIDES)) {
      expect(config[0].key).toBe("GLOBAL_RANK")
    }
  })

  test("all category defaults have Global Rank first", () => {
    for (const [category, config] of Object.entries(CATEGORY_DEFAULTS)) {
      if (config) {
        expect(config[0].key).toBe("GLOBAL_RANK")
      }
    }
  })

  test("universal fallback has Global Rank first", () => {
    expect(UNIVERSAL_FALLBACK[0].key).toBe("GLOBAL_RANK")
  })
})
