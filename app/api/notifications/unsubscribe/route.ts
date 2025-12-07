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

    const { endpoint } = await req.json()

    // Delete the subscription from the database
    await prisma.pushSubscription.deleteMany({
      where: {
        userId: user.id,
        endpoint,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing push subscription:", error)
    return NextResponse.json(
      { error: "Failed to remove subscription" },
      { status: 500 }
    )
  }
}
