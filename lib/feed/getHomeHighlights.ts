import { prisma } from "@/lib/db"
import { computeHighlightScore, HighlightCandidate } from "./highlightScore"

export type HighlightItem = HighlightCandidate & {
  score: number
  user: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  }
  title?: string
}

/**
 * Get high-signal activity highlights for the Home feed
 * Returns activities from the user and their follows, scored by importance
 */
export async function getHomeHighlights(
  userId: string,
  limit = 6
): Promise<HighlightItem[]> {
  // 1) Find who the user follows
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })

  const followingIds = follows.map((f) => f.followingId)
  const audienceIds = [userId, ...followingIds]

  // 2) Pull recent activities from audience (last 14 days, capped)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const activities = await prisma.activity.findMany({
    where: {
      userId: { in: audienceIds },
      activityDate: { gte: fourteenDaysAgo },
    },
    orderBy: { activityDate: "desc" },
    take: 60, // Take more, then score down
    select: {
      id: true,
      userId: true,
      activityDate: true,
      title: true,
      durationSeconds: true,
      distanceMeters: true,
      discipline: {
        select: {
          slug: true,
          sport: { select: { slug: true } },
        },
      },
    },
  })

  // 3) Convert to candidates + score
  const candidates: (HighlightCandidate & { title?: string })[] = activities.map((a) => ({
    kind: "activity" as const,
    id: a.id,
    createdAt: a.activityDate,
    userId: a.userId,
    sportSlug: a.discipline?.sport?.slug ?? a.discipline?.slug ?? null,
    durationSec: a.durationSeconds ?? null,
    distanceM: a.distanceMeters ?? null,
    hasMedia: false, // Could enhance later with photo check
    hasRoute: false, // Could enhance later with GPS data check
    title: a.title,
  }))

  const scored = candidates
    .map((c) => ({ c, score: computeHighlightScore(c) }))
    .filter((x) => x.score > 0) // Filter out negative-scored (tiny sessions)
    .sort(
      (x, y) =>
        y.score - x.score ||
        y.c.createdAt.getTime() - x.c.createdAt.getTime()
    )
    .slice(0, limit)

  // 4) Fetch minimal user data for rendering
  const uniqueUserIds = Array.from(new Set(scored.map((x) => x.c.userId)))
  const users = await prisma.user.findMany({
    where: { id: { in: uniqueUserIds } },
    select: { id: true, displayName: true, avatarUrl: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  return scored.map(({ c, score }) => ({
    ...c,
    score,
    user: userMap.get(c.userId) ?? {
      id: c.userId,
      displayName: "Unknown",
      avatarUrl: null,
    },
  }))
}
