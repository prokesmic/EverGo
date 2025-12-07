import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/login")
  }

  // Fetch all activities for the user
  const activities = await prisma.activity.findMany({
    where: {
      userId: user.id,
    },
    include: {
      sport: true,
      discipline: true,
    },
    orderBy: {
      activityDate: "desc",
    },
  })

  // Calculate summary stats
  const totalActivities = activities.length
  const totalDistance = activities.reduce(
    (sum, a) => sum + (a.distanceMeters || 0),
    0
  )
  const totalTime = activities.reduce(
    (sum, a) => sum + (a.durationSeconds || 0),
    0
  )
  const totalCalories = activities.reduce(
    (sum, a) => sum + (a.caloriesBurned || 0),
    0
  )

  // Get personal records
  const longestDistance = Math.max(
    ...activities.map((a) => a.distanceMeters || 0),
    0
  )
  const longestDuration = Math.max(
    ...activities.map((a) => a.durationSeconds || 0),
    0
  )
  const fastestPace = Math.min(
    ...activities
      .filter((a) => a.avgPace && a.avgPace > 0)
      .map((a) => a.avgPace!),
    Infinity
  )

  // Group activities by sport
  const sportBreakdown: Record<string, { count: number; distance: number; time: number }> = {}
  activities.forEach((activity) => {
    const sportName = activity.sport?.name || "Other"
    if (!sportBreakdown[sportName]) {
      sportBreakdown[sportName] = { count: 0, distance: 0, time: 0 }
    }
    sportBreakdown[sportName].count++
    sportBreakdown[sportName].distance += activity.distanceMeters || 0
    sportBreakdown[sportName].time += activity.durationSeconds || 0
  })

  // Get this month's activities
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthActivities = activities.filter(
    (a) => new Date(a.activityDate) >= startOfMonth
  )

  // Get last month's activities for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
  const lastMonthActivities = activities.filter((a) => {
    const date = new Date(a.activityDate)
    return date >= startOfLastMonth && date <= endOfLastMonth
  })

  const analyticsData = {
    summary: {
      totalActivities,
      totalDistance: totalDistance / 1000, // Convert to km
      totalTime: totalTime / 3600, // Convert to hours
      totalCalories,
    },
    personalRecords: {
      longestDistance: longestDistance / 1000,
      longestDuration: longestDuration / 3600,
      fastestPace: fastestPace === Infinity ? 0 : fastestPace,
    },
    sportBreakdown: Object.entries(sportBreakdown).map(([sport, stats]) => ({
      sport,
      count: stats.count,
      distance: stats.distance / 1000,
      time: stats.time / 3600,
    })),
    thisMonth: {
      count: thisMonthActivities.length,
      distance:
        thisMonthActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) /
        1000,
      time:
        thisMonthActivities.reduce(
          (sum, a) => sum + (a.durationSeconds || 0),
          0
        ) / 3600,
    },
    lastMonth: {
      count: lastMonthActivities.length,
      distance:
        lastMonthActivities.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) /
        1000,
      time:
        lastMonthActivities.reduce(
          (sum, a) => sum + (a.durationSeconds || 0),
          0
        ) / 3600,
    },
    recentActivities: activities.slice(0, 30).map((a) => ({
      date: a.activityDate.toISOString(),
      sport: a.sport.name,
      distance: (a.distanceMeters || 0) / 1000,
      duration: (a.durationSeconds || 0) / 60,
      pace: a.avgPace || 0,
    })),
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-text-primary mb-2">
            Analytics
          </h1>
          <p className="text-text-muted text-lg">
            Track your progress and achievements
          </p>
        </div>

        <AnalyticsDashboard data={analyticsData} />
      </div>
    </div>
  )
}
