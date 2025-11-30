import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

const PREMIUM_FEATURES = {
    FREE: {
        maxSports: 3,
        maxTeams: 1,
        rankingScopes: ['city', 'country'],
        activityHistory: 90,
        exportData: false,
        advancedAnalytics: false,
        customChallenges: false,
        prioritySupport: false,
        adFree: false,
    },
    PRO: {
        maxSports: 'unlimited',
        maxTeams: 'unlimited',
        rankingScopes: ['city', 'country', 'global', 'friends'],
        activityHistory: 'unlimited',
        exportData: true,
        advancedAnalytics: true,
        customChallenges: true,
        prioritySupport: true,
        adFree: true,
    }
}

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { subscription: true }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const subscription = user.subscription
    const plan = subscription?.plan || 'FREE'
    const status = subscription?.status || 'EXPIRED'
    const isPro = status === 'ACTIVE' || status === 'TRIALING'

    return NextResponse.json({
        plan: isPro ? plan : 'FREE',
        status: isPro ? status : 'EXPIRED',
        features: isPro ? PREMIUM_FEATURES.PRO : PREMIUM_FEATURES.FREE,
        currentPeriodEnd: subscription?.currentPeriodEnd,
        cancelAtPeriodEnd: !!subscription?.canceledAt
    })
}
