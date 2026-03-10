import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"
import { RATE_LIMITS, rateLimitMiddleware } from "@/lib/rate-limit"
import { isPasswordResetTokenFreshForUser, verifyPasswordResetToken } from "@/lib/auth/password-reset"

export async function POST(request: Request) {
  const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body?.token === "string" ? body.token.trim() : ""
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : ""

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const tokenPayload = verifyPasswordResetToken(token)
    if (!tokenPayload) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: tokenPayload.email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired" },
        { status: 400 }
      )
    }

    // Invalidate older links automatically after password changes.
    if (!isPasswordResetTokenFreshForUser(tokenPayload, user.password)) {
      return NextResponse.json(
        { error: "This reset link has already been used or is no longer valid" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    logger.info("Password reset completed", { userId: user.id })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Password reset failed", error)
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 })
  }
}
