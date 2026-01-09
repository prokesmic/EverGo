/**
 * EverGo V5 Feature Flags
 *
 * CORE features (always enabled):
 * - Activities, Rankings, Challenges, Feed, Following
 *
 * DEPRECATED features (disabled, pending removal):
 * - PaceBot, Leagues, Cohorts, Communities, TrainingPlans, PartnerFinder, Perks, ProductOffers
 */

export const FEATURES = {
  // CORE - Always enabled
  activities: true,
  rankings: true,
  challenges: true,
  feed: true,
  following: true,
  teams: true, // Keep teams, kill communities

  // DEPRECATED - V5 disables these
  paceBot: false,
  leagues: false,
  cohorts: false,
  communities: false, // Redundant with teams
  trainingPlans: false,
  partnerFinder: false,
  perks: false,
  productOffers: false,
  benchmarks: false, // Merged into rankings

  // NEW V5 FEATURES
  effortScore: true,
  rankLadder: true,
  rankBattles: true,
  floatingRankPill: true,
  almostThereNotifications: true,
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature] ?? false
}

export function isDeprecated(feature: FeatureKey): boolean {
  const deprecated: FeatureKey[] = [
    'paceBot', 'leagues', 'cohorts', 'communities',
    'trainingPlans', 'partnerFinder', 'perks', 'productOffers', 'benchmarks'
  ]
  return deprecated.includes(feature)
}

/**
 * Get all active (non-deprecated) features
 */
export function getActiveFeatures(): FeatureKey[] {
  return (Object.keys(FEATURES) as FeatureKey[]).filter(
    (key) => FEATURES[key] && !isDeprecated(key)
  )
}

/**
 * Get all deprecated features
 */
export function getDeprecatedFeatures(): FeatureKey[] {
  return (Object.keys(FEATURES) as FeatureKey[]).filter(isDeprecated)
}
