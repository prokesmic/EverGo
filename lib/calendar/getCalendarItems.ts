import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { CalendarItem } from "./types"
import { getSportAccent } from "./types"

/**
 * Server-side function to fetch calendar items for a date range
 * Merges Activities (and Events/Challenges when they exist)
 */
export async function getCalendarItems(from: Date, to: Date): Promise<CalendarItem[]> {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return []
  }

  // Fetch user's activities
  const activities = await prisma.activity.findMany({
    where: {
      userId,
      activityDate: {
        gte: from,
        lte: to,
      },
    },
    include: {
      sport: true,
      discipline: true,
    },
    orderBy: {
      activityDate: "asc",
    },
  })

  // Map activities to CalendarItem format
  const activityItems: CalendarItem[] = activities.map((activity) => ({
    id: activity.id,
    type: "activity" as const,
    title: activity.title || activity.sport?.name || activity.discipline?.name || "Activity",
    startAt: activity.activityDate.toISOString(),
    endAt: activity.durationSeconds
      ? new Date(activity.activityDate.getTime() + activity.durationSeconds * 1000).toISOString()
      : undefined,
    sportSlug: activity.sport?.slug,
    sportName: activity.sport?.name,
    locationName: undefined, // Activity doesn't have location in current schema
    accent: getSportAccent(activity.sport?.slug),
    meta: {
      durationSeconds: activity.durationSeconds || undefined,
      distanceMeters: activity.distanceMeters || undefined,
      caloriesBurned: activity.caloriesBurned || undefined,
    },
  }))

  // Fetch user's challenge participations
  const challengeParticipations = await prisma.challengeParticipant.findMany({
    where: {
      userId,
      challenge: {
        startDate: { lte: to },
        endDate: { gte: from },
      },
    },
    include: {
      challenge: {
        include: {
          sport: true,
        },
      },
    },
  })

  // Map challenges to CalendarItem format
  const challengeItems: CalendarItem[] = challengeParticipations.map((participation) => {
    const challenge = participation.challenge
    return {
      id: challenge.id,
      type: "challenge" as const,
      title: challenge.title,
      startAt: challenge.startDate.toISOString(),
      endAt: challenge.endDate.toISOString(),
      sportSlug: challenge.sport?.slug,
      sportName: challenge.sport?.name,
      isAllDay: true,
      accent: getSportAccent(challenge.sport?.slug) || "violet",
      meta: {
        targetValue: challenge.targetValue,
        targetUnit: challenge.targetUnit,
        progress: participation.currentValue,
        isCompleted: participation.isCompleted,
      },
    }
  })

  // Combine and sort all items by start date
  return [...activityItems, ...challengeItems].sort((a, b) =>
    a.startAt.localeCompare(b.startAt)
  )
}

/**
 * Get sports the user is active in (for filter options)
 */
export async function getUserSports(): Promise<{ id: string; name: string; slug: string }[]> {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return []
  }

  const userSports = await prisma.userSport.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      sport: true,
    },
    orderBy: {
      priority: "asc",
    },
  })

  return userSports.map((us) => ({
    id: us.sport.id,
    name: us.sport.name,
    slug: us.sport.slug,
  }))
}
