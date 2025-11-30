import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const requestId = params.id
        const userId = session.user.id

        // Check if already joined
        const existing = await prisma.partnerRequestParticipant.findUnique({
            where: {
                requestId_userId: {
                    requestId,
                    userId
                }
            }
        })

        if (existing) {
            return NextResponse.json({ error: "Already joined" }, { status: 400 })
        }

        // Join
        const participant = await prisma.partnerRequestParticipant.create({
            data: {
                requestId,
                userId,
                status: "ACCEPTED"
            }
        })

        return NextResponse.json(participant)
    } catch (error) {
        console.error("Failed to join partner request", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
