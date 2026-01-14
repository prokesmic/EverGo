/**
 * Verification Ladder System (V11)
 *
 * Four-tier system for user verification status:
 * - BRONZE: Manual entries, no proof
 * - SILVER: Manual with proof OR trusted device without GPS
 * - GOLD: Device sync with GPS (Strava/Garmin)
 * - PLATINUM: Official race results, WOO API, or admin-verified
 *
 * Users earn tier upgrades by consistently logging activities with higher proof levels.
 * The verification ladder determines:
 * - Badge display on profile/leaderboards
 * - Trust score multiplier for rankings
 * - Eligibility for competitive leagues
 */

import { prisma } from "@/lib/db"
import { type VerificationTier, type ProofLevel } from "@prisma/client"
import { isSensorSource } from "@/lib/sports/config"

// Re-export types for consumers
export type { VerificationTier, ProofLevel }

// =============================================================================
// TYPES
// =============================================================================

export interface VerificationLadderStatus {
  /** Current tier */
  currentTier: VerificationTier
  /** Progress to next tier (0-100) */
  progressToNext: number
  /** Activities needed for next tier */
  activitiesNeeded: number
  /** Current qualifying activities */
  qualifyingActivities: number
  /** Requirements for each tier */
  requirements: TierRequirement[]
  /** Whether user can upgrade now */
  canUpgrade: boolean
  /** Next tier (null if PLATINUM) */
  nextTier: VerificationTier | null
}

export interface TierRequirement {
  tier: VerificationTier
  minActivities: number
  minProofLevel: ProofLevel
  description: string
  icon: string
  color: string
  achieved: boolean
}

export interface VerificationStats {
  totalActivities: number
  manualCount: number
  photoCount: number
  gpxCount: number
  sensorCount: number
  verifiedCount: number
  /** Breakdown by source */
  bySource: Record<string, number>
}

// =============================================================================
// CONFIGURATION
// =============================================================================

export const TIER_CONFIG: Record<VerificationTier, {
  name: string
  description: string
  minActivities: number
  minProofLevel: ProofLevel
  trustMultiplier: number
  icon: string
  color: string
  bgColor: string
  borderColor: string
}> = {
  BRONZE: {
    name: "Bronze",
    description: "Manual logging",
    minActivities: 0,
    minProofLevel: "MANUAL",
    trustMultiplier: 0.5,
    icon: "shield",
    color: "#CD7F32",
    bgColor: "bg-amber-900/20",
    borderColor: "border-amber-700",
  },
  SILVER: {
    name: "Silver",
    description: "Proof attached",
    minActivities: 10,
    minProofLevel: "PHOTO",
    trustMultiplier: 0.75,
    icon: "shield-check",
    color: "#C0C0C0",
    bgColor: "bg-slate-400/20",
    borderColor: "border-slate-400",
  },
  GOLD: {
    name: "Gold",
    description: "GPS verified",
    minActivities: 25,
    minProofLevel: "SENSOR",
    trustMultiplier: 1.0,
    icon: "badge-check",
    color: "#FFD700",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500",
  },
  PLATINUM: {
    name: "Platinum",
    description: "Elite verified",
    minActivities: 50,
    minProofLevel: "VERIFIED",
    trustMultiplier: 1.0,
    icon: "crown",
    color: "#E5E4E2",
    bgColor: "bg-gradient-to-r from-slate-300/20 to-white/20",
    borderColor: "border-slate-200",
  },
}

/** Proof level hierarchy (lower index = less trusted) */
export const PROOF_LEVEL_ORDER: ProofLevel[] = [
  "MANUAL",
  "PHOTO",
  "GPX",
  "SENSOR",
  "VERIFIED",
]

/** Tier order for progression */
export const TIER_ORDER: VerificationTier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"]

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Get verification ladder status for a user
 */
export async function getVerificationLadderStatus(
  userId: string
): Promise<VerificationLadderStatus> {
  // Get user's current tier
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { verificationTier: true },
  })

  const currentTier = (userStats?.verificationTier ?? "BRONZE") as VerificationTier

  // Get activity counts by proof level
  const stats = await getVerificationStats(userId)

  // Calculate requirements for each tier
  const requirements = TIER_ORDER.map((tier): TierRequirement => {
    const config = TIER_CONFIG[tier]
    const qualifyingCount = countQualifyingActivities(stats, config.minProofLevel)

    return {
      tier,
      minActivities: config.minActivities,
      minProofLevel: config.minProofLevel,
      description: config.description,
      icon: config.icon,
      color: config.color,
      achieved: qualifyingCount >= config.minActivities,
    }
  })

  // Find next tier
  const currentTierIndex = TIER_ORDER.indexOf(currentTier)
  const nextTier = currentTierIndex < TIER_ORDER.length - 1
    ? TIER_ORDER[currentTierIndex + 1]
    : null

  // Calculate progress to next tier
  let progressToNext = 100
  let activitiesNeeded = 0
  let qualifyingActivities = 0

  if (nextTier) {
    const nextConfig = TIER_CONFIG[nextTier]
    qualifyingActivities = countQualifyingActivities(stats, nextConfig.minProofLevel)
    activitiesNeeded = Math.max(0, nextConfig.minActivities - qualifyingActivities)
    progressToNext = Math.min(100, (qualifyingActivities / nextConfig.minActivities) * 100)
  }

  // Check if user can upgrade
  const canUpgrade = nextTier !== null && activitiesNeeded === 0

  return {
    currentTier,
    progressToNext: Math.round(progressToNext),
    activitiesNeeded,
    qualifyingActivities,
    requirements,
    canUpgrade,
    nextTier,
  }
}

