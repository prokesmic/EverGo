import { NextResponse } from "next/server"
import { getSportConfig, getSportMetrics } from "@/lib/sports/config"
import { normalizeSportSlug } from "@/lib/sports/normalizeSportSlug"

/**
 * GET /api/rankings/benchmark
 *
 * V11: Returns sport-specific vanity metrics from SPORTS_CONFIG
 * These are the "brag" metrics that athletes compete on.
 *
 * Query params:
 * - sportSlug: The sport to get benchmarks for (e.g., "kitesurfing", "running")
 *
 * Returns:
 * - benchmarks: Array of available metrics for the sport
 * - primaryMetric: The default "vanity" metric for this sport
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const rawSlug = url.searchParams.get("sportSlug") ?? "multisport"

    // Normalize the slug
    const sportSlug = normalizeSportSlug(rawSlug) ?? rawSlug

    // Get sport config
    const config = getSportConfig(sportSlug)
    const metrics = getSportMetrics(sportSlug)

    // Build benchmark options from the sport's ranking metrics
    const benchmarks = metrics.map((metric) => ({
      id: metric.key,
      slug: metric.key,
      name: metric.label,
      unit: metric.unit ?? "",
      description: metric.description ?? "",
      requiresSensor: metric.requiresSensor,
      format: metric.format,
      higherIsBetter: metric.higherIsBetter,
    }))

    return NextResponse.json({
      benchmarks,
      primaryMetric: config.primaryMetric,
      secondaryMetrics: config.secondaryMetrics,
      sportName: config.name,
      category: config.category,
    })
  } catch (error) {
    console.error("[benchmark] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch benchmarks" },
      { status: 500 }
    )
  }
}
