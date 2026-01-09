import { prisma } from "@/lib/db"
import { computeActivityScore } from "@/src/server/effort/effort"

/**
 * Recomputes UserActivityScore for all users.
 * Should be run daily via cron job.
 *
 * For each user:
 * 1. Sum powerPoints from activities in the last N days (default 28)
 * 2. Compute activityScore using logarithmic scale
 * 3. Upsert UserActivityScore snapshot for today
 */
export async function recomputeActivityScores(windowDays: number = 28) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const windowStart = new Date(today)
  windowStart.setDate(windowStart.getDate() - windowDays)

  console.log(`[ActivityScores] Computing for window: ${windowStart.toISOString()} - ${today.toISOString()}`)

  // Get all users with activities
  const usersWithActivities = await prisma.user.findMany({
    select: {
      id: true,
      city: true,
      country: true,
    },
  })

  console.log(`[ActivityScores] Processing ${usersWithActivities.length} users`)

  let processed = 0
  let updated = 0

  for (const user of usersWithActivities) {
    // Get sum of power points and count of activities in window
    const result = await prisma.activity.aggregate({
      where: {
        userId: user.id,
        activityDate: {
          gte: windowStart,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Include today
        },
        isAnomalous: false, // Exclude flagged activities
      },
      _sum: {
        powerPoints: true,
      },
      _count: {
        id: true,
      },
    })

    const totalPower = result._sum.powerPoints || 0
    const activityCount = result._count.id || 0

    // Only create/update if user has any activity
    if (totalPower > 0 || activityCount > 0) {
      const activityScore = computeActivityScore(totalPower)

      await prisma.userActivityScore.upsert({
        where: {
          userId_asOfDate_windowDays: {
            userId: user.id,
            asOfDate: today,
            windowDays,
          },
        },
        create: {
          userId: user.id,
          asOfDate: today,
          windowDays,
          totalPower,
          activityScore,
          activityCount,
          country: user.country,
          city: user.city,
        },
        update: {
          totalPower,
          activityScore,
          activityCount,
          country: user.country,
          city: user.city,
        },
      })

      updated++
    }

    processed++

    // Log progress every 100 users
    if (processed % 100 === 0) {
      console.log(`[ActivityScores] Processed ${processed}/${usersWithActivities.length}`)
    }
  }

  console.log(`[ActivityScores] Complete: processed ${processed}, updated ${updated}`)

  return { processed, updated }
}

/**
 * Update power points for a single activity.
 * Called when an activity is created or updated.
 */
export async function updateActivityPowerPoints(activityId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      discipline: {
        include: { sport: true },
      },
      sport: true,
    },
  })

  if (!activity) return null

  // Import dynamically to avoid circular dependencies
  const { computePowerPoints } = await import("@/src/server/effort/effort")

  const sportSlug =
    activity.sport?.slug ||
    activity.discipline?.sport?.slug ||
    activity.discipline?.slug ||
    "generic"

  const durationMin = activity.durationSeconds ? activity.durationSeconds / 60 : 0
  const distanceKm = activity.distanceMeters ? activity.distanceMeters / 1000 : undefined

  const powerPoints = computePowerPoints({
    sportSlug,
    durationMin,
    distanceKm,
    avgHr: activity.avgHeartRate ?? undefined,
    avgPower: undefined, // Add if you have power data
    rpe: activity.rpe ?? undefined,
  })

  // Update the activity with computed power points
  await prisma.activity.update({
    where: { id: activityId },
    data: { powerPoints },
  })

  return powerPoints
}
