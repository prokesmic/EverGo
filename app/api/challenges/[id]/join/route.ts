import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: challengeId } = await params

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
        if (!challenge) {
            return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
        }

        // Check if already joined
        const existing = await prisma.challengeParticipant.findUnique({
            where: {
                challengeId_userId: {
                    challengeId,
                    userId: user.id
                }
            }
        })

        if (existing) {
            return NextResponse.json({ error: "Already joined" }, { status: 400 })
        }

        // Join
        await prisma.challengeParticipant.create({
            data: {
                userId: user.id,
                challengeId
            }
        })

        // Notify user
        try {
            const { notifyChallengeJoined } = await import("@/lib/notifications")
            await notifyChallengeJoined(user.id, challengeId)
        } catch (e) {
            console.error("Notification error:", e)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error joining challenge:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
