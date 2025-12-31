/**
 * Standard ActionResult type for server actions
 * Provides typed success/failure responses with error classification
 */

export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "DB_SCHEMA_OUT_OF_SYNC"
  | "DB_CONSTRAINT"
  | "NOT_FOUND"
  | "UNKNOWN"

export type ActionError = {
  code: ActionErrorCode
  message: string
  details?: unknown
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError }

/**
 * Create a successful result
 */
export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data })

/**
 * Create a failure result
 */
export const fail = <T = never>(
  code: ActionErrorCode,
  message: string,
  details?: unknown
): ActionResult<T> => ({
  ok: false,
  error: { code, message, details },
})

/**
 * Classify Prisma errors into ActionErrorCodes
 */
export function classifyPrismaError(e: unknown): {
  code: ActionErrorCode
  message: string
  details?: unknown
} {
  const msg = String((e as Error)?.message || e)
  const prismaCode = (e as { code?: string })?.code

  // Schema out of sync - missing table/column
  if (
    msg.includes("does not exist") ||
    msg.includes("Unknown column") ||
    msg.includes("relation") ||
    prismaCode === "P2021" || // Table not found
    prismaCode === "P2022"    // Column not found
  ) {
    return {
      code: "DB_SCHEMA_OUT_OF_SYNC",
      message: "Database schema is out of date. Migration may be needed.",
      details: { prismaCode, originalMessage: msg },
    }
  }

  // Constraint violations
  if (
    prismaCode?.startsWith?.("P200") ||
    prismaCode === "P2002" || // Unique constraint
    prismaCode === "P2003" || // Foreign key constraint
    prismaCode === "P2025"    // Record not found
  ) {
    return {
      code: "DB_CONSTRAINT",
      message: "Database constraint violation.",
      details: { prismaCode, originalMessage: msg },
    }
  }

  return {
    code: "UNKNOWN",
    message: "An unexpected error occurred.",
    details: { originalMessage: msg },
  }
}
