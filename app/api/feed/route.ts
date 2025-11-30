import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { following: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        let whereClause: any = {
            visibility: { in: ["PUBLIC", "FRIENDS"] } // Simplified visibility logic
        }

        if (type === "following") {
            const followingIds = user.following.map(f => f.followingId)
            whereClause.userId = { in: [...followingIds, user.id] }
        } else if (type === "friends") {
            // Assuming friends are mutual followers or separate table. 
            // For now, let's treat following as friends for MVP or just filter by following.
            const followingIds = user.following.map(f => f.followingId)
            whereClause.userId = { in: [...followingIds, user.id] }
        }
        // 'all' or 'discover' could include public posts from everyone

        const posts = await prisma.post.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit + 1, // Fetch one extra to check for next page
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true
                    }
                },
                activity: {
                    include: {
                        sport: true
                    }
                },
                likes: {
                    where: { userId: user.id },
                    select: { id: true }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            }
        })

        const hasMore = posts.length > limit
        const feedPosts = hasMore ? posts.slice(0, limit) : posts

        const formattedPosts = feedPosts.map(post => ({
            id: post.id,
            postType: post.postType,
            content: post.content,
            photos: post.photos ? JSON.parse(post.photos) : [],
            mapImageUrl: post.mapImageUrl,
            createdAt: post.createdAt,
            visibility: post.visibility,
            user: post.user,
            activity: post.activity ? {
                id: post.activity.id,
                title: post.activity.title,
                sportName: post.activity.sport?.name || "Activity",
                sportIcon: post.activity.sport?.icon || "🏃",
                durationSeconds: post.activity.durationSeconds,
                distanceMeters: post.activity.distanceMeters,
                caloriesBurned: post.activity.caloriesBurned,
                elevationGain: post.activity.elevationGain,
                avgPace: post.activity.avgPace,
                avgHeartRate: post.activity.avgHeartRate,
            } : null,
            engagement: {
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLikedByMe: post.likes.length > 0
            }
        }))

        return NextResponse.json({
            posts: formattedPosts,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        })

    } catch (error) {
        console.error("Error fetching feed:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
