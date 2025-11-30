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

        const community = await prisma.community.findUnique({
            where: { slug }
        })

        if (!community) {
            return NextResponse.json({ error: "Community not found" }, { status: 404 })
        }

        // Check if already a member
        const existingMember = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: community.id,
                    userId: user.id
                }
            }
        })

        if (existingMember) {
            return NextResponse.json({ error: "Already a member" }, { status: 400 })
        }

        // Join directly (Communities are usually open)
        await prisma.communityMember.create({
            data: {
                communityId: community.id,
                userId: user.id,
                role: "MEMBER"
            }
        })

        // Update member count
        await prisma.community.update({
            where: { id: community.id },
            data: { memberCount: { increment: 1 } }
        })

        return NextResponse.json({ success: true, status: "JOINED" })

    } catch (error) {
        console.error("Error joining community:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
