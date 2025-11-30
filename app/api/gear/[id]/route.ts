import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // Verify ownership
    const existingGear = await prisma.userGear.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!existingGear || existingGear.user.email !== session.user.email) {
        return NextResponse.json({ error: "Gear not found or unauthorized" }, { status: 404 })
    }

    const updatedGear = await prisma.userGear.update({
        where: { id },
        data: {
            nickname: body.nickname,
            isRetired: body.isRetired,
            retiredAt: body.isRetired && !existingGear.isRetired ? new Date() : undefined,
            retiredReason: body.retiredReason,
            maxRecommendedDistance: body.maxRecommendedDistance ? parseFloat(body.maxRecommendedDistance) : undefined,
        }
    })

    return NextResponse.json(updatedGear)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existingGear = await prisma.userGear.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!existingGear || existingGear.user.email !== session.user.email) {
        return NextResponse.json({ error: "Gear not found or unauthorized" }, { status: 404 })
    }

    await prisma.userGear.delete({
        where: { id }
    })

    return NextResponse.json({ success: true })
}
