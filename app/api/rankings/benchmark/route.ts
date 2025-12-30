import { NextResponse } from "next/server"
import {
  getBenchmarkLeaderboard,
  getBenchmarksForSportFromDb,
  type LeaderboardScope,
} from "@/src/server/rankings/getBenchmarkLeaderboard"
import { getBenchmarksForSport } from "@/src/config/benchmarks"

/**
 * GET /api/rankings/benchmark
 *
 * Query params:
 * - benchmarkId: required - the benchmark ID to get leaderboard for
 * - sportSlug: optional - if provided without benchmarkId, returns list of benchmarks for sport
 * - scope: optional - global|country|city|club (default: global)
 * - scopeValue: optional - the value for country/city filtering
 * - mode: optional - valid|allTime (default: valid)
 * - limit: optional - number of entries (default: 50)
 * - offset: optional - pagination offset (default: 0)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const benchmarkId = searchParams.get("benchmarkId")
  const sportSlug = searchParams.get("sportSlug")
  const scope = (searchParams.get("scope") || "global") as LeaderboardScope
  const scopeValue = searchParams.get("scopeValue")
  const mode = (searchParams.get("mode") || "valid") as "valid" | "allTime"
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  try {
    // If only sportSlug provided (no benchmarkId), return list of benchmarks for that sport
    if (sportSlug && !benchmarkId) {
      // First try DB benchmarks
      const dbBenchmarks = await getBenchmarksForSportFromDb(sportSlug)

      if (dbBenchmarks.length > 0) {
        return NextResponse.json({ benchmarks: dbBenchmarks })
      }

      // Fall back to config benchmarks
      const configBenchmarks = getBenchmarksForSport(sportSlug)
      return NextResponse.json({
        benchmarks: configBenchmarks.map((b) => ({
          id: b.id,
          slug: b.id,
          name: b.name,
          kind: b.kind,
          unit: b.unit,
          better: b.better,
          validityMonths: b.validityMonths,
        })),
      })
    }

    // benchmarkId is required for leaderboard
    if (!benchmarkId) {
      return NextResponse.json(
        { error: "benchmarkId is required" },
        { status: 400 }
      )
    }

    const result = await getBenchmarkLeaderboard({
      benchmarkId,
      scope,
      scopeValue,
      mode,
      limit,
      offset,
    })

    if (!result) {
      return NextResponse.json(
        { error: "Benchmark not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching benchmark leaderboard:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
