import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getPersonalizedOffers, trackOfferClick, dismissOffer } from "@/lib/monetization"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // We need userId, but session only has email usually. 
    // Ideally we should put userId in session, but for now we fetch user.
    // Optimization: Assuming we can get userId from session or fetch it efficiently.
    // Let's fetch user by email to get ID.
    const prisma = (await import("@/lib/db")).prisma
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const offers = await getPersonalizedOffers(user.id)
    return NextResponse.json(offers)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = (await import("@/lib/db")).prisma
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { offerId, action } = await req.json()

    if (action === 'click') {
        await trackOfferClick(user.id, offerId)
    } else if (action === 'dismiss') {
        await dismissOffer(user.id, offerId)
    } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
}
