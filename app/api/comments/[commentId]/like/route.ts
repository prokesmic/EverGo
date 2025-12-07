import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { commentId } = await params

    // Check if already liked
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { error: "Comment already liked" },
        { status: 400 }
      )
    }

    // Create like
    await prisma.commentLike.create({
      data: {
        userId: user.id,
        commentId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error liking comment:", error)
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { commentId } = await params

    // Delete like
    await prisma.commentLike.deleteMany({
      where: {
        userId: user.id,
        commentId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error unliking comment:", error)
    return NextResponse.json(
      { error: "Failed to unlike comment" },
      { status: 500 }
    )
  }
}
