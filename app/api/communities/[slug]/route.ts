import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    try {
        const community = await prisma.community.findUnique({
            where: { slug },
            include: {
                sport: true,
                members: {
                    include: {
                        user: true
                    },
                    take: 10
                },
                _count: {
                    select: { members: true, posts: true }
                }
            }
        })

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 })
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

        // Fetch recent posts
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

        return NextResponse.json({
            community,
            members: community.members,
            posts,
            currentUserMembership
        })

    } catch (error) {
        console.error("Error fetching community details:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
