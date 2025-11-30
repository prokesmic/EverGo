import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultBadges = [
    // Distance Badges
    {
        name: "First Steps",
        description: "Complete your first activity",
        iconUrl: "/badges/first-steps.svg",
        color: "#22C55E",
        category: "DISTANCE",
        criteriaType: "TOTAL_ACTIVITIES",
        criteriaValue: 1,
        rarity: "COMMON"
    },
    {
        name: "10K Club",
        description: "Run a total of 10 kilometers",
        iconUrl: "/badges/10k.svg",
        color: "#3B82F6",
        category: "DISTANCE",
        criteriaType: "TOTAL_DISTANCE",
        criteriaValue: 10000, // meters
        sportId: "running",
        rarity: "COMMON"
    },
    {
        name: "Century Ride",
        description: "Complete a 100km bike ride in one activity",
        iconUrl: "/badges/century.svg",
        color: "#8B5CF6",
        category: "DISTANCE",
        criteriaType: "SINGLE_ACTIVITY_DISTANCE",
        criteriaValue: 100000,
        sportId: "cycling",
        rarity: "EPIC"
    },

    // Consistency Badges
    {
        name: "Week Warrior",
        description: "Maintain a 7-day activity streak",
        iconUrl: "/badges/week-warrior.svg",
        color: "#F97316",
        category: "CONSISTENCY",
        criteriaType: "STREAK_DAYS",
        criteriaValue: 7,
        rarity: "COMMON"
    },
    {
        name: "Month Master",
        description: "Maintain a 30-day activity streak",
        iconUrl: "/badges/month-master.svg",
        color: "#EF4444",
        category: "CONSISTENCY",
        criteriaType: "STREAK_DAYS",
        criteriaValue: 30,
        rarity: "RARE"
    },

    // Social Badges
    {
        name: "Connector",
        description: "Add 10 friends",
        iconUrl: "/badges/connector.svg",
        color: "#06B6D4",
        category: "SOCIAL",
        criteriaType: "FRIENDS_COUNT",
        criteriaValue: 10,
        rarity: "COMMON"
    },

    // Performance Badges
    {
        name: "Rising Star",
        description: "Reach a Sport Index of 300",
        iconUrl: "/badges/rising-star.svg",
        color: "#F59E0B",
        category: "PERFORMANCE",
        criteriaType: "SPORT_INDEX",
        criteriaValue: 300,
        rarity: "UNCOMMON"
    }
]

async function main() {
    console.log("Seeding gamification data...")

    // 1. Seed Badges
    for (const badge of defaultBadges) {
        // Check if badge exists
        const existing = await prisma.badge.findFirst({
            where: { name: badge.name }
        })

        if (!existing) {
            // Resolve sportId if needed
            let sportId = null
            if (badge.sportId) {
                const sport = await prisma.sport.findUnique({ where: { slug: badge.sportId } })
                sportId = sport?.id
            }

            await prisma.badge.create({
                data: {
                    name: badge.name,
                    description: badge.description,
                    iconUrl: badge.iconUrl,
                    color: badge.color,
                    category: badge.category as any,
                    criteriaType: badge.criteriaType as any,
                    criteriaValue: badge.criteriaValue,
                    rarity: badge.rarity as any,
                    sportId: sportId
                }
            })
            console.log(`Created badge: ${badge.name}`)
        }
    }

    // 2. Seed Challenges
    const runningSport = await prisma.sport.findUnique({ where: { slug: "running" } })

    if (runningSport) {
        const challengeTitle = "November 50K Challenge"
        const existingChallenge = await prisma.challenge.findFirst({ where: { title: challengeTitle } })

        if (!existingChallenge) {
            await prisma.challenge.create({
                data: {
                    title: challengeTitle,
                    description: "Run a total of 50km in November to earn the badge.",
                    imageUrl: "https://images.unsplash.com/photo-1552674605-469523f54050?auto=format&fit=crop&q=80&w=1000",
                    startDate: new Date("2024-11-01"),
                    endDate: new Date("2024-11-30"),
                    targetType: "DISTANCE",
                    targetValue: 50000,
                    targetUnit: "m",
                    sportId: runningSport.id,
                    scope: "GLOBAL"
                }
            })
            console.log(`Created challenge: ${challengeTitle}`)
        }
    }

    console.log("Gamification seeding completed.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
