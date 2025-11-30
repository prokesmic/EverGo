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
                    orderBy: { role: "asc" }, // OWNER first (usually)
                    take: 20 // Limit members for initial load
                },
                _count: {
                    select: { members: true, posts: true }
                }
            }
        })

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
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

        // Fetch recent posts
        const posts = await prisma.teamPost.findMany({
            where: { teamId: team.id },
            orderBy: [
                { isPinned: "desc" },
                { createdAt: "desc" }
            ],
            take: 10,
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
            team,
            members: team.members,
            posts,
            currentUserMembership
        })

    } catch (error) {
        console.error("Error fetching team details:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
