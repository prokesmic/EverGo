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
import { HeroProfile } from "@/components/HeroProfile"
import { RankingsStrip } from "@/components/RankingsStrip"
import { CreatePostBox } from "@/components/feed/create-post-box"
import { Feed } from "@/components/feed/feed"
import { Activity, User, Discipline, Sport } from "@prisma/client"

/**
 * Home Dashboard Page
 * 
 * Layout System:
 * - Uses `PageGrid` component which implements a responsive 3-column grid (3-6-3 cols).
 * - Left Sidebar: ActivitiesSummaryWidget, RankingsWidget
 * - Center: Post Composer, Activity Feed (ActivityCard list)
 * - Right Sidebar: CalendarWidget, TeamsWidget, BrandsWidget
 */
export default async function HomePage() {
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

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyActivities = await prisma.activity.findMany({
        where: {
            userId: user.id,
            activityDate: {
                gte: sevenDaysAgo
            }
        },
        include: {
            discipline: {
                include: {
                    sport: true
                }
            }
        }
    })

    // Calculate Weekly Stats
    let weeklyDistance = 0
    let weeklyTime = 0
    let weeklyCalories = 0
    const sportStats: Record<string, { distance: number, time: number, color: string }> = {}

    weeklyActivities.forEach((activity: any) => {
        weeklyDistance += activity.distanceMeters ? activity.distanceMeters / 1000 : 0
        weeklyTime += activity.durationSeconds ? activity.durationSeconds / 60 : 0
        weeklyCalories += activity.caloriesBurned || 0

        const sportName = activity.discipline.sport.name.toLowerCase()
        if (!sportStats[sportName]) {
            // Assign colors based on sport
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



    // Fetch Rankings
    const topRankings = await prisma.ranking.findMany({
        where: {
            scope: "CLUB",
            period: "WEEKLY"
        },
        orderBy: {
            position: "asc"
        },
        take: 5,
        include: {
            user: true
        }
    })

    const currentUserRanking = await prisma.ranking.findFirst({
        where: {
            userId: user.id,
            scope: "CLUB",
            period: "WEEKLY"
        }
    })

    const formattedRankings = topRankings.map((r: any) => ({
        rank: r.position,
        name: r.user.displayName,
        value: `${Math.round(r.score)} pts`,
        avatarUrl: r.user.avatarUrl || "",
        isCurrentUser: r.userId === user.id
    }))

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
                userRank={currentUserRanking?.position}
            />
        </>
    )

    // Fetch User Teams
    const userTeams = await prisma.teamMember.findMany({
        where: {
            userId: user.id
        },
        include: {
            team: {
                include: {
                    sport: true,
                    members: true
                }
            }
        },
        take: 3
    })

    const formattedTeams = userTeams.map((tm: any) => ({
        id: tm.team.id,
        name: tm.team.name,
        sport: tm.team.sport.name,
        members: tm.team.members.length,
        nextTraining: "Tue 18:00", // Placeholder
        image: tm.team.logoUrl || "",
        initials: tm.team.name.substring(0, 2).toUpperCase(),
        color: "bg-blue-100 text-blue-600"
    }))

    const rightSidebar = (
        <>
            <CalendarWidget />
            <TeamsWidget teams={formattedTeams} />
            <BrandsWidget />
        </>
    )

    // Fetch Multi-Scope Rankings for Strip
    const scopes = ["CLUB", "CITY", "GLOBAL"]
    const rankingStatsPromises = scopes.map(async (scope) => {
        const rank = await prisma.ranking.findFirst({
            where: {
                userId: user.id,
                scope: scope,
                period: "WEEKLY"
            }
        })

        // Mock total participants for now as we don't have easy count in this query
        // In real app, we would query count of rankings in that scope
        const totalParticipants = scope === "CLUB" ? 24 : scope === "CITY" ? 150 : 5000

        return {
            scope: scope as "CLUB" | "CITY" | "COUNTRY" | "GLOBAL",
            rank: rank?.position || 0,
            totalParticipants,
            trend: "same" as "up" | "down" | "same" // Mock trend
        }
    })

    const rankingStats = (await Promise.all(rankingStatsPromises)).filter(r => r.rank > 0)

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <div className="max-w-[1400px] mx-auto px-4 pt-6">
                <HeroProfile
                    name={user.displayName || "Athlete"}
                    location={user.city || "Prague, Czech Republic"}
                    primarySport={activityBreakdown.length > 0 ? activityBreakdown[0].sport : "running"}
                    avatarUrl={user.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg/800px-Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg"}
                    coverUrl={user.coverPhotoUrl || "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop"}
                    weeklyDistanceKm={parseFloat(weeklyDistance.toFixed(1))}
                    weeklyTimeMinutes={Math.round(weeklyTime)}
                    weeklyCalories={weeklyCalories}
                    streakDays={14}
                />

                <RankingsStrip rankings={rankingStats} />
            </div>

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                <CreatePostBox />
                <Feed />
            </PageGrid>
        </div>
    )
}
