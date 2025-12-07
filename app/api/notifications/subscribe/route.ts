import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const subscription = await req.json()

    // Store the subscription in the database
    // First, check if subscription already exists
    const existingSubscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: user.id,
        endpoint: subscription.endpoint,
      },
    })

    if (existingSubscription) {
      // Update existing subscription
      await prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving push subscription:", error)
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    )
  }
}
