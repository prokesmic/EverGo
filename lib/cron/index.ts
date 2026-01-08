/**
 * Cron Job Utilities
 *
 * Provides authentication, locking, and logging for cron jobs.
 *
 * @module lib/cron
 */

import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// =============================================================================
// TYPES
// =============================================================================

export interface CronJobResult {
  success: boolean
  jobName: string
  runId: string
  startedAt: Date
  finishedAt?: Date
  durationMs?: number
  recordsProcessed?: number
  recordsUpdated?: number
  error?: string
  stats?: Record<string, unknown>
}

export interface CronJobOptions {
  /** Job name for logging and locking */
  jobName: string
  /** Unique run ID (defaults to timestamp-based) */
  runId?: string
  /** Skip the lock check (for jobs that can run concurrently) */
  skipLock?: boolean
  /** Dry run mode - don't make changes */
  dryRun?: boolean
}

// =============================================================================
// AUTH VERIFICATION
// =============================================================================

/**
 * Verify that a request is from an authorized cron scheduler.
 * Checks for Bearer token or x-cron-secret header.
 *
 * @returns null if authorized, NextResponse if unauthorized
 */
export function verifyCronRequest(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET

  // In development without secret, allow all
  if (!cronSecret && process.env.NODE_ENV === "development") {
    console.log("[Cron] Development mode - skipping auth check")
    return null
  }

  // Require secret in production
  if (!cronSecret) {
    console.error("[Cron] CRON_SECRET not configured")
    return NextResponse.json(
      { error: "Cron not configured" },
      { status: 500 }
    )
  }

  // Check Authorization header (Vercel Cron format)
  const authHeader = request.headers.get("authorization")
  if (authHeader === `Bearer ${cronSecret}`) {
    return null // Authorized
  }

  // Check x-cron-secret header (alternative)
  const secretHeader = request.headers.get("x-cron-secret")
  if (secretHeader === cronSecret) {
    return null // Authorized
  }

  console.warn("[Cron] Unauthorized request attempted")
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  )
}

// =============================================================================
// LOCKING (using database advisory-like approach)
// =============================================================================

/**
 * Acquire a lock for a cron job.
 * Prevents concurrent runs of the same job.
 *
 * Uses a simple approach: check if there's an in-progress run.
 */
export async function acquireCronLock(
  jobName: string,
  runId: string
): Promise<boolean> {
  try {
    // Check for any in-progress runs
    const existingRun = await prisma.cronJobRun.findFirst({
      where: {
        jobName,
        status: "IN_PROGRESS",
        // Consider runs older than 30 minutes as stale
        startedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000),
        },
      },
    })

    if (existingRun) {
      console.warn(`[Cron] Job ${jobName} already running (runId: ${existingRun.runId})`)
      return false
    }

    // Create new run record
    await prisma.cronJobRun.create({
      data: {
        jobName,
        runId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    })

    return true
  } catch (error) {
    console.error(`[Cron] Failed to acquire lock for ${jobName}:`, error)
    return false
  }
}

/**
 * Release a cron job lock and record the result.
 */
export async function releaseCronLock(
  jobName: string,
  runId: string,
  result: Partial<CronJobResult>
): Promise<void> {
  try {
    await prisma.cronJobRun.updateMany({
      where: {
        jobName,
        runId,
      },
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
        finishedAt: new Date(),
        durationMs: result.durationMs,
        recordsProcessed: result.recordsProcessed ?? 0,
        recordsUpdated: result.recordsUpdated ?? 0,
        errorSummary: result.error?.substring(0, 500),
        statsJson: result.stats ? JSON.stringify(result.stats) : null,
      },
    })
  } catch (error) {
    console.error(`[Cron] Failed to release lock for ${jobName}:`, error)
  }
}

// =============================================================================
// EXECUTION WRAPPER
// =============================================================================

/**
 * Execute a cron job with locking, logging, and error handling.
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const authError = verifyCronRequest(request)
 *   if (authError) return authError
 *
 *   return runCronJob(
 *     { jobName: "recalculate-rankings" },
 *     async (ctx) => {
 *       const count = await recalculateAllRankings()
 *       return { recordsUpdated: count }
 *     }
 *   )
 * }
 * ```
 */
export async function runCronJob(
  options: CronJobOptions,
  handler: (ctx: { runId: string; dryRun: boolean }) => Promise<{
    recordsProcessed?: number
    recordsUpdated?: number
    stats?: Record<string, unknown>
  }>
): Promise<NextResponse> {
  const { jobName, skipLock = false, dryRun = false } = options
  const runId = options.runId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const startedAt = new Date()

  console.log(`[Cron] Starting job: ${jobName} (runId: ${runId}${dryRun ? ", DRY RUN" : ""})`)

  // Acquire lock unless skipped
  if (!skipLock) {
    const lockAcquired = await acquireCronLock(jobName, runId)
    if (!lockAcquired) {
      return NextResponse.json(
        {
          success: false,
          error: "Job already running",
          jobName,
          runId,
        },
        { status: 409 }
      )
    }
  }

  try {
    // Execute the job
    const result = await handler({ runId, dryRun })
    const finishedAt = new Date()
    const durationMs = finishedAt.getTime() - startedAt.getTime()

    console.log(
      `[Cron] Completed job: ${jobName} ` +
      `(${durationMs}ms, processed: ${result.recordsProcessed ?? 0}, ` +
      `updated: ${result.recordsUpdated ?? 0})`
    )

    // Release lock with success
    if (!skipLock) {
      await releaseCronLock(jobName, runId, {
        success: true,
        durationMs,
        ...result,
      })
    }

    return NextResponse.json({
      success: true,
      jobName,
      runId,
      dryRun,
      durationMs,
      ...result,
    })
  } catch (error) {
    const finishedAt = new Date()
    const durationMs = finishedAt.getTime() - startedAt.getTime()
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error(`[Cron] Failed job: ${jobName} (${durationMs}ms):`, error)

    // Release lock with failure
    if (!skipLock) {
      await releaseCronLock(jobName, runId, {
        success: false,
        durationMs,
        error: errorMessage,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        jobName,
        runId,
        durationMs,
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if a dryRun query param is present.
 */
export function isDryRun(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get("dryRun") === "true"
}

/**
 * Generate a deterministic run ID based on job name and time window.
 * Useful for idempotency - same runId in same time window won't duplicate.
 */
export function generateIdempotentRunId(
  jobName: string,
  windowMinutes: number = 60
): string {
  const windowStart = Math.floor(Date.now() / (windowMinutes * 60 * 1000))
  return `${jobName}-${windowStart}`
}
