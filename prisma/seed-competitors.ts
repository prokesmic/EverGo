import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedCompetitors(prisma: PrismaClient) {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const competitors = [
        {
            username: 'sarah_runner',
            displayName: 'Sarah Jenkins',
            avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop',
            city: 'Prague',
            bio: 'Marathon runner and coffee lover.',
            gender: 'FEMALE'
        },
        {
            username: 'david_cyclist',
            displayName: 'David Kolar',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop',
            city: 'Prague',
            bio: 'Cycling everywhere.',
            gender: 'MALE'
        },
        {
            username: 'emma_fit',
            displayName: 'Emma Wilson',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop',
            city: 'Prague',
            bio: 'Crossfit and trail running.',
            gender: 'FEMALE'
        },
        {
            username: 'tom_hiker',
            displayName: 'Tom Novak',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop',
            city: 'Brno',
            bio: 'Mountains are calling.',
            gender: 'MALE'
        },
        {
            username: 'lucy_swims',
            displayName: 'Lucy River',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
            city: 'Prague',
            bio: 'Just keep swimming.',
            gender: 'FEMALE'
        }
    ]

    // Get disciplines
    const running = await prisma.sport.findUnique({ where: { slug: 'running' }, include: { disciplines: true } })
    const cycling = await prisma.sport.findUnique({ where: { slug: 'cycling' }, include: { disciplines: true } })

    const roadRunning = running?.disciplines.find((d: any) => d.slug === '5k')
    const roadCycling = cycling?.disciplines.find((d: any) => d.slug === 'road')

    if (!roadRunning || !roadCycling) return

    for (const comp of competitors) {
        const user = await prisma.user.upsert({
            where: { username: comp.username },
            update: {},
            create: {
                email: `${comp.username}@example.com`,
                username: comp.username,
                displayName: comp.displayName,
                password: hashedPassword,
                avatarUrl: comp.avatarUrl,
                city: comp.city,
                country: 'Czech Republic',
                bio: comp.bio,
            }
        })

        // Generate random activities for the last 30 days
        const activityCount = await prisma.activity.count({ where: { userId: user.id } })

        if (activityCount < 5) {
            const today = new Date()
            for (let i = 0; i < 30; i++) {
                const date = new Date(today)
                date.setDate(date.getDate() - i)

                // 50% chance of activity
                if (Math.random() > 0.5) {
                    const isRun = Math.random() > 0.5
                    const discipline = isRun ? roadRunning : roadCycling

                    // Random duration 30-90 mins
                    const duration = 1800 + Math.random() * 3600

                    // Speed: Run ~10km/h, Bike ~25km/h
                    const speedKmh = isRun ? (9 + Math.random() * 4) : (20 + Math.random() * 15)
                    const distance = (duration / 3600) * speedKmh * 1000

                    await prisma.activity.create({
                        data: {
                            userId: user.id,
                            disciplineId: discipline.id,
                            title: isRun ? 'Training Run' : 'Training Ride',
                            activityDate: date,
                            durationSeconds: Math.round(duration),
                            distanceMeters: Math.round(distance),
                            caloriesBurned: Math.round(duration * (isRun ? 0.2 : 0.15)),
                            primaryValue: isRun ? Math.round(duration) : Math.round(distance), // Simplified
                            photos: "[]",
                            visibility: 'PUBLIC'
                        }
                    })
                }
            }
            console.log(`Seeded activities for ${comp.displayName}`)
        }
    }
}
