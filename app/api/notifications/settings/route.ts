import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        let settings = await prisma.notificationSettings.findUnique({
            where: { userId: user.id }
        })

        if (!settings) {
            // Create default settings
            settings = await prisma.notificationSettings.create({
                data: { userId: user.id }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error fetching notification settings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const settings = await prisma.notificationSettings.upsert({
            where: { userId: user.id },
            update: body,
            create: {
                userId: user.id,
                ...body
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error updating notification settings:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
