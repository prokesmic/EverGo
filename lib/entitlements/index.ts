/**
 * Entitlements System
 *
 * Defines Pro tier vs Free boundaries for future gating.
 * Central place for all subscription/tier-based access control.
 *
 * Usage:
 * - Check if user is Pro: isProUser(userId)
 * - Check feature access: hasFeatureAccess(userId, feature)
 * - Get usage limits: getUsageLimits(userId)
 * - Track upgrade nudges: trackUpgradeNudge(userId, feature)
 */

import { prisma } from "@/lib/db"

// =============================================================================
// CONSTANTS
// =============================================================================

export const SUBSCRIPTION_TIERS = {
  FREE: "FREE",
  PRO: "PRO",
  TEAM: "TEAM",
} as const

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS

export const FREE_LIMITS = {
  /** Max gauntlets per month */
  gauntletsPerMonth: 3,
  /** Max active rivalries */
  activeRivalries: 5,
  /** Max hypes per day */
  hypesPerDay: 3,
  /** Activity history visible (days) */
  activityHistoryDays: 90,
  /** Max sports tracked */
  sportsTracked: 2,
  /** Community goal participation */
  communityGoals: true,
  /** Recovery mode uses per season */
  recoveryModesPerSeason: 1,
  /** Detailed analytics */
  detailedAnalytics: false,
  /** Export data */
  exportData: false,
  /** Priority support */
  prioritySupport: false,
}

export const PRO_LIMITS = {
  /** Max gauntlets per month */
  gauntletsPerMonth: Infinity,
  /** Max active rivalries */
  activeRivalries: 20,
  /** Max hypes per day */
  hypesPerDay: 10,
  /** Activity history visible (days) */
  activityHistoryDays: Infinity,
  /** Max sports tracked */
  sportsTracked: Infinity,
  /** Community goal participation */
  communityGoals: true,
  /** Recovery mode uses per season */
  recoveryModesPerSeason: 3,
  /** Detailed analytics */
  detailedAnalytics: true,
  /** Export data */
  exportData: true,
  /** Priority support */
  prioritySupport: true,
}

// =============================================================================
// TYPES
// =============================================================================

export type Feature =
  | "gauntlet"
  | "rivalry"
  | "hype"
  | "analytics"
  | "export"
  | "priority_support"
  | "unlimited_history"
  | "unlimited_sports"
  | "recovery_mode"

export interface UsageLimits {
  gauntletsPerMonth: number
  gauntletsUsed: number
  gauntletsRemaining: number
  activeRivalries: number
  maxRivalries: number
  hypesPerDay: number
  hypesUsedToday: number
  hypesRemaining: number
  canCreateGauntlet: boolean
  canCreateRivalry: boolean
  canHype: boolean
}

export interface UpgradeNudgeEvent {
  userId: string
  feature: Feature
  source: string
  timestamp: Date
  tier: SubscriptionTier
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Check if user has Pro subscription
 */
export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      status: true,
      plan: true,
      currentPeriodEnd: true,
    },
  })

  if (!subscription) return false

  // Check if active or trialing and not expired
  if (subscription.status !== "ACTIVE" && subscription.status !== "TRIALING") return false
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) return false

  return subscription.plan === "PRO" || subscription.plan === "PRO_ANNUAL"
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const isPro = await isProUser(userId)
  return isPro ? "PRO" : "FREE"
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string,
  feature: Feature
): Promise<boolean> {
  const isPro = await isProUser(userId)

  switch (feature) {
    case "analytics":
    case "export":
    case "priority_support":
    case "unlimited_history":
    case "unlimited_sports":
      return isPro

    case "gauntlet":
    case "rivalry":
    case "hype":
    case "recovery_mode":
      // These have limits for free users but are accessible
      return true

    default:
      return false
  }
}

/**
 * Get usage limits and current usage for a user
 */
export async function getUsageLimits(userId: string): Promise<UsageLimits> {
  const isPro = await isProUser(userId)
  const limits = isPro ? PRO_LIMITS : FREE_LIMITS

  // Get current month start
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  // Fetch usage counts in parallel
  const [gauntletsCreated, activeRivalries, hypesToday] = await Promise.all([
    prisma.gauntlet.count({
      where: {
        challengerId: userId,
        createdAt: { gte: monthStart },
      },
    }),
    prisma.rivalryParticipant.count({
      where: {
        userId,
        rivalry: {
          status: { in: ["PENDING", "ACTIVE"] },
        },
      },
    }),
    prisma.activityHype.count({
      where: {
        userId,
        createdAt: { gte: todayStart, lt: todayEnd },
      },
    }),
  ])

  const gauntletsRemaining = Math.max(
    0,
    limits.gauntletsPerMonth === Infinity
      ? Infinity
      : limits.gauntletsPerMonth - gauntletsCreated
  )

  const hypesRemaining = Math.max(0, limits.hypesPerDay - hypesToday)

  return {
    gauntletsPerMonth: limits.gauntletsPerMonth,
    gauntletsUsed: gauntletsCreated,
    gauntletsRemaining,
    activeRivalries,
    maxRivalries: limits.activeRivalries,
    hypesPerDay: limits.hypesPerDay,
    hypesUsedToday: hypesToday,
    hypesRemaining,
    canCreateGauntlet: gauntletsRemaining > 0,
    canCreateRivalry: activeRivalries < limits.activeRivalries,
    canHype: hypesRemaining > 0,
  }
}

