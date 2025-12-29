/**
 * Strava Disconnect Route
 * Disconnects and optionally deauthorizes Strava
 */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { deauthorizeStrava } from "@/lib/integrations/strava/client"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { deauthorize = false } = await request.json().catch(() => ({}))

    const connection = await prisma.stravaConnection.findUnique({
      where: { userId: session.user.id },
    })

    if (!connection) {
      return NextResponse.json({ error: "No Strava connection found" }, { status: 404 })
    }

    // Optionally revoke access with Strava
    if (deauthorize && connection.accessToken) {
      try {
        await deauthorizeStrava(connection.accessToken)
        console.log("[Strava Disconnect] Deauthorized with Strava")
      } catch (error) {
        console.error("[Strava Disconnect] Failed to deauthorize:", error)
        // Continue with local disconnect even if Strava deauth fails
      }
    }

    // Mark connection as inactive (preserve data for potential reconnection)
    await prisma.stravaConnection.update({
      where: { userId: session.user.id },
      data: {
        isActive: false,
        accessToken: "", // Clear tokens
        refreshTokenEnc: "",
        updatedAt: new Date(),
      },
    })

    console.log("[Strava Disconnect] Connection disconnected for user:", session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Strava Disconnect] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
