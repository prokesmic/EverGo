import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createActivityDomain } from "@/lib/domains/activity/service"
import { withIdempotency } from "@/lib/architecture/idempotency"
import { errorWithRequestId, getRequestIdFromRequest, jsonWithRequestId } from "@/lib/architecture/request"

export async function GET(request: Request) {
    const requestId = getRequestIdFromRequest(request)
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return errorWithRequestId(requestId, "Unauthorized", 401)
    }

    try {
        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
        const skip = (page - 1) * limit

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        })

        if (!user) {
            return errorWithRequestId(requestId, "User not found", 404)
        }

        const activities = await prisma.activity.findMany({
            where: { userId: user.id },
            orderBy: { activityDate: "desc" },
            skip,
            take: limit + 1,
            include: {
                sport: { select: { id: true, name: true, slug: true, icon: true } },
                discipline: { select: { id: true, name: true, slug: true } },
            },
        })

        const hasMore = activities.length > limit

        return jsonWithRequestId(requestId, {
            activities: hasMore ? activities.slice(0, limit) : activities,
            hasMore,
            nextPage: hasMore ? page + 1 : null,
        })
    } catch (error) {
        console.error("Error fetching activities:", error)
        return errorWithRequestId(requestId, "Internal Server Error", 500)
    }
}

export async function POST(request: Request) {
    const requestId = getRequestIdFromRequest(request)
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return errorWithRequestId(requestId, "Unauthorized", 401)
    }

    try {
        const body = await request.json()
        const {
            sportId,
            disciplineId,
            title,
            description,
            activityDate,
            durationSeconds,
            distanceMeters,
            elevationGain,
            caloriesBurned,
            avgHeartRate,
            photos,
            visibility = "PUBLIC",
            gpsRoute,
            route,
            startLocation,
            rpe,
        } = body

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return errorWithRequestId(requestId, "User not found", 404)
        }

        const serializedRoute =
            typeof gpsRoute === "string"
                ? gpsRoute
                : Array.isArray(route)
                    ? JSON.stringify(route)
                    : null

        const derivedStartLocation =
            typeof startLocation === "string"
                ? startLocation
                : Array.isArray(route) && route.length > 0
                    ? JSON.stringify({ lat: route[0].lat, lng: route[0].lng })
                    : null

        const idempotencyKey = request.headers.get("idempotency-key")
        return await withIdempotency(
            idempotencyKey ? `${user.id}:activity:${idempotencyKey}` : null,
            async () => {
                const { activityId, postId } = await createActivityDomain({
                    userId: user.id,
                    sportId,
                    disciplineId: disciplineId || null,
                    title,
                    description,
                    activityDate: new Date(activityDate),
                    durationSeconds,
                    distanceMeters,
                    elevationGain,
                    caloriesBurned,
                    avgHeartRate,
                    visibility,
                    photos: Array.isArray(photos) ? photos : [],
                    gpsRoute: serializedRoute,
                    startLocation: derivedStartLocation,
                    rpe: typeof rpe === "number" ? rpe : null,
                    createPost: true,
                })

                if (body.gearIds && Array.isArray(body.gearIds)) {
                    await prisma.activityGear.createMany({
                        data: body.gearIds.map((gearId: string) => ({
                            activityId,
                            gearId
                        })),
                        skipDuplicates: true,
                    })
                }

                const [activity, post] = await Promise.all([
                    prisma.activity.findUnique({ where: { id: activityId } }),
                    postId ? prisma.post.findUnique({ where: { id: postId } }) : Promise.resolve(null),
                ])

                return jsonWithRequestId(requestId, { activity, post })
            }
        )

    } catch (error) {
        console.error("Error creating activity:", error)
        if (error instanceof SyntaxError) {
            return errorWithRequestId(requestId, "Invalid JSON body", 400)
        }
        return errorWithRequestId(requestId, "Internal Server Error", 500)
    }
}
