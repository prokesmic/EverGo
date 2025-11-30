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
import { ActivityCard } from "@/components/feed/activity-card"
import { Fragment } from "react"
import { FeedComposer } from "@/components/feed/feed-composer"
import { InsightCard } from "@/components/feed/insight-card"
import { Activity, User, Discipline, Sport } from "@prisma/client"

type ActivityWithRelations = Activity & {
    user: User
    discipline: Discipline & {
        sport: Sport
    }
}

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

    const activities = await prisma.activity.findMany({
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
        take: 20,
    })

    const leftSidebar = (
        <>
            <ActivitiesSummaryWidget />
            <RankingsWidget />
        </>
    )

    const rightSidebar = (
        <>
            <CalendarWidget />
            <TeamsWidget />
            <BrandsWidget />
        </>
    )

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <div className="max-w-[1400px] mx-auto px-4 pt-6">
                <HeroProfile
                    name={session.user?.name || "Athlete"}
                    location="Prague, Czech Republic"
                    primarySport="Running"
                    avatarUrl={session.user?.image || ""}
                    coverUrl="https://images.unsplash.com/photo-1552674605-46d536d2f6d1?q=80&w=2073&auto=format&fit=crop"
                    weeklyDistanceKm={42.5}
                    weeklyTimeMinutes={235}
                    weeklyCalories={3450}
                    rankClub={1}
                    rankCity={12}
                    streakDays={14}
                />
            </div>

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                {/* Create Post Input */}
                <div className="mb-8">
                    <FeedComposer userImage={session.user?.image} userName={session.user?.name} />
                </div>

                {/* Activity Feed */}
                <div className="space-y-6">
                    {activities.map((activity: ActivityWithRelations, index: number) => (
                        <Fragment key={activity.id}>
                            <ActivityCard activity={activity} />

                            {/* Interleaved Insights */}
                            {index === 0 && (
                                <InsightCard
                                    type="advice"
                                    text="Run another 5 km this week to overtake Sarah and move to #3 in club rankings."
                                    actionText="View rankings"
                                />
                            )}
                            {index === 2 && (
                                <InsightCard
                                    type="trend"
                                    text="This is your 2nd best week this year. Keep it up!"
                                />
                            )}
                        </Fragment>
                    ))}
                    {activities.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-100">
                            <p>No activities yet. Go log one!</p>
                        </div>
                    )}
                </div>
            </PageGrid>
        </div>
    )
}