/**
 * Check if user can perform a specific action (respects limits)
 */
export async function canPerformAction(
  userId: string,
  action: "create_gauntlet" | "create_rivalry" | "hype" | "use_recovery_mode"
): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: boolean }> {
  const limits = await getUsageLimits(userId)
  const isPro = await isProUser(userId)

  switch (action) {
    case "create_gauntlet":
      if (limits.canCreateGauntlet) {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: `Monthly gauntlet limit reached (${limits.gauntletsPerMonth})`,
        upgradeRequired: !isPro,
      }

    case "create_rivalry":
      if (limits.canCreateRivalry) {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: `Active rivalry limit reached (${limits.maxRivalries})`,
        upgradeRequired: !isPro,
      }

    case "hype":
      if (limits.canHype) {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: `Daily hype limit reached (${limits.hypesPerDay})`,
        upgradeRequired: !isPro,
      }

    case "use_recovery_mode":
      // This needs to check season usage
      const streak = await prisma.userStreak.findUnique({
        where: { userId },
        select: { recoveryModeUsesThisSeason: true },
      })
      const used = streak?.recoveryModeUsesThisSeason ?? 0
      const maxUses = isPro
        ? PRO_LIMITS.recoveryModesPerSeason
        : FREE_LIMITS.recoveryModesPerSeason

      if (used < maxUses) {
        return { allowed: true }
      }
      return {
        allowed: false,
        reason: `Recovery mode limit reached (${maxUses} per season)`,
        upgradeRequired: !isPro,
      }

    default:
      return { allowed: true }
  }
}

// =============================================================================
// ANALYTICS EVENTS
// =============================================================================

/**
 * Track when upgrade nudge is displayed
 */
export async function trackUpgradeNudge(
  userId: string,
  feature: Feature,
  source: string
): Promise<void> {
  const tier = await getUserTier(userId)

  // Log to console for now (replace with actual analytics)
  console.log("[Analytics] Upgrade nudge displayed:", {
    userId,
    feature,
    source,
    tier,
    timestamp: new Date().toISOString(),
  })

  // Could send to analytics service here
  // await analytics.track('upgrade_nudge_displayed', { ... })
}

/**
 * Track trial started
 */
export async function trackTrialStarted(userId: string): Promise<void> {
  console.log("[Analytics] Trial started:", {
    userId,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track subscription upgrade
 */
export async function trackUpgrade(
  userId: string,
  fromTier: SubscriptionTier,
  toTier: SubscriptionTier
): Promise<void> {
  console.log("[Analytics] Subscription upgraded:", {
    userId,
    fromTier,
    toTier,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track feature usage attempt (for analytics on what drives upgrades)
 */
export async function trackFeatureAttempt(
  userId: string,
  feature: Feature,
  allowed: boolean,
  upgradeRequired: boolean
): Promise<void> {
  if (!allowed && upgradeRequired) {
    console.log("[Analytics] Feature blocked, upgrade required:", {
      userId,
      feature,
      timestamp: new Date().toISOString(),
    })
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get Pro benefits summary (for display in upgrade prompts)
 */
export function getProBenefits(): Array<{
  title: string
  description: string
  icon: string
}> {
  return [
    {
      title: "Unlimited Gauntlets",
      description: "Challenge friends anytime without monthly limits",
      icon: "swords",
    },
    {
      title: "More Rivalries",
      description: "Track up to 20 active rivalries at once",
      icon: "users",
    },
    {
      title: "Detailed Analytics",
      description: "Deep insights into your training patterns",
      icon: "chart",
    },
    {
      title: "Data Export",
      description: "Export your activity data in CSV format",
      icon: "download",
    },
    {
      title: "Extended History",
      description: "Access your complete activity history",
      icon: "history",
    },
    {
      title: "Priority Support",
      description: "Get faster responses from our team",
      icon: "headset",
    },
  ]
}

/**
 * Get limit info for a specific feature (for upgrade prompts)
 */
export function getLimitInfo(
  feature: Feature
): { free: string | number; pro: string | number } {
  switch (feature) {
    case "gauntlet":
      return { free: "3/month", pro: "Unlimited" }
    case "rivalry":
      return { free: "5 active", pro: "20 active" }
    case "hype":
      return { free: "3/day", pro: "10/day" }
    case "analytics":
      return { free: "Basic", pro: "Advanced" }
    case "export":
      return { free: "No", pro: "Yes" }
    case "unlimited_history":
      return { free: "90 days", pro: "Forever" }
    case "unlimited_sports":
      return { free: "2 sports", pro: "Unlimited" }
    case "recovery_mode":
      return { free: "1/season", pro: "3/season" }
    default:
      return { free: "-", pro: "-" }
  }
}
