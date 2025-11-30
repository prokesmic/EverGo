import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'demo@evergo.app' },
        update: {},
        create: {
            email: 'demo@evergo.app',
            username: 'demo',
            displayName: 'Demo User',
            password: hashedPassword,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
            bio: 'I am a demo user exploring EverGo!',
            city: 'Prague',
            country: 'Czech Republic',
        },
    })

    console.log({ user })
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
