"use server"

/**
 * Import Activity File Server Action
 *
 * Handles .fit/.gpx/.tcx file uploads and creates verified activities.
 */

import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  parseActivityFile,
  detectFileType,
  validateFileSize,
  generateActivityTitle,
  type ActivityNormalized,
  type ImportResult,
} from "@/lib/import"
import { isFlagEnabled } from "@/lib/flags"
import { updateGauntletScores } from "@/lib/gauntlet"
import { updateSeasonScore } from "@/lib/season"
import { updateCrewWarScores } from "@/lib/crew-wars"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface ImportActivityInput {
  filename: string
  content: string // Base64 encoded
  sportId?: string
}

export async function importActivityFile(
  input: ImportActivityInput
): Promise<ImportResult> {
  // Check feature flag
  if (!isFlagEnabled("enableFileUploadImport")) {
    return {
      success: false,
      error: "File import is currently disabled",
    }
  }

  // Get authenticated user
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return {
      success: false,
      error: "Not authenticated",
    }
  }

  const userId = session.user.id

  try {
    // Detect file type
    const fileType = detectFileType(input.filename)
    if (!fileType) {
      return {
        success: false,
        error: `Unsupported file type. Only .fit, .gpx, and .tcx files are supported.`,
      }
    }

    // Decode base64 content
    const buffer = Buffer.from(input.content, "base64")

    // Validate file size
    if (!validateFileSize(buffer.length)) {
      return {
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      }
    }

    // Create import record
    const importRecord = await prisma.activityImport.create({
      data: {
        userId,
        source: "FILE_UPLOAD",
        fileType: fileType.toUpperCase() as "FIT" | "GPX" | "TCX",
        originalFilename: input.filename,
        storageKey: `${userId}/${Date.now()}-${input.filename}`,
        status: "PARSING",
      },
    })

    // Parse the file
    let normalized: ActivityNormalized
    try {
      normalized = parseActivityFile(buffer, fileType)
    } catch (parseError) {
      // Update import record with error
      await prisma.activityImport.update({
        where: { id: importRecord.id },
        data: {
          status: "FAILED",
          errorText:
            parseError instanceof Error ? parseError.message : "Parse error",
        },
      })

      return {
        success: false,
        error: `Failed to parse ${fileType.toUpperCase()} file: ${
          parseError instanceof Error ? parseError.message : "Unknown error"
        }`,
        importId: importRecord.id,
      }
    }

    // Determine sport
    let sportId = input.sportId
    if (!sportId) {
      // Try to find sport by slug
      const sport = await prisma.sport.findFirst({
        where: { slug: normalized.sportSlugGuess },
      })
      sportId = sport?.id

      // Fallback to user's primary sport
      if (!sportId) {
        const userSport = await prisma.userSport.findFirst({
          where: { userId, status: "ACTIVE" },
          orderBy: { priority: "asc" },
        })
        sportId = userSport?.sportId
      }
    }

    if (!sportId) {
      return {
        success: false,
        error: "Could not determine sport for this activity",
        importId: importRecord.id,
      }
    }

    // Find a discipline for this sport (default to first active one)
    const discipline = await prisma.discipline.findFirst({
      where: { sportId, isActive: true },
      orderBy: { displayOrder: "asc" },
    })

    if (!discipline) {
      return {
        success: false,
        error: "No discipline found for this sport",
        importId: importRecord.id,
      }
    }

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        userId,
        disciplineId: discipline.id,
        sportId,
        title: generateActivityTitle(normalized),
        activityDate: normalized.startAt,
        durationSeconds: normalized.durationSec,
        distanceMeters: normalized.distanceM,
        elevationGain: normalized.elevGainM,
        avgHeartRate: normalized.avgHr,
        maxHeartRate: normalized.maxHr,
        avgPace: normalized.avgPace,
        avgSpeed: normalized.avgSpeed,
        primaryValue: normalized.durationSec, // Use duration as primary value
        caloriesBurned: normalized.calories,
        gpsRoute: normalized.hasGps
          ? JSON.stringify(
              normalized.gpsPoints.slice(0, 1000).map((p) => ({
                lat: p.lat,
                lon: p.lon,
                ele: p.elevation,
              }))
            )
          : null,
        photos: "[]",
        source: "FILE_UPLOAD",
        externalId: importRecord.id,
        verificationTier: "GOLD", // File uploads are verified
        powerPoints: calculatePowerPoints(normalized),
      },
    })

    // Update import record
    await prisma.activityImport.update({
      where: { id: importRecord.id },
      data: {
        status: "PARSED",
        activityId: activity.id,
        parsedSummary: {
          distance: normalized.distanceM,
          duration: normalized.durationSec,
          elevGain: normalized.elevGainM,
          avgHr: normalized.avgHr,
          powerAvg: normalized.avgPowerW,
          sportGuess: normalized.sportSlugGuess,
          gpsPointsCount: normalized.gpsPointsCount,
          hasGps: normalized.hasGps,
          hasHr: normalized.hasHr,
          hasPower: normalized.hasPower,
        },
      },
    })

    // Update user stats
    await updateUserStatsAfterImport(userId, normalized)

    // Update gauntlet, season, and crew war scores
    try {
      const powerPoints = calculatePowerPoints(normalized)
      if (powerPoints > 0) {
        await Promise.all([
          updateGauntletScores(userId, powerPoints),
          updateSeasonScore(userId, powerPoints),
          updateCrewWarScores(userId, powerPoints),
        ])
      }
    } catch (e) {
      console.error("[importActivityFile] competition scores update failed", e)
    }

    return {
      success: true,
      activityId: activity.id,
      importId: importRecord.id,
      normalized,
    }
  } catch (error) {
    console.error("Import error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Import failed",
    }
  }
}

