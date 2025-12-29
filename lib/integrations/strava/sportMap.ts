/**
 * Strava Activity Type to EverGo Sport Mapping
 */
import type { StravaActivityType } from "./types"

// Map Strava activity types to EverGo sport slugs
// These slugs must match your Sport.slug values in the database
const STRAVA_TO_EVERGO_SPORT: Record<string, string> = {
  // Running
  Run: "running",
  TrailRun: "trail-running",
  VirtualRun: "running",

  // Cycling
  Ride: "cycling",
  MountainBikeRide: "mountain-biking",
  GravelRide: "gravel-cycling",
  EBikeRide: "e-biking",
  VirtualRide: "cycling",
  Handcycle: "cycling",
  Velomobile: "cycling",

  // Swimming
  Swim: "swimming",

  // Winter sports
  AlpineSki: "skiing",
  BackcountrySki: "backcountry-skiing",
  NordicSki: "cross-country-skiing",
  Snowboard: "snowboarding",
  Snowshoe: "snowshoeing",
  IceSkate: "ice-skating",
  RollerSki: "roller-skiing",

  // Water sports
  Rowing: "rowing",
  Kayaking: "kayaking",
  Canoeing: "canoeing",
  Sail: "sailing",
  StandUpPaddling: "stand-up-paddling",
  Surfing: "surfing",
  Kitesurf: "kitesurfing",
  Windsurf: "windsurfing",

  // Walking/Hiking
  Walk: "walking",
  Hike: "hiking",

  // Gym/Fitness
  WeightTraining: "weight-training",
  Crossfit: "crossfit",
  Elliptical: "elliptical",
  StairStepper: "stair-climbing",
  Workout: "fitness",
  Yoga: "yoga",

  // Other sports
  Golf: "golf",
  RockClimbing: "climbing",
  Soccer: "soccer",
  InlineSkate: "inline-skating",
  Skateboard: "skateboarding",
  Wheelchair: "wheelchair-racing",
}

// Default sport for unmapped activities
const DEFAULT_SPORT = "fitness"

/**
 * Map a Strava activity type to an EverGo sport slug
 */
export function mapStravaTypeToSport(stravaType: string, sportType?: string): string {
  // First try the more specific sport_type
  if (sportType && STRAVA_TO_EVERGO_SPORT[sportType]) {
    return STRAVA_TO_EVERGO_SPORT[sportType]
  }

  // Fall back to the general type
  if (STRAVA_TO_EVERGO_SPORT[stravaType]) {
    return STRAVA_TO_EVERGO_SPORT[stravaType]
  }

  console.warn(`[Strava] Unknown activity type: ${stravaType} / ${sportType}, using default: ${DEFAULT_SPORT}`)
  return DEFAULT_SPORT
}

/**
 * Check if we support a Strava activity type
 */
export function isSupportedStravaType(stravaType: string): boolean {
  return stravaType in STRAVA_TO_EVERGO_SPORT
}

/**
 * Get all supported Strava types for a given EverGo sport
 */
export function getStravaTypesForSport(sportSlug: string): string[] {
  return Object.entries(STRAVA_TO_EVERGO_SPORT)
    .filter(([, slug]) => slug === sportSlug)
    .map(([stravaType]) => stravaType)
}

// Strava visibility to EverGo visibility mapping
export function mapStravaVisibility(stravaVisibility: string): "PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE" {
  switch (stravaVisibility) {
    case "everyone":
      return "PUBLIC"
    case "followers_only":
      return "FOLLOWERS_ONLY"
    case "only_me":
      return "PRIVATE"
    default:
      return "PUBLIC"
  }
}
