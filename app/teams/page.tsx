import { prisma } from "@/lib/db"
import { PageGrid } from "@/components/layout/page-grid"
import { PageSubheader } from "@/components/layout/page-subheader"
import { CalendarWidget } from "@/components/widgets/calendar-widget"
import { TeamCard } from "@/components/teams/team-card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Trophy, Search, Sparkles, ChevronRight, UserPlus } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Input } from "@/components/ui/input"

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
    const session = await getServerSession(authOptions)

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

    let userTeams: any[] = []
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                teamMemberships: {
                    include: {
                        team: {
                            include: {
                                sport: true,
                                _count: { select: { members: true } }
                            }
                        }
                    }
                }
            }
        })
        if (user) {
            userTeams = user.teamMemberships.map((tm: any) => tm.team)
        }
    }

    const leftSidebar = (
        <>
            {/* Your Teams */}
            <div className="card-elevated overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Your Teams</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{userTeams.length}</span>
                </div>
                <div className="divide-y divide-border">
                    {userTeams.slice(0, 3).map((team: any) => (
                        <Link
                            key={team.id}
                            href={`/teams/${team.slug}`}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                {team.logoUrl ? (
                                    <img src={team.logoUrl} alt={team.name} className="w-full h-full rounded-lg object-cover" />
                                ) : (
                                    <span className="text-sm">{team.sport?.icon || '👥'}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{team.name}</div>
                                <div className="text-xs text-muted-foreground">{team._count?.members || 0} members</div>
                            </div>
                        </Link>
                    ))}
                    {userTeams.length === 0 && (
                        <div className="px-4 py-6 text-center">
                            <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">You haven't joined any teams yet</p>
                        </div>
                    )}
                </div>
                {userTeams.length > 3 && (
                    <div className="px-4 py-2 border-t border-border">
                        <Link href="/teams?filter=my" className="text-xs text-primary hover:underline flex items-center gap-1">
                            View all <ChevronRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Team Stats */}
            <div className="card-elevated p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Team Stats
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Teams</span>
                        <span className="font-bold">{teams.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Teams</span>
                        <span className="font-bold">{userTeams.length}</span>
                    </div>
                </div>
            </div>
        </>
    )

    const rightSidebar = (
        <>
            {/* Create Team Promo */}
            <div className="card-elevated p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Start a Team</h3>
                        <p className="text-xs text-muted-foreground">Create your own</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Bring your friends together, organize trainings, and compete as a team!
                </p>
                <Button asChild size="sm" className="w-full gap-1.5">
                    <Link href="/teams/create">
                        <Plus className="h-4 w-4" />
                        Create Team
                    </Link>
                </Button>
            </div>

            <CalendarWidget />

            {/* Pro Tip */}
            <div className="card-elevated p-4">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                    Teams that train together at least 3 times a week rank 40% higher on average!
                </p>
            </div>
        </>
    )

    const filterBar = (
        <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search teams..."
                    className="pl-9 h-9"
                />
            </div>
        </div>
    )

    const actions = (
        <Button asChild size="sm" className="gap-1.5">
            <Link href="/teams/create">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Team</span>
            </Link>
        </Button>
    )

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <PageSubheader
                title="Teams"
                subtitle="Find and join sports teams near you"
                filters={filterBar}
                actions={actions}
            />

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                {teams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team: any) => (
                            <TeamCard
                                key={team.id}
                                team={{
                                    ...team,
                                    memberCount: team._count?.members || 0
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="card-elevated">
                        <div className="empty-state py-12">
                            <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <h3 className="font-semibold text-foreground mb-1">No teams found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Be the first to create a team and invite your friends!
                            </p>
                            <Button asChild>
                                <Link href="/teams/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Team
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </PageGrid>
        </div>
    )
}
