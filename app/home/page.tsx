import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { PageGrid } from "@/components/layout/page-grid"
import { RankingsWidget } from "@/components/widgets/rankings-widget"
import { ActivitiesSummaryWidget } from "@/components/widgets/activities-summary-widget"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { TeamsWidget } from "@/components/widgets/teams-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { PartnerFinderWidget } from "@/components/social/partner-finder-widget"
import { HeroProfile } from "@/components/HeroProfile"
import { RankingsStrip } from "@/components/RankingsStrip"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { Feed } from "@/components/feed/feed"
import { StreakAlert } from "@/components/widgets/streak-alert"
import { FollowSuggestionsWrapper } from "@/components/widgets/follow-suggestions-wrapper"

export const dynamic = 'force-dynamic'

/**
 * Home Dashboard Page - Simplified for performance
 */
export default async function HomePage() {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            redirect("/login")
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user?.email || "" },
        })

        if (!user) {
            redirect("/login")
        }

        // Simplified data - fetch in parallel where possible
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        // Parallel fetch for better performance
        const [weeklyActivities, lastActivity, userTeams] = await Promise.all([
            prisma.activity.findMany({
                where: {
                    userId: user.id,
                    activityDate: { gte: sevenDaysAgo }
                },
                include: {
                    discipline: {
                        include: { sport: true }
                    }
                },
                take: 50 // Limit for performance
            }),
            prisma.activity.findFirst({
                where: { userId: user.id },
                orderBy: { activityDate: "desc" }
            }),
            prisma.teamMember.findMany({
                where: { userId: user.id },
                include: {
                    team: {
                        include: {
                            sport: true,
                            _count: { select: { members: true } }
                        }
                    }
                },
                take: 3
            })
        ])

        // Calculate Weekly Stats
        let weeklyDistance = 0
        let weeklyTime = 0
        let weeklyCalories = 0
        const sportStats: Record<string, { distance: number, time: number, color: string }> = {}

        weeklyActivities.forEach((activity: any) => {
            weeklyDistance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
            weeklyTime += activity.durationSeconds ? activity.durationSeconds / 60 : 0
            weeklyCalories += activity.caloriesBurned || 0

            const sportName = activity.discipline?.sport?.name?.toLowerCase() || 'other'
            if (!sportStats[sportName]) {
                let color = "bg-brand-blue text-white"
                if (sportName === "running") color = "bg-brand-green text-white"
                if (sportName === "cycling") color = "bg-yellow-500 text-black"
                if (sportName === "swimming") color = "bg-cyan-500 text-white"
                sportStats[sportName] = { distance: 0, time: 0, color }
            }
            sportStats[sportName].distance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
            sportStats[sportName].time += activity.durationSeconds ? activity.durationSeconds / 60 : 0
        })

        const activityBreakdown = Object.entries(sportStats).map(([sport, stats]) => ({
            sport,
            distance: stats.distance,
            percentage: weeklyDistance > 0 ? (stats.distance / weeklyDistance) * 100 : 0,
            color: stats.color
        })).sort((a, b) => b.distance - a.distance)

        const currentStreak = 0
        const weeklyGoal = 3
        const weeklyProgress = weeklyActivities.length

        // Use mock rankings for now to reduce DB calls
        const formattedRankings = [
            { rank: 1, name: "Top Athlete", value: "500 pts", avatarUrl: "", isCurrentUser: false },
            { rank: 2, name: "Runner Up", value: "450 pts", avatarUrl: "", isCurrentUser: false },
            { rank: 3, name: user.displayName || "You", value: "400 pts", avatarUrl: user.avatarUrl || "", isCurrentUser: true },
        ]

        const leftSidebar = (
            <>
                <ActivitiesSummaryWidget
                    totalDistance={weeklyDistance}
                    totalTime={weeklyTime}
                    totalCalories={weeklyCalories}
                    breakdown={activityBreakdown}
                />
                <RankingsWidget
                    rankings={formattedRankings}
                    userRank={3}
                />
            </>
        )

        const formattedTeams = userTeams.map((tm: any) => ({
            id: tm.team.id,
            name: tm.team.name,
            sport: tm.team.sport?.name || 'Sports',
            members: tm.team._count?.members || 0,
            nextTraining: "Tue 18:00",
            image: tm.team.logoUrl || "",
            initials: tm.team.name.substring(0, 2).toUpperCase(),
            color: "bg-blue-100 text-blue-600"
        }))

        const rightSidebar = (
            <>
                <PartnerFinderWidget />
                <FollowSuggestionsWrapper />
                <CalendarWidget />
                <TeamsWidget teams={formattedTeams} />
                <BrandsWidget />
            </>
        )

        // Mock rankings for strip
        const displayRankings = [
            { scope: "CLUB", rank: 3, totalParticipants: 24, trend: "up" },
            { scope: "CITY", rank: 12, totalParticipants: 150, trend: "same" },
            { scope: "GLOBAL", rank: 142, totalParticipants: 5000, trend: "down" }
        ] as any[]

        return (
            <div className="min-h-screen bg-background pb-20 md:pb-0">
                <div className="max-w-[1400px] mx-auto px-4 pt-6">
                    <HeroProfile
                        name={user.displayName || "Athlete"}
                        location={user.city || "Prague, Czech Republic"}
                        primarySport={activityBreakdown.length > 0 ? activityBreakdown[0].sport : "running"}
                        avatarUrl={user.avatarUrl || ""}
                        coverUrl={user.coverPhotoUrl || ""}
                        weeklyDistanceKm={parseFloat(weeklyDistance.toFixed(1))}
                        weeklyTimeMinutes={Math.round(weeklyTime)}
                        weeklyCalories={weeklyCalories}
                        streakDays={14}
                    />

                    <RankingsStrip rankings={displayRankings} />
                </div>

                <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                    <CreatePostBox userImage={user.avatarUrl || undefined} />
                    <StreakAlert
                        currentStreak={currentStreak}
                        lastActivityDate={lastActivity?.activityDate || null}
                        weeklyGoal={weeklyGoal}
                        weeklyProgress={weeklyProgress}
                    />
                    <Feed />
                </PageGrid>
            </div>
        )
    } catch (error) {
        console.error("Home page error:", error)
        redirect("/login")
    }
}
