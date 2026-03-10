import { parseGpsRoute } from "@/lib/activity/route"

export type FeedType = "all" | "friends" | "following"

type FollowRecord = { followingId: string }

export type PostWithRelations = {
  id: string
  postType: string
  content: string | null
  photos: string
  mapImageUrl: string | null
  createdAt: Date
  visibility: string
  userId: string
  user: {
    id: string
    username: string
    displayName: string
    avatarUrl: string | null
    city?: string | null
  }
  activity: {
    id: string
    title: string
    sport?: { name?: string | null; icon?: string | null; slug?: string | null } | null
    durationSeconds: number | null
    distanceMeters: number | null
    caloriesBurned: number | null
    elevationGain: number | null
    avgPace: number | null
    avgHeartRate: number | null
    gpsRoute: string | null
  } | null
  likes: Array<{ id: string }>
  _count: {
    likes: number
    comments: number
  }
}

export function buildFeedWhereClause(
  type: FeedType,
  viewerId: string,
  following: FollowRecord[]
) {
  const followingIds = following.map((item) => item.followingId)
  const audienceIds = [viewerId, ...followingIds]

  if (type === "following" || type === "friends") {
    return {
      OR: [
        {
          userId: viewerId,
          visibility: { in: ["PUBLIC", "FRIENDS", "FOLLOWERS_ONLY", "PRIVATE"] },
        },
        {
          userId: { in: followingIds },
          visibility: { in: ["PUBLIC", "FRIENDS", "FOLLOWERS_ONLY"] },
        },
      ],
    }
  }

  return {
    OR: [
      { visibility: "PUBLIC" },
      { visibility: "FRIENDS" }, // Legacy visibility value kept for compatibility
      {
        userId: { in: audienceIds },
        visibility: "FOLLOWERS_ONLY",
      },
      {
        userId: viewerId,
        visibility: "PRIVATE",
      },
    ],
  }
}

export function projectFeedPosts(posts: PostWithRelations[], viewerId: string) {
  return posts.map((post) => ({
    id: post.id,
    postType: post.postType,
    content: post.content,
    photos: safeParsePhotos(post.photos),
    mapImageUrl: post.mapImageUrl,
    createdAt: post.createdAt,
    visibility: post.visibility,
    user: post.user,
    activity: post.activity
      ? {
          id: post.activity.id,
          title: post.activity.title,
          sportName: post.activity.sport?.name || "Activity",
          sportIcon: post.activity.sport?.icon || "🏃",
          durationSeconds: post.activity.durationSeconds,
          distanceMeters: post.activity.distanceMeters,
          caloriesBurned: post.activity.caloriesBurned,
          elevationGain: post.activity.elevationGain,
          avgPace: post.activity.avgPace,
          avgHeartRate: post.activity.avgHeartRate,
          gpsRoute: projectGpsRoute(post.activity.gpsRoute, post.userId === viewerId),
        }
      : null,
    engagement: {
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLikedByMe: post.likes.length > 0,
    },
  }))
}

export function rankFeedPosts(
  posts: PostWithRelations[],
  options: {
    viewerId: string
    followingIds: string[]
    type: FeedType
    viewerCity?: string | null
    viewerSportSlugs?: string[]
  }
) {
  const now = Date.now()
  const followingSet = new Set(options.followingIds)
  const viewerSports = new Set((options.viewerSportSlugs ?? []).map((item) => item.toLowerCase()))

  const ranked = [...posts]
    .map((post) => {
      const ageHours = Math.max(0, (now - post.createdAt.getTime()) / 3_600_000)
      const recencyScore = Math.max(0, 100 - ageHours * 4)

      const engagementRaw = post._count.likes * 2 + post._count.comments * 3
      const engagementScore = Math.min(100, engagementRaw * 8)

      const isOwn = post.userId === options.viewerId
      const isFollowing = followingSet.has(post.userId)
      const relationshipBoost = isOwn ? 22 : isFollowing ? 14 : 0
      const typeBoost = options.type === "all" ? 0 : 4

      const routeBoost = post.activity?.gpsRoute ? 6 : 0
      const activityBoost = post.postType === "ACTIVITY" ? 5 : 0
      const sportSlug = post.activity?.sport?.slug?.toLowerCase() ?? null
      const sameSportBoost = sportSlug && viewerSports.has(sportSlug) ? 10 : 0
      const sameCityBoost =
        options.viewerCity &&
        post.user.city &&
        post.user.city.trim().toLowerCase() === options.viewerCity.trim().toLowerCase()
          ? 7
          : 0
      const milestoneBoost = post.postType === "MILESTONE" ? 8 : 0

      const score =
        recencyScore * 0.45 +
        engagementScore * 0.35 +
        relationshipBoost +
        typeBoost +
        routeBoost +
        activityBoost +
        sameSportBoost +
        sameCityBoost +
        milestoneBoost

      return { post, score }
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return b.post.createdAt.getTime() - a.post.createdAt.getTime()
    })

  return diversifyByAuthor(ranked).map((item) => item.post)
}

function safeParsePhotos(rawPhotos: string) {
  try {
    const parsed = JSON.parse(rawPhotos)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function projectGpsRoute(gpsRoute: string | null, isOwner: boolean): string | null {
  if (!gpsRoute) return null
  if (isOwner) return gpsRoute

  const points = parseGpsRoute(gpsRoute)
  if (points.length <= 120) return JSON.stringify(points)

  const step = points.length / 120
  const sampled = []
  for (let i = 0; i < 120; i += 1) {
    sampled.push(points[Math.floor(i * step)])
  }
  return JSON.stringify(sampled)
}

function diversifyByAuthor(items: Array<{ post: PostWithRelations; score: number }>) {
  const remaining = [...items]
  const result: Array<{ post: PostWithRelations; score: number }> = []

  while (remaining.length > 0) {
    const lastAuthorId = result[result.length - 1]?.post.userId
    const candidateIndex =
      remaining.findIndex((item) => item.post.userId !== lastAuthorId) === -1
        ? 0
        : remaining.findIndex((item) => item.post.userId !== lastAuthorId)
    result.push(remaining.splice(candidateIndex, 1)[0])
  }

  return result
}