/**
 * Get verification statistics for a user
 */
export async function getVerificationStats(userId: string): Promise<VerificationStats> {
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: {
      proofLevel: true,
      source: true,
    },
  })

  const stats: VerificationStats = {
    totalActivities: activities.length,
    manualCount: 0,
    photoCount: 0,
    gpxCount: 0,
    sensorCount: 0,
    verifiedCount: 0,
    bySource: {},
  }

  for (const activity of activities) {
    // Count by proof level
    switch (activity.proofLevel) {
      case "MANUAL":
        stats.manualCount++
        break
      case "PHOTO":
        stats.photoCount++
        break
      case "GPX":
        stats.gpxCount++
        break
      case "SENSOR":
        stats.sensorCount++
        break
      case "VERIFIED":
        stats.verifiedCount++
        break
    }

    // Count by source
    const source = activity.source ?? "UNKNOWN"
    stats.bySource[source] = (stats.bySource[source] ?? 0) + 1
  }

  return stats
}

/**
 * Count activities that meet minimum proof level
 */
function countQualifyingActivities(
  stats: VerificationStats,
  minProofLevel: ProofLevel
): number {
  const minIndex = PROOF_LEVEL_ORDER.indexOf(minProofLevel)
  let count = 0

  // Count all activities at or above the minimum proof level
  for (let i = minIndex; i < PROOF_LEVEL_ORDER.length; i++) {
    const level = PROOF_LEVEL_ORDER[i]
    switch (level) {
      case "MANUAL":
        count += stats.manualCount
        break
      case "PHOTO":
        count += stats.photoCount
        break
      case "GPX":
        count += stats.gpxCount
        break
      case "SENSOR":
        count += stats.sensorCount
        break
      case "VERIFIED":
        count += stats.verifiedCount
        break
    }
  }

  return count
}

/**
 * Upgrade user's verification tier if eligible
 */
export async function upgradeVerificationTier(
  userId: string
): Promise<{ upgraded: boolean; newTier?: VerificationTier; previousTier?: VerificationTier }> {
  const status = await getVerificationLadderStatus(userId)

  if (!status.canUpgrade || !status.nextTier) {
    return { upgraded: false }
  }

  const previousTier = status.currentTier

  await prisma.userStats.update({
    where: { userId },
    data: { verificationTier: status.nextTier },
  })

  return {
    upgraded: true,
    newTier: status.nextTier,
    previousTier,
  }
}

/**
 * Check all users for tier upgrades (for cron job)
 */
export async function processVerificationUpgrades(): Promise<{
  processed: number
  upgraded: number
}> {
  const users = await prisma.user.findMany({
    select: { id: true },
  })

  let processed = 0
  let upgraded = 0

  for (const user of users) {
    try {
      const result = await upgradeVerificationTier(user.id)
      processed++
      if (result.upgraded) {
        upgraded++
        console.log(`[Verification] User ${user.id} upgraded: ${result.previousTier} → ${result.newTier}`)
      }
    } catch (error) {
      console.error(`[Verification] Failed to process user ${user.id}:`, error)
    }
  }

  return { processed, upgraded }
}

/**
 * Determine proof level from activity source
 */
export function getProofLevelFromSource(source: string | null): ProofLevel {
  if (!source) return "MANUAL"

  const upperSource = source.toUpperCase()

  // Verified sources
  if (upperSource === "RACE_RESULT" || upperSource === "ADMIN_VERIFIED") {
    return "VERIFIED"
  }

  // Sensor sources (GPS-based)
  if (isSensorSource(source)) {
    return "SENSOR"
  }

  // File imports
  if (upperSource === "GPX" || upperSource === "TCX") {
    return "GPX"
  }

  // Manual entries
  return "MANUAL"
}

/**
 * Determine verification tier from activity source
 */
export function getVerificationTierFromSource(source: string | null): VerificationTier {
  if (!source) return "BRONZE"

  const upperSource = source.toUpperCase()

  // Platinum: official/admin verified
  if (upperSource === "RACE_RESULT" || upperSource === "ADMIN_VERIFIED" || upperSource === "WOO_API") {
    return "PLATINUM"
  }

  // Gold: GPS-based sensors
  if (isSensorSource(source)) {
    return "GOLD"
  }

  // Silver: file imports with GPS data
  if (upperSource === "GPX" || upperSource === "TCX" || upperSource === "FIT_FILE") {
    return "SILVER"
  }

  // Bronze: manual
  return "BRONZE"
}

/**
 * Get trust multiplier for a verification tier
 */
export function getTrustMultiplier(tier: VerificationTier): number {
  return TIER_CONFIG[tier]?.trustMultiplier ?? 0.5
}

/**
 * Get display info for a verification tier
 */
export function getTierDisplayInfo(tier: VerificationTier) {
  return TIER_CONFIG[tier]
}
