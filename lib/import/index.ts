/**
 * Universal Import Engine
 *
 * Handles parsing of .fit, .gpx, and .tcx activity files.
 */

import { parseGpx } from "./parsers/gpx"
import { parseTcx } from "./parsers/tcx"
import { parseFit } from "./parsers/fit"
import type { ActivityNormalized, ImportResult, SupportedFileType } from "./types"

export * from "./types"
export * from "./parsers"

/**
 * Parse an activity file based on its type
 */
export function parseActivityFile(
  content: string | Buffer,
  fileType: SupportedFileType
): ActivityNormalized {
  switch (fileType) {
    case "gpx":
      if (typeof content !== "string") {
        content = content.toString("utf-8")
      }
      return parseGpx(content)

    case "tcx":
      if (typeof content !== "string") {
        content = content.toString("utf-8")
      }
      return parseTcx(content)

    case "fit":
      if (typeof content === "string") {
        throw new Error("FIT files must be provided as Buffer, not string")
      }
      return parseFit(content)

    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

/**
 * Detect file type from filename
 */
export function detectFileType(filename: string): SupportedFileType | null {
  const ext = filename.toLowerCase().split(".").pop()
  if (ext === "gpx" || ext === "tcx" || ext === "fit") {
    return ext as SupportedFileType
  }
  return null
}

/**
 * Validate file size (max 50MB)
 */
export function validateFileSize(size: number): boolean {
  const MAX_SIZE = 50 * 1024 * 1024 // 50MB
  return size <= MAX_SIZE
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${Math.round(meters)} m`
}

/**
 * Format pace for display (min:sec per km)
 */
export function formatPace(secPerKm: number): string {
  if (!secPerKm || secPerKm <= 0) return "--:--"
  const minutes = Math.floor(secPerKm / 60)
  const seconds = Math.floor(secPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")} /km`
}

/**
 * Generate activity title from parsed data
 */
export function generateActivityTitle(data: ActivityNormalized): string {
  if (data.title) return data.title

  const sportNames: Record<string, string> = {
    running: "Run",
    cycling: "Ride",
    swimming: "Swim",
    walking: "Walk",
    hiking: "Hike",
    rowing: "Row",
  }

  const sportName = sportNames[data.sportSlugGuess] || "Workout"
  const time = data.startAt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const isPM = time.includes("PM")

  // Generate time-based prefix
  const hour = data.startAt.getHours()
  let timeOfDay = "Morning"
  if (hour >= 12 && hour < 17) timeOfDay = "Afternoon"
  else if (hour >= 17 && hour < 21) timeOfDay = "Evening"
  else if (hour >= 21 || hour < 5) timeOfDay = "Night"

  return `${timeOfDay} ${sportName}`
}
