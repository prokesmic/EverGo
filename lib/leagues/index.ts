/**
 * Private Leagues System
 *
 * Create and manage private leagues for clubs, companies, or friend groups.
 */

import { prisma } from "@/lib/db"
import { isFlagEnabled } from "@/lib/flags"
import { nanoid } from "nanoid"

export interface League {
  id: string
  name: string
  description: string | null
  inviteCode: string | null
  ownerId: string
  coverPhotoUrl: string | null
  memberCount: number
  createdAt: Date
}

export interface LeagueMember {
  id: string
  userId: string
  leagueId: string
  role: "OWNER" | "ADMIN" | "MEMBER"
  joinedAt: Date
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
  }
}

export interface LeagueLeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string | null
  value: number
  delta?: number | null
}

/**
 * Generate a unique invite code
 */
function generateInviteCode(): string {
  return nanoid(8).toUpperCase()
}

/**
 * Create a new league
 */
export async function createLeague(params: {
  name: string
  description?: string
  ownerId: string
  coverPhotoUrl?: string
}): Promise<League | null> {
  if (!isFlagEnabled("enablePrivateLeagues")) {
    return null
  }

  const { name, description, ownerId, coverPhotoUrl } = params
  const inviteCode = generateInviteCode()
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + nanoid(6)

  const league = await prisma.league.create({
    data: {
      name,
      slug,
      description,
      ownerId,
      inviteCode,
      coverPhotoUrl,
      memberCount: 1,
      members: {
        create: {
          userId: ownerId,
          role: "OWNER",
        },
      },
    },
  })

  return {
    id: league.id,
    name: league.name,
    description: league.description,
    inviteCode: league.inviteCode,
    ownerId: league.ownerId,
    coverPhotoUrl: league.coverPhotoUrl,
    memberCount: league.memberCount,
    createdAt: league.createdAt,
  }
}

/**
 * Join a league by invite code
 */
export async function joinLeague(
  inviteCode: string,
  userId: string
): Promise<{ success: boolean; league?: League; error?: string }> {
  if (!isFlagEnabled("enablePrivateLeagues")) {
    return { success: false, error: "Private leagues are not enabled" }
  }

  const league = await prisma.league.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
  })

  if (!league) {
    return { success: false, error: "Invalid invite code" }
  }

  // Check if already a member
  const existingMember = await prisma.leagueMember.findUnique({
    where: {
      leagueId_userId: {
        leagueId: league.id,
        userId,
      },
    },
  })

  if (existingMember) {
    return { success: false, error: "You are already a member of this league" }
  }

  // Add member
  await prisma.$transaction([
    prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        userId,
        role: "MEMBER",
      },
    }),
    prisma.league.update({
      where: { id: league.id },
      data: { memberCount: { increment: 1 } },
    }),
  ])

  return {
    success: true,
    league: {
      id: league.id,
      name: league.name,
      description: league.description,
      inviteCode: league.inviteCode,
      ownerId: league.ownerId,
      coverPhotoUrl: league.coverPhotoUrl,
      memberCount: league.memberCount + 1,
      createdAt: league.createdAt,
    },
  }
}

/**
 * Leave a league
 */
export async function leaveLeague(
  leagueId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const membership = await prisma.leagueMember.findUnique({
    where: {
      leagueId_userId: { leagueId, userId },
    },
  })

  if (!membership) {
    return { success: false, error: "Not a member of this league" }
  }

  if (membership.role === "OWNER") {
    return { success: false, error: "Owners cannot leave their league. Transfer ownership first." }
  }

  await prisma.$transaction([
    prisma.leagueMember.delete({
      where: { id: membership.id },
    }),
    prisma.league.update({
      where: { id: leagueId },
      data: { memberCount: { decrement: 1 } },
    }),
  ])

  return { success: true }
}

/**
 * Get user's leagues
 */
