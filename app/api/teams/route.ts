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
            whereClause.city = { contains: city } // Case insensitive in SQLite? Prisma handles it usually.
        }
        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ]
        }

        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                where: whereClause,
                include: {
                    sport: true,
                    _count: {
                        select: { members: true }
                    }
                },
                orderBy: { memberCount: "desc" },
                skip,
                take: limit
            }),
            prisma.team.count({ where: whereClause })
        ])

        const hasMore = total > skip + limit

        return NextResponse.json({
            teams,
            total,
            hasMore,
            nextPage: hasMore ? page + 1 : null
        })

    } catch (error) {
        console.error("Error fetching teams:", error)
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
        const { name, description, sportId, city, country, teamType, isPublic } = body

        if (!name || !sportId) {
            return NextResponse.json({ error: "Name and Sport are required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4)

        const team = await prisma.team.create({
            data: {
                name,
                slug,
                description,
                sportId,
                city,
                country,
                teamType: teamType || "CLUB",
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

        return NextResponse.json({ team })

    } catch (error) {
        console.error("Error creating team:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
