/**
 * Observability Utilities
 *
 * Request correlation, structured logging, and error reporting.
 *
 * @module lib/observability
 */

import { headers } from "next/headers"

// =============================================================================
// REQUEST CORRELATION
// =============================================================================

const REQUEST_ID_HEADER = "x-request-id"

/**
 * Get or generate a request ID for correlation.
 * Reads from header if present (for distributed tracing), otherwise generates.
 */
export async function getRequestId(): Promise<string> {
  try {
    const headerList = await headers()
    const existingId = headerList.get(REQUEST_ID_HEADER)
    if (existingId) return existingId
  } catch {
    // headers() may not be available in all contexts
  }

  return generateRequestId()
}

/**
 * Generate a new request ID.
 * Format: timestamp-randomHex (e.g., "1704672000000-a1b2c3")
 */
export function generateRequestId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(16).slice(2, 8)
  return `${timestamp}-${random}`
}

// =============================================================================
// STRUCTURED LOGGING
// =============================================================================

export interface LogContext {
  requestId?: string
  userId?: string
  action?: string
  [key: string]: unknown
}

type LogLevel = "debug" | "info" | "warn" | "error"

function formatLog(level: LogLevel, message: string, context: LogContext = {}): string {
  const timestamp = new Date().toISOString()
  const { requestId, userId, action, ...rest } = context

  const parts = [
    `[${timestamp}]`,
    `[${level.toUpperCase()}]`,
    requestId ? `[req:${requestId.slice(-8)}]` : null,
    userId ? `[user:${userId.slice(0, 8)}]` : null,
    action ? `[${action}]` : null,
    message,
  ].filter(Boolean)

  const extraKeys = Object.keys(rest)
  if (extraKeys.length > 0) {
    parts.push(JSON.stringify(rest))
  }

  return parts.join(" ")
}

export const log = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLog("debug", message, context))
    }
  },

  info(message: string, context?: LogContext) {
    console.info(formatLog("info", message, context))
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog("warn", message, context))
  },

  error(message: string, context?: LogContext & { error?: Error }) {
    console.error(formatLog("error", message, context))
    if (context?.error) {
      console.error(context.error)
    }
  },
}

// =============================================================================
// ERROR REPORTING (Sentry-compatible interface)
// =============================================================================

interface ErrorReportContext {
  requestId?: string
  userId?: string
  extra?: Record<string, unknown>
  tags?: Record<string, string>
}

/**
 * Report an error to the error tracking service.
 * This is a stub that logs errors - replace with Sentry when configured.
 *
 * To enable Sentry:
 * 1. npm install @sentry/nextjs
 * 2. Run `npx @sentry/wizard@latest -i nextjs`
 * 3. Replace this implementation with Sentry.captureException
 */
export function captureException(error: Error, context?: ErrorReportContext): void {
  log.error(`Exception captured: ${error.message}`, {
    requestId: context?.requestId,
    userId: context?.userId,
    ...context?.extra,
    error,
  })

  // TODO: When Sentry is configured:
  // import * as Sentry from "@sentry/nextjs"
  // Sentry.captureException(error, {
  //   extra: context?.extra,
  //   tags: context?.tags,
  //   user: context?.userId ? { id: context.userId } : undefined,
  // })
}

/**
 * Report a message/breadcrumb to error tracking.
 */
export function captureMessage(message: string, context?: ErrorReportContext): void {
  log.info(`Message captured: ${message}`, {
    requestId: context?.requestId,
    userId: context?.userId,
    ...context?.extra,
  })

  // TODO: When Sentry is configured:
  // Sentry.captureMessage(message, { extra: context?.extra })
}

// =============================================================================
// SECRET REDACTION
// =============================================================================

const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /refresh_token["\s:=]+[A-Za-z0-9._-]+/gi,
  /access_token["\s:=]+[A-Za-z0-9._-]+/gi,
  /password["\s:=]+[^,}\s]+/gi,
  /secret["\s:=]+[^,}\s]+/gi,
  /api[_-]?key["\s:=]+[^,}\s]+/gi,
]

/**
 * Redact sensitive data from a string (for logging).
 */
export function redactSecrets(input: string): string {
  let result = input
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]")
  }
  return result
}

// =============================================================================
// APP VERSION
// =============================================================================

/**
 * Get app version info for health checks and logging.
 */
export function getAppVersion(): {
  version: string
  commit?: string
  buildTime?: string
} {
  return {
    version: process.env.npm_package_version ?? "0.1.0",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    buildTime: process.env.VERCEL_GIT_COMMIT_DATE,
  }
}
