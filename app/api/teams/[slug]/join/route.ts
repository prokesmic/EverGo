import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const team = await prisma.team.findUnique({
            where: { slug }
        })

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
        }

        // Check if already a member
        const existingMember = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId: team.id,
                    userId: user.id
                }
            }
        })

        if (existingMember) {
            return NextResponse.json({ error: "Already a member" }, { status: 400 })
        }

        if (team.isPublic) {
            // Join directly
            await prisma.teamMember.create({
                data: {
                    teamId: team.id,
                    userId: user.id,
                    role: "MEMBER"
                }
            })

            // Update member count
            await prisma.team.update({
                where: { id: team.id },
                data: { memberCount: { increment: 1 } }
            })

            return NextResponse.json({ success: true, status: "JOINED" })
        } else {
            // Create join request
            const existingRequest = await prisma.teamJoinRequest.findUnique({
                where: {
                    teamId_userId: {
                        teamId: team.id,
                        userId: user.id
                    }
                }
            })

            if (existingRequest) {
                return NextResponse.json({ error: "Request already pending" }, { status: 400 })
            }

            await prisma.teamJoinRequest.create({
                data: {
                    teamId: team.id,
                    userId: user.id,
                    status: "PENDING"
                }
            })

            return NextResponse.json({ success: true, status: "PENDING" })
        }

    } catch (error) {
        console.error("Error joining team:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