/**
 * Calculate power points from activity data
 */
function calculatePowerPoints(data: ActivityNormalized): number {
  // Base power from duration (1 point per minute)
  let points = Math.round(data.durationSec / 60)

  // Bonus for distance
  if (data.distanceM > 0) {
    points += Math.round(data.distanceM / 1000) * 10
  }

  // Bonus for elevation
  if (data.elevGainM > 0) {
    points += Math.round(data.elevGainM / 100) * 5
  }

  // Bonus for heart rate (indicates effort)
  if (data.avgHr && data.avgHr > 120) {
    points += Math.round((data.avgHr - 120) / 10) * 2
  }

  // Bonus for power data
  if (data.avgPowerW && data.avgPowerW > 100) {
    points += Math.round(data.avgPowerW / 50) * 3
  }

  return Math.min(points, 1000) // Cap at 1000
}

/**
 * Update user stats after importing an activity
 */
async function updateUserStatsAfterImport(
  userId: string,
  data: ActivityNormalized
): Promise<void> {
  // Get or create user stats
  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      totalDistance: data.distanceM / 1000,
      totalDuration: data.durationSec,
      totalActivities: 1,
      totalCalories: data.calories || 0,
    },
    update: {
      totalDistance: { increment: data.distanceM / 1000 },
      totalDuration: { increment: data.durationSec },
      totalActivities: { increment: 1 },
      totalCalories: { increment: data.calories || 0 },
    },
  })

  // Update verified activity count for Verified Athlete status
  // Count verified activities in last 60 days
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  const verifiedCount = await prisma.activity.count({
    where: {
      userId,
      activityDate: { gte: sixtyDaysAgo },
      source: { not: "MANUAL" },
    },
  })

  // Benchmark PB check removed in V6
  // Update verified athlete status (based on activity count only)
  const isVerified = verifiedCount >= 5

  await prisma.userStats.update({
    where: { userId },
    data: {
      verifiedActivityCount: verifiedCount,
      isVerifiedAthlete: isVerified,
      verifiedSince: isVerified && !stats.verifiedSince ? new Date() : undefined,
      lastVerificationCheck: new Date(),
    },
  })
}
