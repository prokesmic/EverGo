import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan, successUrl, cancelUrl } = await req.json()

    if (!['PRO', 'PRO_ANNUAL'].includes(plan)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // MOCK CHECKOUT SESSION
    // In a real app, this would call Stripe API to create a session
    // For now, we'll simulate a successful checkout URL that redirects back to successUrl
    // We can also simulate creating the subscription immediately for testing purposes

    // Simulate creating/updating subscription immediately for demo purposes
    // In production, this would happen via webhook
    const now = new Date()
    const periodEnd = new Date()
    if (plan === 'PRO') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    }

    await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            plan: plan,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
        },
        update: {
            plan: plan,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            canceledAt: null,
        }
    })

    return NextResponse.json({ checkoutUrl: successUrl })
}
