import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateResumeCardData, getResumeCardShareUrl } from "@/lib/share/resumeCard"

/**
 * GET /api/me/resume-card
 *
 * V11: Returns data for the user's shareable sport résumé card
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, username: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const cardData = await generateResumeCardData(user.id)
    const shareUrl = getResumeCardShareUrl(user.username)

    return NextResponse.json({
      ...cardData,
      shareUrl,
    })
  } catch (error) {
    console.error("[resume-card] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate resume card" },
      { status: 500 }
    )
  }
}
