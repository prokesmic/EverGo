"use server"

/**
 * Benchmarks System - Deprecated in V6
 *
 * All benchmark functionality has been removed.
 * These stubs exist for backwards compatibility.
 */

export interface UpsertPbParams {
  benchmarkId: string
  value: number
  achievedAtISO: string
  evidenceUrl?: string
}

export async function upsertUserPb(_params: UpsertPbParams) {
  console.warn("[Deprecated] Benchmarks have been removed in V6")
  return null
}

export async function deleteUserPb(_benchmarkId: string) {
  console.warn("[Deprecated] Benchmarks have been removed in V6")
  return { success: true }
}

export async function getUserBenchmarks(_userId?: string) {
  console.warn("[Deprecated] Benchmarks have been removed in V6")
  return []
}

export async function getSportBenchmarks(_sportSlug: string) {
  console.warn("[Deprecated] Benchmarks have been removed in V6")
  return []
}

export async function recordActivityBenchmarks(_activityId: string) {
  console.warn("[Deprecated] Benchmarks have been removed in V6")
  return []
}

export async function getAllBenchmarks() {
  console.warn("[Deprecated] Benchmarks have been removed in V6")
  return []
}
