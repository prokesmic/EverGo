import { prisma } from "./lib/db"

async function main() {
    const user = await prisma.user.upsert({
        where: { username: "demouser" },
        update: {},
        create: {
            username: "demouser",
            email: "demouser@example.com",
            displayName: "Demo User",
            password: "password123", // In a real app, hash this
            bio: "I am a demo user created to test the profile page.",
            city: "San Francisco",
            country: "USA",
            privacyLevel: "PUBLIC",
            avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demouser",
        }
    })
    console.log("Created user:", user)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
