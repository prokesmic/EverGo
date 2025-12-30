import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"

// =============================================================================
// TYPES
// =============================================================================

export type ActionResultCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "RATE_LIMIT"
  | "CONFLICT"
  | "NOT_FOUND"
  | "INTERNAL"

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ActionResultCode; message: string; fieldErrors?: Record<string, string> }

export type AuthContext = {
  userId: string
  email: string
}

export type ActionOptions = {
  /** Rate limit key (e.g., "team:create"). If not set, no rate limiting. */
  rateKey?: string
  /** Rate limit (requests per window). Default: 10 */
  limit?: number
  /** Rate limit window in seconds. Default: 60 */
  windowSeconds?: number
}

// =============================================================================
// AUTHENTICATED ACTION WRAPPER
// =============================================================================

/**
 * Creates a type-safe, authenticated server action with built-in:
 * - Session validation
 * - Zod input validation
 * - Optional rate limiting
 * - Error handling (never throws, always returns Result)
 *
 * @example
 * ```ts
 * const createTeamAction = authenticatedAction(
 *   z.object({ name: z.string().min(3), sportId: z.string() }),
 *   async ({ input, ctx }) => {
 *     const team = await prisma.team.create({ data: { ...input, creatorId: ctx.userId } })
 *     return { teamSlug: team.slug }
 *   },
 *   { rateKey: "team:create", limit: 5, windowSeconds: 60 }
 * )
 * ```
 */
export function authenticatedAction<TInput extends z.ZodTypeAny, TOutput>(
  schema: TInput,
  handler: (args: { input: z.infer<TInput>; ctx: AuthContext }) => Promise<TOutput>,
  options?: ActionOptions
) {
  return async (rawInput: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Authenticate
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return { ok: false, code: "UNAUTHORIZED", message: "Please sign in to continue." }
      }

      // Get user ID from database
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      })

      if (!user) {
        return { ok: false, code: "UNAUTHORIZED", message: "User not found." }
      }

      const ctx: AuthContext = {
        userId: user.id,
        email: session.user.email,
      }

      // 2. Rate limit (optional)
      if (options?.rateKey) {
        const result = checkRateLimit(`${options.rateKey}:${ctx.userId}`, {
          identifier: options.rateKey,
          limit: options.limit ?? 10,
          windowSeconds: options.windowSeconds ?? 60,
        })
        if (!result.success) {
          return {
            ok: false,
            code: "RATE_LIMIT",
            message: `Too many requests. Please try again in ${result.resetIn} seconds.`,
          }
        }
      }

      // 3. Validate input
      const parsed = schema.safeParse(rawInput)
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const key = String(issue.path?.[0] ?? "form")
          fieldErrors[key] = issue.message
        }
        return {
          ok: false,
          code: "VALIDATION",
          message: "Please check the form fields.",
          fieldErrors,
        }
      }

      // 4. Execute handler
      const output = await handler({ input: parsed.data, ctx })
      return { ok: true, data: output }
    } catch (error: unknown) {
      console.error("[authenticatedAction] Error:", error)

      // Handle Prisma unique constraint violations
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        return { ok: false, code: "CONFLICT", message: "This item already exists." }
      }

      // Handle Prisma not found errors
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2025"
      ) {
        return { ok: false, code: "NOT_FOUND", message: "The requested item was not found." }
      }

      // Generic error
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred."
      return { ok: false, code: "INTERNAL", message }
    }
  }
}

// =============================================================================
// HELPER: Create action without authentication (for public endpoints)
// =============================================================================

export function publicAction<TInput extends z.ZodTypeAny, TOutput>(
  schema: TInput,
  handler: (args: { input: z.infer<TInput> }) => Promise<TOutput>,
  options?: Omit<ActionOptions, "rateKey"> & { rateKey?: string; clientIp?: string }
) {
  return async (rawInput: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // Rate limit (optional)
      if (options?.rateKey && options?.clientIp) {
        const result = checkRateLimit(`${options.rateKey}:${options.clientIp}`, {
          identifier: options.rateKey,
          limit: options.limit ?? 10,
          windowSeconds: options.windowSeconds ?? 60,
        })
        if (!result.success) {
          return {
            ok: false,
            code: "RATE_LIMIT",
            message: `Too many requests. Please try again in ${result.resetIn} seconds.`,
          }
        }
      }

      // Validate input
      const parsed = schema.safeParse(rawInput)
      if (!parsed.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const key = String(issue.path?.[0] ?? "form")
          fieldErrors[key] = issue.message
        }
        return {
          ok: false,
          code: "VALIDATION",
          message: "Please check the form fields.",
          fieldErrors,
        }
      }

      // Execute handler
      const output = await handler({ input: parsed.data })
      return { ok: true, data: output }
    } catch (error: unknown) {
      console.error("[publicAction] Error:", error)
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred."
      return { ok: false, code: "INTERNAL", message }
    }
  }
}
