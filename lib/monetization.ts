import { prisma } from "@/lib/db"
import { SubscriptionPlan, GearType } from "@prisma/client"

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

export function canAccessFeature(user: any, feature: string): boolean {
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

export async function getPersonalizedOffers(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            gear: { where: { isRetired: false } },
            sportStats: true,
        }
    })

    if (!user) return []

    const offers: any[] = []
    const now = new Date()

    // 1. Gear replacement offers
    for (const gear of user.gear) {
        if (gear.maxRecommendedDistance && gear.totalDistance >= gear.maxRecommendedDistance * 0.8) {
            const offer = await prisma.productOffer.findFirst({
                where: {
                    targetGearType: gear.gearType,
                    isActive: true,
                    startDate: { lte: now },
                    endDate: { gte: now }
                },
                orderBy: { salePrice: 'asc' }
            })

            if (offer) {
                offers.push({ ...offer, reason: 'gear_replacement', gearId: gear.id })
            }
        }
    }

    // 2. Sport-specific offers based on activity
    const activeSports = user.sportStats
        .filter((s: any) => s.totalActivities >= 5)
        .map((s: any) => s.sportId)

    if (activeSports.length > 0) {
        const sportOffers = await prisma.productOffer.findMany({
            where: {
                targetSportId: { in: activeSports },
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            },
            take: 3
        })

        offers.push(...sportOffers.map((o: any) => ({ ...o, reason: 'sport_match' })))
    }

    // 3. Filter out already viewed/dismissed
    const viewedOfferIds = await prisma.productOfferView.findMany({
        where: { userId },
        select: { offerId: true }
    }).then(views => new Set(views.map((v: { offerId: string }) => v.offerId)))

    // Deduplicate offers by ID
    const uniqueOffers = Array.from(new Map(offers.map((item: any) => [item.id, item])).values())

    return uniqueOffers.filter((o: any) => !viewedOfferIds.has(o.id)).slice(0, 5)
}

export async function trackOfferClick(userId: string, offerId: string) {
    await prisma.productOfferView.upsert({
        where: {
            offerId_userId: {
                offerId,
                userId
            }
        },
        create: {
            offerId,
            userId,
            clickedAt: new Date()
        },
        update: {
            clickedAt: new Date()
        }
    })

    await prisma.productOffer.update({
        where: { id: offerId },
        data: { clicks: { increment: 1 } }
    })
}

export async function dismissOffer(userId: string, offerId: string) {
    await prisma.productOfferView.upsert({
        where: {
            offerId_userId: {
                offerId,
                userId
            }
        },
        create: {
            offerId,
            userId,
            dismissed: true
        },
        update: {
            dismissed: true
        }
    })
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

        // Check if gear needs replacement notification
        // We need to import createNotification dynamically to avoid circular dependencies if any
        // But createNotification is in lib/notifications.ts, which doesn't import monetization.ts, so it should be fine.
        // However, to be safe and clean:
        const { createNotification } = await import("@/lib/notifications")

        const updated = await prisma.userGear.findUnique({ where: { id: gear.id } })
        if (updated && updated.maxRecommendedDistance &&
            updated.totalDistance >= updated.maxRecommendedDistance * 0.9 &&
            !updated.isRetired) {

            await createNotification({
                userId: activity.userId,
                type: 'GEAR_REPLACEMENT', // We need to add this type to NotificationType enum or string
                title: 'Gear Check',
                message: `Your ${gear.brand} ${gear.model} has ${(updated.totalDistance / 1000).toFixed(0)}km. Consider replacing soon!`,
                data: { gearId: gear.id }
            })
        }
    }
}
