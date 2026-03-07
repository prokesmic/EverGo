import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { followUser, unfollowUser } from "@/lib/follow"

type FollowBody = {
  userId?: string
}

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  return currentUser?.id ?? null
}

async function parseBody(request: NextRequest): Promise<FollowBody> {
  try {
    return (await request.json()) as FollowBody
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await parseBody(request)
    const targetUserId = body.userId

    if (!targetUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const targetExists = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    })

    if (!targetExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await followUser(currentUserId, targetUserId)

    return NextResponse.json({
      success: true,
      isFollowing: true,
      userId: targetUserId,
    })
  } catch (error) {
    console.error("Follow API error:", error)
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId()
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await parseBody(request)
    const targetUserId = body.userId

    if (!targetUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    await unfollowUser(currentUserId, targetUserId)

    return NextResponse.json({
      success: true,
      isFollowing: false,
      userId: targetUserId,
    })
  } catch (error) {
    console.error("Unfollow API error:", error)
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
  }
}
