import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const query = searchParams.get("q")

        if (!query || query.length < 2) {
            return NextResponse.json([])
        }

        const [users, teams, challenges] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        { displayName: { contains: query } }, // Case-insensitive by default in SQLite/Postgres usually, but depends on collation
                        { username: { contains: query } }
                    ]
                },
                take: 5,
                select: {
                    id: true,
                    displayName: true,
                    username: true,
                    avatarUrl: true
                }
            }),
            prisma.team.findMany({
                where: {
                    name: { contains: query }
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                    sport: true
                }
            }),
            prisma.challenge.findMany({
                where: {
                    title: { contains: query }
                },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    targetType: true
                }
            })
        ])

        return NextResponse.json({
            users,
            teams,
            challenges
        })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
