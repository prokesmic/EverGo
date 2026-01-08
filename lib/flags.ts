/**
 * Feature Flags
 *
 * Runtime feature toggles for EverGo VNext.
 * Use these to gate new features during development/rollout.
 */

export const featureFlags = {
  // Chapter 1: Universal Import Engine
  enableFileUploadImport: true,

  // Chapter 2: Clubhouse vs Pro-Am
  enableProAm: true,

  // Chapter 3: Verified Athlete
  enableVerifiedAthlete: true,

  // Chapter 4: Percentiles (already implemented via rankings module)
  enablePercentiles: true,

  // Chapter 5: Next Tier Ghost
  enableNextTierGhost: true,

  // Chapter 6: Native Shell (Capacitor)
  enableNativeShell: false,

  // Chapter 7: Health Integrations
  enableAppleHealth: false,
  enableGarminHealth: false,

  // Chapter 8: PaceBot Rivalries
  enablePaceBot: true,

  // Chapter 9: Weekly Cohorts
  enableCohorts: true,

  // Chapter 10: Private Leagues
  enablePrivateLeagues: true,

  // Chapter 11: Perks & Dynamic Targets
  enablePerks: true,
  enableDynamicTargets: true,
} as const

export type FeatureFlag = keyof typeof featureFlags

/**
 * Check if a feature flag is enabled
 */
export function isFlagEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag] ?? false
}

/**
 * Server-side feature flag check with optional user context
 * Can be extended later for user-specific feature gates
 */
export async function isFeatureEnabled(
  flag: FeatureFlag,
  _userId?: string
): Promise<boolean> {
  // For now, just check the static flag
  // Later: add user-specific overrides, A/B testing, etc.
  return isFlagEnabled(flag)
}

/**
 * Get all enabled features (for debugging)
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(featureFlags) as FeatureFlag[]).filter((flag) =>
    featureFlags[flag]
  )
}
