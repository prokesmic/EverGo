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

interface ProfilePageProps {
    params: {
        username: string
    }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const session = await getServerSession(authOptions)
    const username = params.username

    // Fetch user data with all necessary relations
    const user = await prisma.user.findUnique({
        where: { username },
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
