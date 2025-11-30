import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { gear: { orderBy: { createdAt: 'desc' } } }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.gear)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { gearType, brand, model, nickname, purchaseDate, purchasePrice, maxRecommendedDistance } = body

    if (!gearType || !brand || !model) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const gear = await prisma.userGear.create({
        data: {
            userId: user.id,
            gearType,
            brand,
            model,
            nickname,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            maxRecommendedDistance: maxRecommendedDistance ? parseFloat(maxRecommendedDistance) : null,
        }
    })

    return NextResponse.json(gear)
}
