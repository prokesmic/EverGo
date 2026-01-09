import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isValidE2ERequest } from "@/lib/env"

/**
 * E2E Test API - Reset Test Data
 *
 * POST /api/test/reset - Reset all test data for a user or globally
 *
 * Security: Requires E2E_ENABLED=true and valid E2E_TEST_SECRET
 *
 * Options:
 * - email: Reset data for a specific test user
 * - scope: "user" | "activities" | "teams" | "all" - What to reset
 */

type ResetScope = "user" | "activities" | "teams" | "benchmarks" | "all"

function getSecretFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-e2e-secret") || null
}

async function resetUserActivities(userId: string) {
  const result = await prisma.activity.deleteMany({
    where: { userId },
  })
  return result.count
}

async function resetUserTeamMemberships(userId: string) {
  const result = await prisma.teamMember.deleteMany({
    where: { userId },
  })
  return result.count
}

async function resetUserBenchmarks(_userId: string) {
  // Benchmarks removed in V6
  return 0
}

async function resetTestUser(email: string) {
  // Only allow deleting test users
  const isTestEmail =
    email.includes("test") ||
    email.includes("e2e") ||
    email.includes("playwright")

  if (!isTestEmail) {
    throw new Error("Can only reset test user accounts")
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error(`User not found: ${email}`)
  }

  // Delete all user data
  const activitiesDeleted = await resetUserActivities(user.id)
  const teamsDeleted = await resetUserTeamMemberships(user.id)
  const benchmarksDeleted = await resetUserBenchmarks(user.id)

  // Delete user sports
  await prisma.userSport.deleteMany({ where: { userId: user.id } })

  // Delete notifications
  await prisma.notification.deleteMany({ where: { userId: user.id } })

  return {
    activitiesDeleted,
    teamsDeleted,
    benchmarksDeleted,
  }
}

async function cleanupTestTeams() {
  // Delete teams created for testing
  const result = await prisma.team.deleteMany({
    where: {
      slug: { startsWith: "e2e-" },
    },
  })
  return result.count
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
    const { email, scope = "all" } = body as {
      email?: string
      scope?: ResetScope
    }

    const result: Record<string, unknown> = { scope }

    if (email) {
      // Reset specific user's data
      const isTestEmail =
        email.includes("test") ||
        email.includes("e2e") ||
        email.includes("playwright")

      if (!isTestEmail) {
        return NextResponse.json(
          { error: "Can only reset test user accounts" },
          { status: 403 }
        )
      }

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        return NextResponse.json(
          { error: `User not found: ${email}` },
          { status: 404 }
        )
      }

      result.email = email

      switch (scope) {
        case "activities":
          result.activitiesDeleted = await resetUserActivities(user.id)
          break

        case "teams":
          result.teamsDeleted = await resetUserTeamMemberships(user.id)
          break

        case "benchmarks":
          result.benchmarksDeleted = await resetUserBenchmarks(user.id)
          break

        case "user":
        case "all":
          const resetResult = await resetTestUser(email)
          Object.assign(result, resetResult)
          break

        default:
          return NextResponse.json(
            { error: `Unknown scope: ${scope}` },
            { status: 400 }
          )
      }
    } else {
      // Global cleanup - only clean test data
      result.testTeamsDeleted = await cleanupTestTeams()

      // Clean up test users (users with test/e2e/playwright in email)
      const testUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: "test" } },
            { email: { contains: "e2e" } },
            { email: { contains: "playwright" } },
          ],
        },
        select: { email: true },
      })

      result.testUsersFound = testUsers.length

      for (const user of testUsers) {
        try {
          await resetTestUser(user.email)
        } catch {
          // Continue with other users
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("E2E reset failed:", error)
    return NextResponse.json(
      { error: "Failed to reset test data", details: String(error) },
      { status: 500 }
    )
  }
}
