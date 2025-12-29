/**
 * Strava API Types
 */

export interface StravaAthlete {
  id: number
  username: string | null
  firstname: string
  lastname: string
  city: string | null
  state: string | null
  country: string | null
  sex: "M" | "F" | null
  profile: string // avatar URL
  profile_medium: string
}

export interface StravaTokenResponse {
  token_type: "Bearer"
  access_token: string
  refresh_token: string
  expires_at: number // Unix timestamp
  expires_in: number // seconds
  athlete?: StravaAthlete
}

export interface StravaActivity {
  id: number
  external_id: string | null
  upload_id: number | null
  athlete: { id: number }
  name: string
  description: string | null
  distance: number // meters
  moving_time: number // seconds
  elapsed_time: number // seconds
  total_elevation_gain: number // meters
  elev_high: number | null
  elev_low: number | null
  type: string // "Run", "Ride", "Swim", etc.
  sport_type: string // More specific: "TrailRun", "MountainBikeRide", etc.
  start_date: string // ISO 8601
  start_date_local: string
  timezone: string
  start_latlng: [number, number] | null
  end_latlng: [number, number] | null
  achievement_count: number
  pr_count: number
  average_speed: number // m/s
  max_speed: number // m/s
  average_cadence: number | null
  average_watts: number | null
  weighted_average_watts: number | null
  max_watts: number | null
  kilojoules: number | null
  average_heartrate: number | null
  max_heartrate: number | null
  calories: number | null
  suffer_score: number | null
  has_heartrate: boolean
  gear_id: string | null
  private: boolean
  visibility: "everyone" | "followers_only" | "only_me"
  manual: boolean
  commute: boolean
  trainer: boolean
  map: {
    id: string
    summary_polyline: string | null
    polyline: string | null
  } | null
  // Detailed activity fields (when fetching single activity)
  segment_efforts?: unknown[]
  splits_metric?: unknown[]
  laps?: unknown[]
  best_efforts?: unknown[]
}

export interface StravaWebhookPayload {
  object_type: "activity" | "athlete"
  object_id: number
  aspect_type: "create" | "update" | "delete"
  updates: Record<string, unknown> // For updates, contains changed fields
  owner_id: number // Athlete ID
  subscription_id: number
  event_time: number // Unix timestamp
}

export interface StravaWebhookValidation {
  "hub.mode": "subscribe"
  "hub.challenge": string
  "hub.verify_token": string
}

export interface StravaRateLimitInfo {
  shortTermLimit: number
  shortTermUsage: number
  dailyLimit: number
  dailyUsage: number
}

// Strava activity types mapped to our sports
export const STRAVA_ACTIVITY_TYPES = [
  "AlpineSki",
  "BackcountrySki",
  "Canoeing",
  "Crossfit",
  "EBikeRide",
  "Elliptical",
  "Golf",
  "GravelRide",
  "Handcycle",
  "Hike",
  "IceSkate",
  "InlineSkate",
  "Kayaking",
  "Kitesurf",
  "MountainBikeRide",
  "NordicSki",
  "Ride",
  "RockClimbing",
  "RollerSki",
  "Rowing",
  "Run",
  "Sail",
  "Skateboard",
  "Snowboard",
  "Snowshoe",
  "Soccer",
  "StairStepper",
  "StandUpPaddling",
  "Surfing",
  "Swim",
  "TrailRun",
  "Velomobile",
  "VirtualRide",
  "VirtualRun",
  "Walk",
  "WeightTraining",
  "Wheelchair",
  "Windsurf",
  "Workout",
  "Yoga",
] as const

export type StravaActivityType = typeof STRAVA_ACTIVITY_TYPES[number]