export async function getUserLeagues(userId: string): Promise<League[]> {
  if (!isFlagEnabled("enablePrivateLeagues")) {
    return []
  }

  const memberships = await prisma.leagueMember.findMany({
    where: { userId },
    include: {
      league: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  })

  return memberships.map((m) => ({
    id: m.league.id,
    name: m.league.name,
    description: m.league.description,
    inviteCode: m.league.inviteCode,
    ownerId: m.league.ownerId,
    coverPhotoUrl: m.league.coverPhotoUrl,
    memberCount: m.league.memberCount,
    createdAt: m.league.createdAt,
  }))
}

/**
 * Get league details
 */
export async function getLeague(leagueId: string): Promise<League | null> {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
  })

  if (!league) return null

  return {
    id: league.id,
    name: league.name,
    description: league.description,
    inviteCode: league.inviteCode,
    ownerId: league.ownerId,
    coverPhotoUrl: league.coverPhotoUrl,
    memberCount: league.memberCount,
    createdAt: league.createdAt,
  }
}

/**
 * Get league members
 */
export async function getLeagueMembers(leagueId: string): Promise<LeagueMember[]> {
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      joinedAt: "asc",
    },
  })

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    leagueId: m.leagueId,
    role: m.role as "OWNER" | "ADMIN" | "MEMBER",
    joinedAt: m.joinedAt,
    user: {
      id: m.user.id,
      displayName: m.user.displayName ?? "Unknown",
      avatarUrl: m.user.avatarUrl,
    },
  }))
}

/**
 * Get league leaderboard for a specific benchmark
 */
export async function getLeagueLeaderboard(
  leagueId: string,
  benchmarkId: string,
  limit: number = 50
): Promise<LeagueLeaderboardEntry[]> {
  // Get all league members
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    select: { userId: true },
  })

  const memberIds = members.map((m) => m.userId)

  // Get benchmark info
  const benchmark = await prisma.benchmarkDefinition.findUnique({
    where: { id: benchmarkId },
    select: { higherIsBetter: true },
  })

  if (!benchmark) return []

  // Get PBs for all members
  const bests = await prisma.userBenchmarkBest.findMany({
    where: {
      benchmarkId,
      userId: { in: memberIds },
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      value: benchmark.higherIsBetter ? "desc" : "asc",
    },
    take: limit,
  })

  return bests.map((best, index) => ({
    rank: index + 1,
    userId: best.userId,
    displayName: best.user.displayName ?? "Unknown",
    avatarUrl: best.user.avatarUrl,
    value: best.value,
  }))
}

/**
 * Get league sport index leaderboard
 */
export async function getLeagueSportIndexLeaderboard(
  leagueId: string,
  limit: number = 50
): Promise<LeagueLeaderboardEntry[]> {
  // Get all league members with their stats
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          stats: {
            select: {
              sportIndex: true,
            },
          },
        },
      },
    },
  })

  // Sort by sport index
  const sorted = members
    .filter((m) => m.user.stats?.sportIndex != null)
    .sort((a, b) => (b.user.stats?.sportIndex ?? 0) - (a.user.stats?.sportIndex ?? 0))
    .slice(0, limit)

  return sorted.map((m, index) => ({
    rank: index + 1,
    userId: m.user.id,
    displayName: m.user.displayName ?? "Unknown",
    avatarUrl: m.user.avatarUrl,
    value: m.user.stats?.sportIndex ?? 0,
  }))
}

/**
 * Update league
 */
export async function updateLeague(
  leagueId: string,
  userId: string,
  updates: {
    name?: string
    description?: string
    coverPhotoUrl?: string
  }
): Promise<{ success: boolean; error?: string }> {
  // Check permission
  const membership = await prisma.leagueMember.findUnique({
    where: {
      leagueId_userId: { leagueId, userId },
    },
  })

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    return { success: false, error: "Permission denied" }
  }

  await prisma.league.update({
    where: { id: leagueId },
    data: updates,
  })

  return { success: true }
}

/**
 * Regenerate invite code
 */
export async function regenerateInviteCode(
  leagueId: string,
  userId: string
): Promise<{ success: boolean; inviteCode?: string; error?: string }> {
  // Check permission
  const membership = await prisma.leagueMember.findUnique({
    where: {
      leagueId_userId: { leagueId, userId },
    },
  })

  if (!membership || membership.role !== "OWNER") {
    return { success: false, error: "Only owners can regenerate invite codes" }
  }

  const newCode = generateInviteCode()

  await prisma.league.update({
    where: { id: leagueId },
    data: { inviteCode: newCode },
  })

  return { success: true, inviteCode: newCode }
}
