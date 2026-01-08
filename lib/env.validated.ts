/**
 * Validated Environment Configuration
 *
 * Provides type-safe, validated access to environment variables.
 * Uses Zod for runtime validation with helpful error messages.
 *
 * @module lib/env.validated
 */

import { z } from "zod"

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

const envSchema = z.object({
  // App Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_ENV: z.enum(["local", "staging", "production"]).default("local"),

  // URLs
  NEXTAUTH_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // OAuth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),

  // Strava Integration
  STRAVA_CLIENT_ID: z.string().optional(),
  STRAVA_CLIENT_SECRET: z.string().optional(),
  STRAVA_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  STRAVA_SYNC_SIGNING_SECRET: z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_PRO_MONTHLY: z.string().optional(),
  STRIPE_PRICE_ID_PRO_ANNUAL: z.string().optional(),

  // Push Notifications (optional)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),

  // Cron & Jobs
  CRON_SECRET: z.string().optional(),
  EVERGO_JOB_SECRET: z.string().optional(),

  // E2E Testing
  E2E_ENABLED: z.string().transform(v => v === "true").optional(),
  E2E_TEST_SECRET: z.string().optional(),

  // Demo/Dev flags
  ALLOW_DEMO_DATA: z.string().transform(v => v === "true").optional(),
})

// =============================================================================
// VALIDATION & EXPORT
// =============================================================================

type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error("Environment validation failed:")
    console.error(result.error.flatten().fieldErrors)

    // In production, fail hard. In dev, warn but continue.
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment configuration")
    }
  }

  return result.success ? result.data : (process.env as unknown as Env)
}

// Lazy initialization to avoid issues during build
let _env: Env | null = null

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv()
  }
  return _env
}

// Convenience accessors
export const env = {
  get NODE_ENV() { return getEnv().NODE_ENV },
  get APP_ENV() { return getEnv().NEXT_PUBLIC_APP_ENV },

  get isProduction() { return getEnv().NODE_ENV === "production" },
  get isDevelopment() { return getEnv().NODE_ENV === "development" },
  get isLocal() { return getEnv().NEXT_PUBLIC_APP_ENV === "local" },
  get isStaging() { return getEnv().NEXT_PUBLIC_APP_ENV === "staging" },

  get appUrl() {
    return getEnv().APP_URL || getEnv().NEXTAUTH_URL || "http://localhost:3000"
  },

  get databaseUrl() { return getEnv().DATABASE_URL },
  get nextAuthSecret() { return getEnv().NEXTAUTH_SECRET },

  // Cron
  get cronSecret() { return getEnv().CRON_SECRET },
  get jobSecret() { return getEnv().EVERGO_JOB_SECRET },

  // Strava
  get stravaClientId() { return getEnv().STRAVA_CLIENT_ID },
  get stravaClientSecret() { return getEnv().STRAVA_CLIENT_SECRET },
  get stravaWebhookVerifyToken() { return getEnv().STRAVA_WEBHOOK_VERIFY_TOKEN },

  // Supabase
  get supabaseUrl() { return getEnv().NEXT_PUBLIC_SUPABASE_URL },
  get supabaseAnonKey() { return getEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY },

  // E2E
  get e2eEnabled() { return getEnv().E2E_ENABLED ?? false },
  get e2eSecret() { return getEnv().E2E_TEST_SECRET },

  // Full env object for advanced use
  get all() { return getEnv() },
}

export default env
