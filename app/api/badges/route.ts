import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)

    try {
        const badges = await prisma.badge.findMany({
            where: { isActive: true },
            orderBy: [
                { category: "asc" },
                { displayOrder: "asc" }
            ]
        })

        let earnedBadgeIds: string[] = []
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: { badges: true }
            })
            if (user) {
                earnedBadgeIds = user.badges.map((b: any) => b.badgeId)
            }
        }

        const enrichedBadges = badges.map((badge: any) => ({
            ...badge,
            isEarned: earnedBadgeIds.includes(badge.id)
        }))

        return NextResponse.json({ badges: enrichedBadges })
    } catch (error) {
        console.error("Error fetching badges:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
