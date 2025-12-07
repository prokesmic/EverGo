// Production-ready logging utility
// Can be extended to send logs to external services (Sentry, LogRocket, etc.)

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

// Environment check
const isDev = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

// Log storage for debugging (last 100 entries)
const logBuffer: LogEntry[] = []
const MAX_BUFFER_SIZE = 100

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error,
  }
}

function addToBuffer(entry: LogEntry) {
  logBuffer.push(entry)
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift()
  }
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`
  let log = `${prefix} ${entry.message}`

  if (entry.context) {
    log += ` | Context: ${JSON.stringify(entry.context)}`
  }

  return log
}

// Main logger object
export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('debug', message, context)
    addToBuffer(entry)

    if (isDev) {
      console.debug(formatLog(entry))
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('info', message, context)
    addToBuffer(entry)

    if (isDev) {
      console.info(formatLog(entry))
    }
  },

  warn(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('warn', message, context)
    addToBuffer(entry)

    console.warn(formatLog(entry))
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const err = error instanceof Error ? error : undefined
    const entry = createLogEntry('error', message, context, err)
    addToBuffer(entry)

    console.error(formatLog(entry))
    if (err) {
      console.error(err.stack)
    }

    // In production, send to external service
    if (!isDev && isServer) {
      // TODO: Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: context })
    }
  },

  // API request logging
  api(method: string, path: string, status: number, duration: number, context?: Record<string, unknown>) {
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    const message = `${method} ${path} ${status} (${duration}ms)`

    const entry = createLogEntry(level, message, context)
    addToBuffer(entry)

    if (isDev || level === 'error') {
      const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info
      logFn(formatLog(entry))
    }
  },

  // Get recent logs (for debugging)
  getRecentLogs(count = 50): LogEntry[] {
    return logBuffer.slice(-count)
  },

  // Clear logs
  clearLogs() {
    logBuffer.length = 0
  },
}

// Error boundary helper
export function captureError(error: Error, componentStack?: string) {
  logger.error('React Error Boundary caught error', error, {
    componentStack,
  })
}

// API error helper
export function createApiError(
  message: string,
  status: number,
  code?: string
): { error: string; status: number; code?: string } {
  logger.warn(`API Error: ${message}`, { status, code })
  return { error: message, status, code }
}

export default logger
