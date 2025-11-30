import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get("sport")
    const city = searchParams.get("city")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    try {
        let whereClause: any = {}

        if (sport) {
            whereClause.sport = { slug: sport }
        }
        if (city) {
            whereClause.city = { contains: city }
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { topic: { contains: search } }
            ]
        }

        const [communities, total] = await Promise.all([
            prisma.community.findMany({
                where: whereClause,
                include: {
                    sport: true
                },
                orderBy: { memberCount: "desc" },
                skip,
                take: limit
            }),
            prisma.community.count({ where: whereClause })
        ])

        const hasMore = total > skip + limit

        return NextResponse.json({
            communities,
            total,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        })

    } catch (error) {
        console.error("Error fetching communities:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, description, sportId, topic, city, country, isPublic } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4)

        const community = await prisma.community.create({
            data: {
                name,
                slug,
                description,
                sportId,
                topic,
                city,
                country,
                isPublic: isPublic !== undefined ? isPublic : true,
                members: {
                    create: {
                        userId: user.id,
                        role: "OWNER"
                    }
                },
                memberCount: 1
            }
        })

        return NextResponse.json({ community })

    } catch (error) {
        console.error("Error creating community:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
