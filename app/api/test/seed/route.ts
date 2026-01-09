import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isValidE2ERequest } from "@/lib/env"
import bcrypt from "bcryptjs"

/**
 * E2E Test API - Seed Test Data
 *
 * POST /api/test/seed - Seed test data for a specific scenario
 *
 * Security: Requires E2E_ENABLED=true and valid E2E_TEST_SECRET
 *
 * Scenarios:
 * - "user_with_activities" - User with some activity data
 * - "user_with_team" - User in a team with challenges
 * - "user_with_benchmarks" - User with benchmark PBs
 * - "full_user" - User with activities, teams, benchmarks
 */

type SeedScenario =
  | "user_with_activities"
  | "user_with_team"
  | "user_with_benchmarks"
  | "full_user"
  | "minimal_user"

function getSecretFromRequest(req: NextRequest): string | null {
  return req.headers.get("x-e2e-secret") || null
}

async function createTestUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      username: email.split("@")[0].replace(/[^a-z0-9]/gi, "") + "_e2e",
      displayName: "E2E Test User",
      privacyLevel: "PUBLIC",
    },
  })
}

async function seedActivities(userId: string, sportId: string | null) {
  // Get a sport if not provided
  let sport = sportId
    ? await prisma.sport.findUnique({ where: { id: sportId } })
    : await prisma.sport.findFirst()

  if (!sport) {
    // Create a default sport if none exists
    sport = await prisma.sport.create({
      data: {
        slug: "running",
        name: "Running",
        icon: "running",
        category: "ENDURANCE",
      },
    })
  }

  // Create 5 test activities over the past month
  const activities = []
  for (let i = 0; i < 5; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i * 7)

    // Get or create a discipline for the sport
    let discipline = await prisma.discipline.findFirst({
      where: { sportId: sport.id },
    })
    if (!discipline) {
      discipline = await prisma.discipline.create({
        data: {
          sportId: sport.id,
          name: "General",
          slug: "general",
          measurementType: "TIME",
          primaryMetric: "duration",
          rankingFormula: "time",
          lowerIsBetter: true,
        },
      })
    }

    activities.push(
      prisma.activity.create({
        data: {
          userId,
          sportId: sport.id,
          disciplineId: discipline.id,
          title: `E2E Test Activity ${i + 1}`,
          activityDate: date,
          durationSeconds: 1800 + i * 300, // 30-50 min
          distanceMeters: 5000 + i * 1000, // 5-9 km
          primaryValue: 1800 + i * 300,
          photos: "[]",
        },
      })
    )
  }

  return Promise.all(activities)
}

async function seedTeamMembership(userId: string) {
  // Get a sport for the team
  const sport = await prisma.sport.findFirst()
  if (!sport) {
    throw new Error("No sport found - seed sports first")
  }

  // Create or get a test team
  let team = await prisma.team.findFirst({
    where: { slug: "e2e-test-team" },
  })

  if (!team) {
    team = await prisma.team.create({
      data: {
        slug: "e2e-test-team",
        name: "E2E Test Team",
        description: "A team for E2E testing",
        isPublic: true,
        sportId: sport.id,
      },
    })

    // Add the creating user as owner
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: "OWNER",
      },
    })
  } else {
    // Add user as team member if not already
    await prisma.teamMember.upsert({
      where: {
        teamId_userId: { teamId: team.id, userId },
      },
      update: {},
      create: {
        teamId: team.id,
        userId,
        role: "MEMBER",
      },
    })
  }

  return team
}

async function seedBenchmarkPBs(_userId: string, _sportId: string | null) {
  // Benchmarks removed in V6
  return []
}

async function seedUserSport(userId: string) {
  // Get a sport
  const sport = await prisma.sport.findFirst()
  if (!sport) return null

  // Add as user's primary sport
  return prisma.userSport.upsert({
    where: {
      userId_sportId: { userId, sportId: sport.id },
    },
    update: {},
    create: {
      userId,
      sportId: sport.id,
      priority: 0,
      status: "ACTIVE",
    },
  })
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
    const { scenario, email, password, sportId } = body as {
      scenario: SeedScenario
      email: string
      password: string
      sportId?: string
    }

    if (!scenario || !email || !password) {
      return NextResponse.json(
        { error: "scenario, email, and password are required" },
        { status: 400 }
      )
    }

    // Create or get user
    const user = await createTestUser(email, password)

    // Add primary sport
    await seedUserSport(user.id)

    const result: Record<string, unknown> = {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    }

    switch (scenario) {
      case "minimal_user":
        // Just the user, no additional data
        break

      case "user_with_activities":
        result.activities = await seedActivities(user.id, sportId || null)
        break

      case "user_with_team":
        result.team = await seedTeamMembership(user.id)
        break

      case "user_with_benchmarks":
        result.pbs = await seedBenchmarkPBs(user.id, sportId || null)
        break

      case "full_user":
        result.activities = await seedActivities(user.id, sportId || null)
        result.team = await seedTeamMembership(user.id)
        result.pbs = await seedBenchmarkPBs(user.id, sportId || null)
        break

      default:
        return NextResponse.json(
          { error: `Unknown scenario: ${scenario}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      scenario,
      ...result,
    })
  } catch (error) {
    console.error("E2E seed failed:", error)
    return NextResponse.json(
      { error: "Failed to seed test data", details: String(error) },
      { status: 500 }
    )
  }
}
