import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params

    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "asc" },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true
                    }
                }
            }
        })

        return NextResponse.json({ comments })

    } catch (error) {
        console.error("Error fetching comments:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await params

    try {
        const body = await request.json()
        const { content } = body

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const comment = await prisma.comment.create({
            data: {
                userId: user.id,
                postId,
                content
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

        // Notify post owner
        try {
            const { notifyComment } = await import("@/lib/notifications")
            await notifyComment(postId, user.id, content)
        } catch (e) {
            console.error("Notification error:", e)
        }

        return NextResponse.json(comment)

        // Increment post comments count
        await prisma.post.update({
            where: { id: postId },
            data: { commentsCount: { increment: 1 } }
        })

        return NextResponse.json({ comment })

    } catch (error) {
        console.error("Error creating comment:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
