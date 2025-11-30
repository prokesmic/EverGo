import { prisma } from "@/lib/db"
import { PageGrid } from "@/components/layout/page-grid"
import { RankingsWidget } from "@/components/widgets/rankings-widget"

import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { TeamCard } from "@/components/teams/team-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function TeamsPage() {
    const teams = await prisma.team.findMany({
        include: {
            sport: true,
            _count: {
                select: { members: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const topRankings = await prisma.ranking.findMany({
        where: {
            scope: "GLOBAL",
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

    const formattedRankings = topRankings.map((r: any) => ({
        rank: r.position,
        name: r.user.displayName,
        value: `${Math.round(r.score)} pts`,
        avatarUrl: r.user.avatarUrl || "",
        isCurrentUser: false
    }))

    const leftSidebar = (
        <>
            <RankingsWidget rankings={formattedRankings} />
        </>
    )

    const rightSidebar = (
        <>
            <CalendarWidget />
            <BrandsWidget />
        </>
    )

    const session = await getServerSession(authOptions)
    let userTeamIds: string[] = []

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                teamMemberships: {
                    select: { teamId: true }
                }
            }
        })
        if (user) {
            userTeamIds = user.teamMemberships.map((tm: any) => tm.teamId)
        }
    }

    return (
        <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
                <Button asChild className="bg-brand-blue hover:bg-brand-blue-dark">
                    <Link href="/teams/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team: any) => (
                    <TeamCard
                        key={team.id}
                        team={team}
                        isMember={userTeamIds.includes(team.id)}
                    />
                ))}
            </div>

            {teams.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams found</h3>
                    <p className="text-gray-500 mb-6">Be the first to create a team and invite your friends!</p>
                    <Button asChild className="bg-brand-blue hover:bg-brand-blue-dark">
                        <Link href="/teams/create">Create Team</Link>
                    </Button>
                </div>
            )}
        </PageGrid>
    )
}
