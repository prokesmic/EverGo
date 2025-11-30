import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

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
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: user.id
                }
            }
        })

        if (existingLike) {
            return NextResponse.json({ message: "Already liked" })
        }

        // Create Like
        await prisma.like.create({
            data: {
                userId: user.id,
                postId
            }
        })

        // Increment post likes count
        await prisma.post.update({
            where: { id: postId },
            data: { likesCount: { increment: 1 } }
        })

        // Notify post owner
        try {
            const { notifyPostLike } = await import("@/lib/notifications")
            await notifyPostLike(postId, user.id)
        } catch (e) {
            console.error("Notification error:", e)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error liking post:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await params

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        await prisma.like.delete({
            where: {
                postId_userId: {
                    postId,
                    userId: user.id
                }
            }
        })

        // Decrement post likes count
        await prisma.post.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error unliking post:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
