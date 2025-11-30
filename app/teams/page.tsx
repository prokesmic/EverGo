import { prisma } from "@/lib/db"
import { PageGrid } from "@/components/layout/page-grid"
import { RankingsWidget } from "@/components/widgets/rankings-widget"
import { ActivitiesSummaryWidget } from "@/components/widgets/activities-summary-widget"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { BrandsWidget } from "@/components/widgets/brands-widget"
import { TeamCard } from "@/components/teams/team-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

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

    const leftSidebar = (
        <>
            <ActivitiesSummaryWidget />
            <RankingsWidget />
        </>
    )

    const rightSidebar = (
        <>
            <CalendarWidget />
            <BrandsWidget />
        </>
    )

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
                {teams.map((team) => (
                    <TeamCard key={team.id} team={team} />
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
