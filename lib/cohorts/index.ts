/**
 * Cohort System
 *
 * Manages weekly cohort assignments for new users ("Rookie League").
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"

/**
 * Get or create the current active cohort
 */
export async function getCurrentCohort() {
  if (!isFlagEnabled("enableCohorts")) {
    return null
  }

  const now = new Date()

  // Calculate the start of the current week (Monday)
  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))

  // Calculate end of week (Sunday 23:59:59)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  // Check for existing cohort
  let cohort = await prisma.cohort.findFirst({
    where: {
      startAt: weekStart,
      cohortType: "WEEKLY",
    },
  })

  // Create new cohort if needed
  if (!cohort) {
    const label = generateCohortLabel(weekStart)
    cohort = await prisma.cohort.create({
      data: {
        label,
        startAt: weekStart,
        endAt: weekEnd,
        cohortType: "WEEKLY",
      },
    })
  }

  return cohort
}

/**
 * Assign a user to the current cohort
 */
export async function assignUserToCohort(userId: string): Promise<boolean> {
  if (!isFlagEnabled("enableCohorts")) {
    return false
  }

  const cohort = await getCurrentCohort()
  if (!cohort) return false

  // Check if already assigned
  const existing = await prisma.cohortMember.findUnique({
    where: {
      cohortId_userId: {
        cohortId: cohort.id,
        userId,
      },
    },
  })

  if (existing) {
    return true // Already assigned
  }

  // Get user's sport index for initial score
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { sportIndex: true },
  })

  // Create membership
  await prisma.cohortMember.create({
    data: {
      cohortId: cohort.id,
      userId,
      score: userStats?.sportIndex ?? 0,
    },
  })

  // Update member count
  await prisma.cohort.update({
    where: { id: cohort.id },
    data: { memberCount: { increment: 1 } },
  })

  return true
}

/**
 * Get user's current cohort
 */
export async function getUserCohort(userId: string) {
  if (!isFlagEnabled("enableCohorts")) {
    return null
  }

  const now = new Date()

  const membership = await prisma.cohortMember.findFirst({
    where: {
      userId,
      cohort: {
        endAt: { gte: now },
      },
    },
    include: {
      cohort: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  })

  return membership
}

/**
 * Get cohort leaderboard
 */
export async function getCohortLeaderboard(
  cohortId: string,
  limit: number = 10
) {
  const members = await prisma.cohortMember.findMany({
    where: { cohortId },
    include: {
      cohort: true,
    },
    orderBy: { score: "desc" },
    take: limit,
  })

  // Get user details
  const userIds = members.map((m) => m.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      stats: {
        select: { sportIndex: true },
      },
    },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))

  return members.map((member, index) => {
    const user = userMap.get(member.userId)
    return {
      rank: index + 1,
      userId: member.userId,
      displayName: user?.displayName ?? "Unknown",
      avatarUrl: user?.avatarUrl,
      score: member.score ?? 0,
      sportIndex: user?.stats?.sportIndex ?? 0,
    }
  })
}

/**
 * Update cohort scores (called after activity or PB updates)
 */
export async function updateCohortScores(userId: string) {
  const membership = await getUserCohort(userId)
  if (!membership) return

  const userStats = await prisma.userStats.findUnique({
    where: { userId },
    select: { sportIndex: true },
  })

  await prisma.cohortMember.update({
    where: { id: membership.id },
    data: { score: userStats?.sportIndex ?? 0 },
  })

  // Recalculate ranks
  await recalculateCohortRanks(membership.cohortId)
}

/**
 * Recalculate ranks for a cohort
 */
async function recalculateCohortRanks(cohortId: string) {
  const members = await prisma.cohortMember.findMany({
    where: { cohortId },
    orderBy: { score: "desc" },
  })

  for (let i = 0; i < members.length; i++) {
    await prisma.cohortMember.update({
      where: { id: members[i].id },
      data: { rank: i + 1 },
    })
  }
}

/**
 * Generate cohort label from start date
 */
function generateCohortLabel(date: Date): string {
  const month = date.toLocaleString("en-US", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()
  return `Week of ${month} ${day}, ${year}`
}
