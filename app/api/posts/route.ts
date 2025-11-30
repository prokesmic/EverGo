import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { content, photos, visibility = "PUBLIC" } = body

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const postType = photos && photos.length > 0 ? "PHOTO" : "STATUS"

        const post = await prisma.post.create({
            data: {
                userId: user.id,
                postType,
                content,
                photos: photos ? JSON.stringify(photos) : "[]",
                visibility
            }
        })

        return NextResponse.json({ post })

    } catch (error) {
        console.error("Error creating post:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
