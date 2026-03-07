import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
    buildFeedWhereClause,
    projectFeedPosts,
    rankFeedPosts,
    type FeedType,
    type PostWithRelations,
} from "@/lib/domains/feed/read-model"
import { errorWithRequestId, getRequestIdFromRequest, jsonWithRequestId } from "@/lib/architecture/request"

export async function GET(request: Request) {
    const requestId = getRequestIdFromRequest(request)
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return errorWithRequestId(requestId, "Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))
    const skip = (page - 1) * limit

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { following: true }
        })

        if (!user) {
            return errorWithRequestId(requestId, "User not found", 404)
        }

        const normalizedType: FeedType =
            type === "following" || type === "friends" ? type : "all"

        const whereClause = buildFeedWhereClause(
            normalizedType,
            user.id,
            user.following.map((f) => ({ followingId: f.followingId }))
        )

        const followingIds = user.following.map((f) => f.followingId)
        const shouldUseSmartRanking = normalizedType === "all"
        const takeWindow = shouldUseSmartRanking ? limit + 20 : limit + 1

        const posts = await prisma.post.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: takeWindow,
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

        const rankedPosts = shouldUseSmartRanking
            ? rankFeedPosts(posts as PostWithRelations[], {
                viewerId: user.id,
                followingIds,
                type: normalizedType,
            })
            : posts

        const windowedPosts = rankedPosts.slice(0, limit + 1)
        const hasMore = windowedPosts.length > limit
        const feedPosts = hasMore ? windowedPosts.slice(0, limit) : windowedPosts
        const formattedPosts = projectFeedPosts(feedPosts as PostWithRelations[], user.id)

        return jsonWithRequestId(requestId, {
            posts: formattedPosts,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        })

    } catch (error) {
        console.error("Error fetching feed:", error)
        return errorWithRequestId(requestId, "Internal Server Error", 500)
    }
}
