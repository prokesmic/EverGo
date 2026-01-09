import { prisma } from "@/lib/db"

export const PREMIUM_FEATURES = {
    FREE: {
        maxSports: 3,
        maxTeams: 1,
        rankingScopes: ['city', 'country'],
        activityHistory: 90, // days
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

export function canAccessFeature(user: { subscription?: { plan: string } | null }, feature: string): boolean {
    const plan = (user.subscription?.plan as keyof typeof PREMIUM_FEATURES) || 'FREE'
    const features = PREMIUM_FEATURES[plan]

    switch (feature) {
        case 'global_rankings':
            return features.rankingScopes.includes('global')
        case 'advanced_analytics':
            return features.advancedAnalytics
        case 'data_export':
            return features.exportData
        case 'unlimited_sports':
            return features.maxSports === 'unlimited'
        case 'unlimited_teams':
            return features.maxTeams === 'unlimited'
        case 'ad_free':
            return features.adFree
        default:
            return true
    }
}

// ProductOffer functionality removed in V6
export async function getPersonalizedOffers(_userId: string) {
    console.warn("[Deprecated] ProductOffers have been removed in V6")
    return []
}

export async function trackOfferClick(_userId: string, _offerId: string) {
    console.warn("[Deprecated] ProductOffers have been removed in V6")
}

export async function dismissOffer(_userId: string, _offerId: string) {
    console.warn("[Deprecated] ProductOffers have been removed in V6")
}

export async function updateGearUsage(activityId: string) {
    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: { gearItems: { include: { gear: true } } }
    })

    if (!activity) return

    for (const { gear } of activity.gearItems) {
        await prisma.userGear.update({
            where: { id: gear.id },
            data: {
                totalDistance: { increment: activity.distanceMeters || 0 },
                totalDuration: { increment: activity.durationSeconds || 0 },
                activityCount: { increment: 1 }
            }
        })

        const { createNotification } = await import("@/lib/notifications")

        const updated = await prisma.userGear.findUnique({ where: { id: gear.id } })
        if (updated && updated.maxRecommendedDistance &&
            updated.totalDistance >= updated.maxRecommendedDistance * 0.9 &&
            !updated.isRetired) {

            await createNotification({
                userId: activity.userId,
                type: 'GEAR_REPLACEMENT',
                title: 'Gear Check',
                message: `Your ${gear.brand} ${gear.model} has ${(updated.totalDistance / 1000).toFixed(0)}km. Consider replacing soon!`,
                data: { gearId: gear.id }
            })
        }
    }
}
