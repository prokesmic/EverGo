import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        await prisma.notification.updateMany({
            where: {
                id,
                userId: user.id
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error marking notification as read:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
