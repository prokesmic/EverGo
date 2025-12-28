/**
 * Environment configuration for EverGo
 *
 * Environment Variables:
 * - NEXT_PUBLIC_APP_ENV: "local" | "staging" | "production" (default: "local")
 * - ALLOW_DEMO_DATA: "true" | "false" (default: "false")
 *
 * Usage:
 * - In staging/production: ALLOW_DEMO_DATA must be "false"
 * - Demo data should ONLY be used in local development
 */

export type AppEnv = "local" | "staging" | "production"

export const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV ?? "local") as AppEnv

export const IS_LOCAL = APP_ENV === "local"
export const IS_STAGING = APP_ENV === "staging"
export const IS_PROD = APP_ENV === "production"

// Demo data is ONLY allowed in local environment when explicitly enabled
export const ALLOW_DEMO_DATA =
  IS_LOCAL && (process.env.ALLOW_DEMO_DATA ?? "false").toLowerCase() === "true"

// Helper to gate demo content - returns true only when safe to show demo data
export function canShowDemoData(): boolean {
  return ALLOW_DEMO_DATA
}

// Helper for feature flags that should only be active in certain environments
export function isFeatureEnabled(feature: string): boolean {
  // Add feature flag logic here as needed
  const devFeatures = ["experimental_ui", "debug_mode"]
  if (devFeatures.includes(feature)) {
    return IS_LOCAL
  }
  return true
}
