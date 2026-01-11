import { prisma } from './db'

/**
 * Follow System - Canonical Social Graph
 *
 * Social Model:
 * - Follow is the primary relationship
 * - "Friends" = mutual follows (derived, not stored)
 * - FriendRequest model is DEPRECATED (kept for migration only)
 *
 * Key Concepts:
 * - follower: The user who initiates the follow
 * - following: The user being followed
 * - mutual: Both users follow each other
 */

export interface FollowUser {
  id: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
}

export interface FollowRelation extends FollowUser {
  isFollowing: boolean
  isFollowedBy: boolean
  isMutual: boolean
}

/**
 * Check if userA follows userB
 */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  })
  return !!follow
}

/**
 * Get full follow relationship between two users
 */
export async function getFollowRelation(
  userAId: string,
  userBId: string
): Promise<{ isFollowing: boolean; isFollowedBy: boolean; isMutual: boolean }> {
  const [aFollowsB, bFollowsA] = await Promise.all([
    isFollowing(userAId, userBId),
    isFollowing(userBId, userAId),
  ])

  return {
    isFollowing: aFollowsB,
    isFollowedBy: bFollowsA,
    isMutual: aFollowsB && bFollowsA,
  }
}

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<void> {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself')
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: { followerId, followingId },
    },
    create: { followerId, followingId },
    update: {}, // No-op if already exists
  })
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<void> {
  await prisma.follow.deleteMany({
    where: { followerId, followingId },
  })
}

/**
 * Get users that userId is following
 */
export async function getFollowing(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<FollowUser[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    skip: offset,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      following: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return follows.map((f) => f.following)
}

/**
 * Get users that follow userId
 */
export async function getFollowers(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<FollowUser[]> {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    skip: offset,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      follower: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return follows.map((f) => f.follower)
}

/**
 * Get mutual follows ("friends") for a user
 * These are users where both follow each other
 */
export async function getMutualFollows(
  userId: string,
  limit: number = 50
): Promise<FollowUser[]> {
  // Get IDs of users this user follows
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const followingIds = following.map((f) => f.followingId)

  if (followingIds.length === 0) return []

  // Find which of those also follow back
  const mutuals = await prisma.follow.findMany({
    where: {
      followerId: { in: followingIds },
      followingId: userId,
    },
    take: limit,
    select: {
      follower: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return mutuals.map((f) => f.follower)
}

/**
 * Get follow counts for a user
 */
export async function getFollowCounts(
  userId: string
): Promise<{ following: number; followers: number }> {
  const [following, followers] = await Promise.all([
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.follow.count({ where: { followingId: userId } }),
  ])

  return { following, followers }
}

/**
 * Get users with their follow relation to currentUserId
 * Useful for displaying follow buttons on user lists
 */
export async function getUsersWithFollowStatus(
  userIds: string[],
  currentUserId: string
): Promise<Map<string, { isFollowing: boolean; isFollowedBy: boolean }>> {
  if (userIds.length === 0) return new Map()

  const [outgoing, incoming] = await Promise.all([
    prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    }),
    prisma.follow.findMany({
      where: {
        followerId: { in: userIds },
        followingId: currentUserId,
      },
      select: { followerId: true },
    }),
  ])

  const followingSet = new Set(outgoing.map((f) => f.followingId))
  const followedBySet = new Set(incoming.map((f) => f.followerId))

  const result = new Map<string, { isFollowing: boolean; isFollowedBy: boolean }>()
  for (const id of userIds) {
    result.set(id, {
      isFollowing: followingSet.has(id),
      isFollowedBy: followedBySet.has(id),
    })
  }

  return result
}

/**
 * Check if users are mutual follows (friends)
 */
export async function areMutualFollows(
  userAId: string,
  userBId: string
): Promise<boolean> {
  const relation = await getFollowRelation(userAId, userBId)
  return relation.isMutual
}
