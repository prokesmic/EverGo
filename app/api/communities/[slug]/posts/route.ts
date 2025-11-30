import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    try {
        const body = await request.json()
        const { content, photos } = body

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const community = await prisma.community.findUnique({
            where: { slug }
        })

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 })
        }

        // Verify membership
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: community.id,
                    userId: user.id
                }
            }
        })

        if (!membership) {
            return NextResponse.json({ error: "Must be a member to post" }, { status: 403 })
        }

        const post = await prisma.communityPost.create({
            data: {
                communityId: community.id,
                userId: user.id,
                content,
                photos: photos ? JSON.stringify(photos) : "[]"
            },
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

        return NextResponse.json({ post })

    } catch (error) {
        console.error("Error creating community post:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
