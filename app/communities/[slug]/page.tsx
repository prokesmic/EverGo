import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"
import { CommunityHeader } from "@/components/communities/community-header"
import { CommunityPostComposer } from "@/components/communities/community-post-composer"
import { CommunityPostCard } from "@/components/communities/community-post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = 'force-dynamic'

export default async function CommunityPage({ params }: { params: { slug: string } }) {
    const session = await getServerSession(authOptions)
    const slug = params.slug

    const community = await prisma.community.findUnique({
        where: { slug },
        include: {
            sport: true,
            members: {
                include: {
                    user: true
                },
                take: 12
            },
            _count: {
                select: { members: true }
            }
        }
    })

    if (!community) {
        notFound()
    }

    let currentUserMembership = null
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (user) {
            currentUserMembership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: community.id,
                        userId: user.id
                    }
                }
            })
        }
    }

    // Fetch posts
    const posts = await prisma.communityPost.findMany({
        where: { communityId: community.id },
        orderBy: { createdAt: "desc" },
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

    return (
        <div className="min-h-screen bg-bg-page pb-20">
            <CommunityHeader community={community} currentUserMembership={currentUserMembership} />

            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Info */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* About */}
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
                            <h3 className="font-semibold text-text-primary mb-2">About</h3>
                            <p className="text-text-secondary text-sm mb-4">
                                {community.description || "No description provided."}
                            </p>
                        </div>

                        {/* Members */}
                        <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
                            <h3 className="font-semibold text-text-primary mb-3">Members</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {community.members.map((member: any) => (
                                    <div key={member.id} title={member.user.displayName}>
                                        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                                            <AvatarImage src={member.user.avatarUrl || undefined} />
                                            <AvatarFallback>{member.user.displayName[0]}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                ))}
                            </div>
                            {community.memberCount > 12 && (
                                <div className="mt-3 text-sm text-brand-primary font-medium hover:underline cursor-pointer">
                                    View all members
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Feed */}
                    <div className="lg:col-span-8">
                        {currentUserMembership && (
                            <CommunityPostComposer
                                communityId={community.id}
                                slug={community.slug}
                            />
                        )}

                        <div className="space-y-4">
                            {posts.map((post: any) => (
                                <CommunityPostCard key={post.id} post={post} />
                            ))}

                            {posts.length === 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-border-light p-8 text-center text-text-muted">
                                    No discussions yet. Start the conversation!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
