import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound, redirect } from "next/navigation"
import { TeamHeader } from "@/components/teams/team-header"
import { TeamPostComposer } from "@/components/teams/team-post-composer"
import { TeamPostCard } from "@/components/teams/team-post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Calendar, Trophy } from "lucide-react"
import { format } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function TeamPage({ params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions)
    const slug = params.slug

    const team = await prisma.team.findUnique({
        where: { slug },
        include: {
            sport: true,
            members: {
                include: {
                    user: {
                        include: {
                            stats: true
                        }
                    }
                },
                orderBy: { role: "asc" },
                take: 10
            },
            _count: {
                select: { members: true }
            }
        }
    })

    if (!team) {
        notFound()
    }

    let currentUserMembership = null
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (user) {
            currentUserMembership = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId: team.id,
                        userId: user.id
                    }
                }
            })
        }
    }

    // Fetch posts
    const posts = await prisma.teamPost.findMany({
        where: { teamId: team.id },
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" }
        ],
        take: 20,
        include: {
            user: {
                select: {
                    id: true,
                    displayName: true,
                    avatarUrl: true
                }
            }
        }
    })

    const isAdmin = currentUserMembership?.role === "OWNER" || currentUserMembership?.role === "ADMIN"

    return (
        <div className="min-h-screen bg-bg-page pb-20">
            <TeamHeader team={team} currentUserMembership={currentUserMembership} />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Info */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* About */}
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
                            <h3 className="font-semibold text-text-primary mb-2">About</h3>
                            <p className="text-text-secondary text-sm mb-4">
                                {team.description || "No description provided."}
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Users className="w-4 h-4" />
                                    <span>{team.memberCount} members</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {format(team.createdAt, "MMM yyyy")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
                            <h3 className="font-semibold text-text-primary mb-3">Team Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-text-muted text-sm">Global Rank</span>
                                    <span className="font-bold text-text-primary">
                                        #{team.globalRank || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-muted text-sm">Total Distance</span>
                                    <span className="font-bold text-text-primary">
                                        {(team.totalDistance / 1000).toFixed(0)} km
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-text-muted text-sm">Avg Sport Index</span>
                                    <span className="font-bold text-text-primary">
                                        {team.avgSportIndex.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
                            <h3 className="font-semibold text-text-primary mb-3">Top Members</h3>
                            <div className="space-y-3">
                                {team.members.map((member: any, index: number) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <span className="w-5 text-text-muted text-sm font-mono">{index + 1}.</span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.user.avatarUrl || undefined} />
                                            <AvatarFallback>{member.user.displayName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-text-primary truncate">
                                                {member.user.displayName}
                                            </div>
                                            <div className="text-xs text-text-muted capitalize">
                                                {member.role.toLowerCase()}
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-text-secondary">
                                            {member.user.stats?.sportIndex || 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Feed */}
                    <div className="lg:col-span-8">
                        {currentUserMembership && (
                            <TeamPostComposer
                                teamId={team.id}
                                slug={team.slug}
                                isAdmin={isAdmin}
                            />
                        )}

                        <div className="space-y-4">
                            {posts.map((post: any) => (
                                <TeamPostCard key={post.id} post={post} />
                            ))}

                            {posts.length === 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-border-light p-8 text-center text-text-muted">
                                    No posts yet. Be the first to share an update!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
