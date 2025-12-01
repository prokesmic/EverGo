import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
    try {
        const user = await prisma.user.upsert({
            where: { username: "demouser" },
            update: {},
            create: {
                username: "demouser",
                email: "demouser@example.com",
                displayName: "Demo User",
                password: "password123",
                bio: "I am a demo user created to test the profile page.",
                city: "San Francisco",
                country: "USA",
                privacyLevel: "PUBLIC",
                avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demouser",
            }
        })

        return NextResponse.json({
            message: "Database seeded successfully",
            user: { username: user.username, id: user.id }
        })
    } catch (error) {
        console.error("Seeding error:", error)
        return NextResponse.json({
            error: "Failed to seed database",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
