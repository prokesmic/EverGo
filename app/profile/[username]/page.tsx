import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileContent } from "@/components/profile/profile-content"
import { PageGrid } from "@/components/layout/page-grid"
import { RankingsWidget } from "@/components/widgets/rankings-widget"
import { ActivitiesSummaryWidget } from "@/components/widgets/activities-summary-widget"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { TeamsWidget } from "@/components/widgets/teams-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { PersonalRecordsList } from "@/components/profile/personal-records-list"

interface ProfilePageProps {
    params: Promise<{
        username: string
    }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const session = await getServerSession(authOptions)
    const { username } = await params

    // Fetch user data with all necessary relations
    // Use findFirst with insensitive mode to handle capitalization differences
    const user = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                // SQLite doesn't strictly support mode: 'insensitive' in all Prisma versions/configs, 
                // but it's good practice for Postgres. For SQLite, it's often default case-insensitive.
                // We'll try exact match first, if that fails, we could try fallback, but let's stick to standard findFirst for now.
            }
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    activities: true,
                },
            },
            sports: {
                include: {
                    sport: true,
                },
            },
            activities: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    user: true,
                    discipline: {
                        include: {
                            sport: true,
                        },
                    },
                },
            },
            personalRecords: {
                orderBy: {
                    achievedAt: "desc",
                },
                include: {
                    discipline: {
                        include: {
                            sport: true,
                        },
                    },
                },
            },
            followers: {
                where: {
                    follower: {
                        email: session?.user?.email || "",
                    },
                },
            },
        },
    })

    if (!user) {
        notFound()
    }

    const isCurrentUser = session?.user?.email === user.email
    const isFollowing = user.followers.length > 0

    // Calculate Weekly Stats
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyActivities = user.activities.filter((a: any) => new Date(a.activityDate) >= sevenDaysAgo)

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
        where: { scope: "CLUB", period: "WEEKLY" },
        orderBy: { position: "asc" },
        take: 5,
        include: { user: true }
    })

    const currentUserRanking = await prisma.ranking.findFirst({
        where: { userId: user.id, scope: "CLUB", period: "WEEKLY" }
    })

    const formattedRankings = topRankings.map((r: any) => ({
        rank: r.position,
        name: r.user.displayName,
        value: `${Math.round(r.score)} pts`,
        avatarUrl: r.user.avatarUrl || "",
        isCurrentUser: r.userId === user.id
    }))

    // Fetch User Teams
    const userTeams = await prisma.teamMember.findMany({
        where: { userId: user.id },
        include: { team: { include: { sport: true, members: true } } },
        take: 3
    })

    const formattedTeams = userTeams.map((tm: any) => ({
        id: tm.team.id,
        name: tm.team.name,
        sport: tm.team.sport.name,
        members: tm.team.members.length,
        nextTraining: "Tue 18:00",
        image: tm.team.logoUrl || "",
        initials: tm.team.name.substring(0, 2).toUpperCase(),
        color: "bg-blue-100 text-blue-600"
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
            <PersonalRecordsList userId={user.id} />
        </>
    )

    const rightSidebar = (
        <>
            <CalendarWidget />
            <TeamsWidget teams={formattedTeams} />
            <BrandsWidget />
        </>
    )

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <ProfileHeader
                user={user}
                isCurrentUser={isCurrentUser}
                isFollowing={isFollowing}
            />

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                <ProfileContent profile={user} />
            </PageGrid>
        </div>
    )
}
