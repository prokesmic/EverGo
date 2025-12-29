import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isValidE2ERequest, E2E_ENABLED } from "@/lib/env"
import bcrypt from "bcryptjs"

/**
 * E2E Test API - Create/Get Test User
 *
 * POST /api/test/user - Create a test user
 * GET /api/test/user?email=xxx - Get test user by email
 * DELETE /api/test/user?email=xxx - Delete test user
 *
 * Security: Requires E2E_ENABLED=true and valid E2E_TEST_SECRET
 */

function getSecretFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-e2e-secret") || null
}

export async function POST(req: NextRequest) {
  const secret = getSecretFromRequest(req)

  if (!isValidE2ERequest(secret)) {
    return NextResponse.json(
      { error: "Unauthorized - E2E testing not enabled or invalid secret" },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { email, password, displayName, username } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "User already exists", userId: existing.id },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split("@")[0],
        displayName: displayName || "Test User",
        privacyLevel: "PUBLIC",
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("E2E test user creation failed:", error)
    return NextResponse.json(
      { error: "Failed to create test user" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const secret = getSecretFromRequest(req)

  if (!isValidE2ERequest(secret)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email query param is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("E2E test user lookup failed:", error)
    return NextResponse.json(
      { error: "Failed to lookup user" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const secret = getSecretFromRequest(req)

  if (!isValidE2ERequest(secret)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email query param is required" },
        { status: 400 }
      )
    }

    // Only allow deleting test users (emails containing "test" or "e2e")
    const isTestEmail =
      email.includes("test") ||
      email.includes("e2e") ||
      email.includes("playwright")

    if (!isTestEmail) {
      return NextResponse.json(
        { error: "Can only delete test user accounts" },
        { status: 403 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Delete user and cascade
    await prisma.user.delete({ where: { email } })

    return NextResponse.json({
      success: true,
      message: `Deleted test user: ${email}`,
    })
  } catch (error) {
    console.error("E2E test user deletion failed:", error)
    return NextResponse.json(
      { error: "Failed to delete test user" },
      { status: 500 }
    )
  }
}
