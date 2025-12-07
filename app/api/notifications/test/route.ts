import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import webpush from "web-push"

// Configure web-push with VAPID keys
// In production, these should be environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ""
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:your-email@example.com"

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

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

    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: user.id },
    })

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: "No push subscriptions found" },
        { status: 404 }
      )
    }

    // Send test notification to all subscriptions
    const payload = JSON.stringify({
      title: "Test Notification 🎉",
      body: "This is a test notification from EverGo!",
      icon: "/icon-192.png",
      url: "/home",
      tag: "test",
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          },
          payload
        )
      )
    )

    // Check if any succeeded
    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      sent: succeeded,
      failed,
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    )
  }
}
