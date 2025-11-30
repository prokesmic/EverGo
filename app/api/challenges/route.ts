import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active" // active, upcoming, completed
    const sport = searchParams.get("sport")

    try {
        const where: any = {
            isActive: true
        }

        const now = new Date()

        if (status === "active") {
            where.startDate = { lte: now }
            where.endDate = { gte: now }
        } else if (status === "upcoming") {
            where.startDate = { gt: now }
        } else if (status === "completed") {
            where.endDate = { lt: now }
        }

        if (sport && sport !== "all") {
            where.sport = { slug: sport }
        }

        const challenges = await prisma.challenge.findMany({
            where,
            include: {
                sport: true,
                badge: true,
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { endDate: "asc" }
        })

        // If user is logged in, fetch their participation status
        let userParticipation: any = {}
        if (session?.user?.email) {
            const user = await prisma.user.findUnique({ where: { email: session.user.email } })
            if (user) {
                const participations = await prisma.challengeParticipant.findMany({
                    where: {
                        userId: user.id,
                        challengeId: { in: challenges.map(c => c.id) }
                    }
                })
                participations.forEach((p: any) => {
                    userParticipation[p.challengeId] = p
                })
            }
        }

        const enrichedChallenges = challenges.map((challenge: any) => ({
            ...challenge,
            participation: userParticipation[challenge.id] || null
        }))

        return NextResponse.json({ challenges: enrichedChallenges })
    } catch (error) {
        console.error("Error fetching challenges:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
