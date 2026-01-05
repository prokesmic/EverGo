"use server"

import { onboardingSchema, type OnboardingData } from "@/schemas/onboarding"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Prefix for custom city IDs from the frontend
const CUSTOM_CITY_PREFIX = "custom:"

/**
 * Normalize a city name for storage
 */
function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
}

/**
 * Complete onboarding for the current user
 *
 * This action:
 * 1. Validates the onboarding data
 * 2. Creates custom city if needed
 * 3. Updates user profile + location + sports atomically
 * 4. Creates initial benchmark PB if provided
 * 5. Marks onboarding as complete
 * 6. Triggers sport index recalculation
 * 7. Redirects to home
 */
export async function completeOnboarding(rawInput: unknown) {
  // Get authenticated user
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Not authenticated")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Validate input
  const parseResult = onboardingSchema.safeParse(rawInput)
  if (!parseResult.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    }
  }

  const data = parseResult.data

  try {
    // Handle custom city creation before the main transaction
    let actualCityId = data.cityId
    let actualCityName = data.cityName

    if (data.cityId.startsWith(CUSTOM_CITY_PREFIX)) {
      // Extract the custom city name from the ID
      const customCityName = data.cityId.slice(CUSTOM_CITY_PREFIX.length)
      actualCityName = customCityName

      // Try to find an existing city with the same name in this country
      const existingCity = await prisma.city.findFirst({
        where: {
          countryCode: data.countryCode,
          OR: [
            { name: { equals: customCityName, mode: "insensitive" } },
            { normalized: normalizeCityName(customCityName) },
          ],
        },
      })

      if (existingCity) {
        // Use existing city
        actualCityId = existingCity.id
        actualCityName = existingCity.name
      } else {
        // Create new city
        const newCity = await prisma.city.create({
          data: {
            countryCode: data.countryCode,
            name: customCityName,
            normalized: normalizeCityName(customCityName),
            // Custom cities don't have lat/lon/population initially
          },
        })
        actualCityId = newCity.id
        actualCityName = newCity.name
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update user profile + location + primary sport
      await tx.user.update({
        where: { id: user.id },
        data: {
          displayName: data.displayName,
          bio: data.bio || null,
          gender: data.gender || null,

          // Normalized location
          countryCode: data.countryCode,
          countryName: data.countryName,
          cityId: actualCityId,
          cityName: actualCityName,

          // Legacy fields (for backwards compat)
          city: actualCityName,
          country: data.countryName,

          // Primary sport
          primarySportId: data.primarySportId,

          // Mark onboarding complete
          onboardingCompleted: true,
        },
      })

      // 2. Upsert user sports (idempotent - delete and recreate)
      await tx.userSport.deleteMany({ where: { userId: user.id } })

      const allSportIds = [data.primarySportId, ...data.otherSportIds].filter(
        (v, i, a) => a.indexOf(v) === i // dedupe
      )

      if (allSportIds.length > 0) {
        await tx.userSport.createMany({
          data: allSportIds.map((sportId, index) => ({
            userId: user.id,
            sportId,
            status: "ACTIVE",
            priority: sportId === data.primarySportId ? 0 : index, // 0 = primary
          })),
        })
      }

      // 3. Create initial benchmark PB if provided
      if (data.initialBenchmark?.benchmarkId) {
        const benchmark = await tx.benchmarkDefinition.findUnique({
          where: { id: data.initialBenchmark.benchmarkId },
          select: { id: true },
        })

        if (benchmark) {
          await tx.userBenchmarkBest.upsert({
            where: {
              userId_benchmarkId: {
                userId: user.id,
                benchmarkId: benchmark.id,
              },
            },
            create: {
              userId: user.id,
              benchmarkId: benchmark.id,
              value: data.initialBenchmark.value,
              achievedAt: data.initialBenchmark.occurredAt
                ? new Date(data.initialBenchmark.occurredAt)
                : new Date(),
              source: "MANUAL",
              verificationStatus: "UNVERIFIED",
              // Manual entry is eligible for local ranks but not global (per spec)
              isEligibleGlobal: false,
              isEligibleCountry: false, // Conservative: require verification
              isEligibleCity: true, // Allow city rank
              isEligibleTeam: true, // Allow team rank
              metadata: {
                rawInput: data.initialBenchmark.rawInput,
                unit: data.initialBenchmark.unit,
                source: "onboarding",
              },
            },
            update: {
              value: data.initialBenchmark.value,
              achievedAt: data.initialBenchmark.occurredAt
                ? new Date(data.initialBenchmark.occurredAt)
                : new Date(),
              source: "MANUAL",
              verificationStatus: "UNVERIFIED",
              isEligibleGlobal: false,
              isEligibleCountry: false,
              isEligibleCity: true,
              isEligibleTeam: true,
              metadata: {
                rawInput: data.initialBenchmark.rawInput,
                unit: data.initialBenchmark.unit,
                source: "onboarding",
              },
            },
          })
        }
      }

      // 4. Create/update UserStats if not exists
      await tx.userStats.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          sportIndex: data.initialBenchmark ? 100 : 0, // Give small boost for benchmark entry
          country: data.countryName,
          city: actualCityName,
        },
        update: {
          country: data.countryName,
          city: actualCityName,
        },
      })
    })

    // 5. Trigger sport index recalculation (async, don't wait)
    // TODO: Implement recalculateSportIndex(user.id)
    // For now, we set a basic score in the transaction above

    // 6. Log analytics event
    console.log("[Onboarding] Completed for user:", user.id, {
      primarySport: data.primarySportId,
      hasBenchmark: !!data.initialBenchmark,
      connectProvider: data.connectProvider,
    })

    // Revalidate paths
    revalidatePath("/home")
    revalidatePath("/onboarding")

    // Return success - client will update session and redirect
    return { ok: true }
  } catch (error) {
    console.error("[Onboarding] Error:", error)
    return {
      ok: false,
      error: "Failed to complete onboarding. Please try again.",
    }
  }
}

/**
 * Get initial data for onboarding (pre-fill from existing user data)
 */
export async function getOnboardingData() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      sports: {
        include: { sport: true },
        orderBy: { priority: "asc" },
      },
    },
  })

  if (!user) {
    return null
  }

  return {
    displayName: user.displayName,
    bio: user.bio || "",
    gender: user.gender || undefined,
    countryCode: user.countryCode || "",
    countryName: user.countryName || "",
    cityId: user.cityId || "",
    cityName: user.cityName || "",
    primarySportId: user.primarySportId || user.sports[0]?.sportId || "",
    otherSportIds: user.sports.slice(1).map((s) => s.sportId),
  }
}
