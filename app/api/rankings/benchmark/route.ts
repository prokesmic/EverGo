import { NextResponse } from "next/server"

/**
 * GET /api/rankings/benchmark
 *
 * Benchmarks have been removed in V6.
 * This route is kept as a stub for backwards compatibility.
 */
export async function GET() {
  console.warn("[Deprecated] Benchmark leaderboards have been removed in V6")
  return NextResponse.json({
    benchmarks: [],
    entries: [],
    total: 0,
    message: "Benchmarks have been deprecated in V6",
  })
}
