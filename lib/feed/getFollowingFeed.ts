import { prisma } from "@/lib/db"
import { unstable_cache } from "next/cache"

export type FeedActivity = {
  id: string
  title: string | null
  description: string | null
  activityDate: Date
  durationSeconds: number | null
  distanceMeters: number | null
  createdAt: Date
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
  }
  discipline: {
    name: string
    slug: string
    sport: {
      name: string
      slug: string
    }
  } | null
}

export type FollowingFeedResult = {
  activities: FeedActivity[]
  followingCount: number
  hasMore: boolean
}

/**
 * Get chronological activity feed from user + people they follow
 */
async function _getFollowingFeed(
  userId: string,
  limit = 30,
  cursor?: string
): Promise<FollowingFeedResult> {
  // 1) Find who the user follows
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  const followingIds = follows.map((f) => f.followingId)
  const audienceIds = [userId, ...followingIds]

  // 2) Fetch activities from audience (me + following)
  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: audienceIds },
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1, // Take one extra to check if there's more
    select: {
      id: true,
      title: true,
      description: true,
      activityDate: true,
      durationSeconds: true,
      distanceMeters: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          displayName: true,
          username: true,
          avatarUrl: true,
        },
      },
      discipline: {
        select: {
          name: true,
          slug: true,
          sport: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  })

  const hasMore = activities.length > limit
  const resultActivities = hasMore ? activities.slice(0, limit) : activities

  return {
    activities: resultActivities,
    followingCount: followingIds.length,
    hasMore,
  }
}

/**
 * Cached version - revalidates every 30 seconds
 */
export const getFollowingFeed = unstable_cache(
  _getFollowingFeed,
  ["following-feed"],
  { revalidate: 30 }
)

/**
 * Get just the count of people user follows (for empty state check)
 */
export async function getFollowingCount(userId: string): Promise<number> {
  const count = await prisma.follow.count({
    where: { followerId: userId },
  })
  return count
}
