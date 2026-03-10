import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { logger } from "@/lib/logger"
import { RATE_LIMITS, rateLimitMiddleware } from "@/lib/rate-limit"
import { getPasswordResetUrl, issuePasswordResetToken } from "@/lib/auth/password-reset"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.auth)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been sent.",
      })
    }

    const token = issuePasswordResetToken(user.email, user.password)
    const resetUrl = getPasswordResetUrl(token)

    // Production should send reset links through an email provider.
    logger.info("Password reset requested", { userId: user.id })
    if (process.env.NODE_ENV !== "production") {
      logger.info("Password reset URL (dev only)", { userId: user.id, resetUrl })
      return NextResponse.json({
        success: true,
        message: "If an account exists, a password reset link has been sent.",
        resetUrl,
      })
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset link has been sent.",
    })
  } catch (error) {
    logger.error("Forgot password request failed", error)
    return NextResponse.json(
      { error: "Unable to process password reset request" },
      { status: 500 }
    )
  }
}
