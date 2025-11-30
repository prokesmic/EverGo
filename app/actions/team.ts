'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function joinTeam(teamId: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return { success: false, error: "Not authenticated" }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return { success: false, error: "User not found" }
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
        where: {
            teamId_userId: {
                teamId,
                userId: user.id
            }
        }
    })

    if (existingMember) {
        return { success: false, error: "Already a member" }
    }

    try {
        await prisma.teamMember.create({
            data: {
                teamId,
                userId: user.id,
                role: "MEMBER",
                joinedAt: new Date()
            }
        })

        revalidatePath("/teams")
        revalidatePath("/home")
        revalidatePath(`/profile/${user.username}`)

        return { success: true }
    } catch (error) {
        console.error("Error joining team:", error)
        return { success: false, error: "Failed to join team" }
    }
}
