/**
 * Perks System
 *
 * Partner perks and offers unlocked by Sport Index milestones.
 *
 * Schema: Perk model with title, description, partnerName, minSportIndex, requireVerified
 * Note: User achievements (badges, trophies) are tracked via the Badge/UserBadge system.
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"

export interface Perk {
  id: string
  title: string
  description: string
  partnerName: string | null
  partnerLogoUrl: string | null
  url: string | null
  imageUrl: string | null
  category: string
  minSportIndex: number | null
  requireVerified: boolean
  isUnlocked: boolean
  isActive: boolean
}

export interface PerkCategory {
  name: string
  perks: Perk[]
}

/**
 * Get available perks for a user based on their sport index
 */
export async function getUserPerks(userId: string): Promise<Perk[]> {
  if (!isFlagEnabled("enablePerks")) {
    return []
  }

  // Get user's sport index and verification status
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { sportIndex: true, isVerifiedAthlete: true },
  })

  const sportIndex = userStats?.sportIndex ?? 0
  const isVerified = userStats?.isVerifiedAthlete ?? false

  // Get all active perks
  const perks = await prisma.perk.findMany({
    where: { isActive: true },
    orderBy: [{ minSportIndex: "asc" }, { title: "asc" }],
  })

  // Map perks with unlock status
  return perks.map((perk) => {
    const meetsIndexRequirement = perk.minSportIndex == null || sportIndex >= perk.minSportIndex
    const meetsVerificationRequirement = !perk.requireVerified || isVerified

    return {
      id: perk.id,
      title: perk.title,
      description: perk.description,
      partnerName: perk.partnerName,
      partnerLogoUrl: perk.partnerLogoUrl,
      url: perk.url,
      imageUrl: perk.imageUrl,
      category: perk.category,
      minSportIndex: perk.minSportIndex,
      requireVerified: perk.requireVerified,
      isUnlocked: meetsIndexRequirement && meetsVerificationRequirement,
      isActive: perk.isActive,
    }
  })
}

/**
 * Get perks grouped by category
 */
export async function getUserPerksGrouped(userId: string): Promise<PerkCategory[]> {
  const perks = await getUserPerks(userId)

  // Group by category
  const categoryMap = new Map<string, Perk[]>()

  for (const perk of perks) {
    const existing = categoryMap.get(perk.category) ?? []
    existing.push(perk)
    categoryMap.set(perk.category, existing)
  }

  // Convert to array
  return Array.from(categoryMap.entries()).map(([name, categoryPerks]) => ({
    name,
    perks: categoryPerks,
  }))
}

/**
 * Get unlocked perks only
 */
export async function getUnlockedPerks(userId: string): Promise<Perk[]> {
  const perks = await getUserPerks(userId)
  return perks.filter((p) => p.isUnlocked)
}

/**
 * Get locked perks with progress towards unlocking
 */
export async function getLockedPerksWithProgress(
  userId: string
): Promise<Array<Perk & { progress: number }>> {
  const perks = await getUserPerks(userId)
  const lockedPerks = perks.filter((p) => !p.isUnlocked)

  // Get user's current sport index
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { sportIndex: true },
  })

  const sportIndex = userStats?.sportIndex ?? 0

  return lockedPerks.map((perk) => {
    const threshold = perk.minSportIndex ?? 0
    const progress = threshold > 0 ? Math.min(100, (sportIndex / threshold) * 100) : 100

    return {
      ...perk,
      progress,
    }
  })
}

/**
 * Get next perk to unlock
 */
export async function getNextPerkToUnlock(
  userId: string
): Promise<{ perk: Perk; progress: number } | null> {
  const lockedPerks = await getLockedPerksWithProgress(userId)

  if (lockedPerks.length === 0) {
    return null
  }

  // Sort by threshold and get the closest one
  const sorted = lockedPerks
    .filter((p) => p.minSportIndex != null)
    .sort((a, b) => (a.minSportIndex ?? 0) - (b.minSportIndex ?? 0))

  if (sorted.length === 0) {
    return null
  }

  const next = sorted[0]
  return {
    perk: next,
    progress: next.progress,
  }
}

/**
 * Check if user can access a specific perk
 */
export async function canAccessPerk(userId: string, perkId: string): Promise<boolean> {
  const perks = await getUserPerks(userId)
  const perk = perks.find((p) => p.id === perkId)
  return perk?.isUnlocked ?? false
}
