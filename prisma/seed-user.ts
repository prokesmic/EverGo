import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedUser(prisma: PrismaClient) {
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Michal user
    const user = await prisma.user.upsert({
        where: { email: 'demo@evergo.app' },
        update: {
            displayName: 'Michal',
            avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg/800px-Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg',
            coverPhotoUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop',
            city: 'Prague',
            country: 'Czech Republic',
        },
        create: {
            email: 'demo@evergo.app',
            username: 'michal',
            displayName: 'Michal',
            password: hashedPassword,
            avatarUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg/800px-Chris_Hemsworth_by_Gage_Skidmore_2_%28cropped%29.jpg',
            coverPhotoUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop',
            bio: 'Passionate athlete exploring EverGo!',
            city: 'Prague',
            country: 'Czech Republic',
        },
    })

    console.log({ user })

    // Seed activities if none exist (or just add more to ensure richness)
    // We'll check if we have enough activities
    const activityCount = await prisma.activity.count({ where: { userId: user.id } })

    if (activityCount < 5) {
        // Find disciplines
        const running = await prisma.sport.findUnique({ where: { slug: 'running' }, include: { disciplines: true } })
        const cycling = await prisma.sport.findUnique({ where: { slug: 'cycling' }, include: { disciplines: true } })

        const trailRunning = running?.disciplines.find((d: any) => d.slug === 'trail')
        const roadRunning = running?.disciplines.find((d: any) => d.slug === '5k')
        const roadCycling = cycling?.disciplines.find((d: any) => d.slug === 'road')

        if (trailRunning && roadCycling && roadRunning) {
            const today = new Date()
            const activities = []

            // Generate 30 days of data
            for (let i = 0; i < 30; i++) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)

                // Randomly decide if active (60% chance)
                if (Math.random() > 0.4) {
                    const type = Math.random()
                    let activityData: any = null

                    if (type < 0.4) {
                        // Running (Short)
                        const duration = 1800 + Math.random() * 1800 // 30-60 mins
                        const distance = (duration / 60) * (150 + Math.random() * 50) // ~5-6 min/km pace
                        activityData = {
                            disciplineId: roadRunning.id,
                            title: 'Morning Run',
                            description: 'Easy pace around the neighborhood.',
                            durationSeconds: Math.round(duration),
                            distanceMeters: Math.round(distance),
                            caloriesBurned: Math.round(duration * 0.2),
                            primaryValue: Math.round(duration), // Time for 5k discipline usually
                        }
                    } else if (type < 0.7) {
                        // Trail Running (Long)
                        const duration = 3600 + Math.random() * 3600 // 60-120 mins
                        const distance = (duration / 60) * (120 + Math.random() * 40) // Slower pace
                        activityData = {
                            disciplineId: trailRunning.id,
                            title: 'Trail Adventure',
                            description: 'Hilly route, great views.',
                            durationSeconds: Math.round(duration),
                            distanceMeters: Math.round(distance),
                            caloriesBurned: Math.round(duration * 0.25),
                            primaryValue: Math.round(distance), // Distance for trail
                        }
                    } else {
                        // Cycling
                        const duration = 3600 + Math.random() * 7200 // 1-3 hours
                        const distance = (duration / 60) * (400 + Math.random() * 200) // ~25-35 km/h
                        activityData = {
                            disciplineId: roadCycling.id,
                            title: 'Road Ride',
                            description: 'Pushing the watts!',
                            durationSeconds: Math.round(duration),
                            distanceMeters: Math.round(distance),
                            caloriesBurned: Math.round(duration * 0.15),
                            primaryValue: Math.round(distance), // Distance for cycling
                        }
                    }

                    if (activityData) {
                        await prisma.activity.create({
                            data: {
                                userId: user.id,
                                ...activityData,
                                activityDate: date,
                                photos: "[]",
                                visibility: 'PUBLIC',
                            }
                        })
                    }
                }
            }

            console.log("Seeded realistic activities for Michal")
        }
    }
}

// Allow running directly
if (require.main === module) {
    const prisma = new PrismaClient()
    seedUser(prisma)
        .then(async () => {
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
}
