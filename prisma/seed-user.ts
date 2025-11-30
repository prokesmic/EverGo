import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
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

    // Seed some activities for Michal if none exist
    const activityCount = await prisma.activity.count({ where: { userId: user.id } })

    if (activityCount === 0) {
        // Find disciplines
        const running = await prisma.sport.findUnique({ where: { slug: 'running' }, include: { disciplines: true } })
        const cycling = await prisma.sport.findUnique({ where: { slug: 'cycling' }, include: { disciplines: true } })

        const trailRunning = running?.disciplines.find((d: any) => d.slug === 'trail')
        const roadCycling = cycling?.disciplines.find((d: any) => d.slug === 'road')

        if (trailRunning && roadCycling) {
            const today = new Date()

            // Activity 1: Trail Run 2 days ago
            await prisma.activity.create({
                data: {
                    userId: user.id,
                    disciplineId: trailRunning.id,
                    title: 'Morning Trail Run',
                    description: 'Great weather, feeling good!',
                    activityDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                    durationSeconds: 3600, // 1 hour
                    distanceMeters: 10500, // 10.5 km
                    caloriesBurned: 850,
                    primaryValue: 10500, // Distance for running
                    photos: "[]",
                    visibility: 'PUBLIC',
                }
            })

            // Activity 2: Cycling yesterday
            await prisma.activity.create({
                data: {
                    userId: user.id,
                    disciplineId: roadCycling.id,
                    title: 'Evening Ride',
                    description: 'Quick spin after work.',
                    activityDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                    durationSeconds: 2700, // 45 mins
                    distanceMeters: 20000, // 20 km
                    caloriesBurned: 600,
                    primaryValue: 20000, // Distance for cycling
                    photos: "[]",
                    visibility: 'PUBLIC',
                }
            })

            console.log("Seeded activities for Michal")
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
