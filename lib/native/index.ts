/**
 * Native Shell Integration
 *
 * Capacitor wrapper for iOS/Android native features.
 * This module provides stubs and integrations for native capabilities.
 */

import { isFlagEnabled } from "@/lib/flags"

/**
 * Check if running in native shell
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false
  // @ts-ignore -- Capacitor dynamically adds this property to window at runtime
  return typeof window.Capacitor !== "undefined"
}

/**
 * Get device platform
 */
export function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web"
  // @ts-ignore -- Capacitor dynamically adds getPlatform method at runtime
  if (window.Capacitor?.getPlatform) {
    // @ts-ignore -- Capacitor getPlatform returns ios, android, or web
    return window.Capacitor.getPlatform()
  }
  return "web"
}

/**
 * Check if a native plugin is available
 */
export function isPluginAvailable(pluginName: string): boolean {
  if (!isNativeApp()) return false
  // @ts-ignore -- Capacitor dynamically registers plugins at runtime
  return typeof window.Capacitor?.Plugins?.[pluginName] !== "undefined"
}

// =============================================================================
// Apple Health Integration Stubs
// =============================================================================

export interface HealthKitDataPoint {
  type: string
  value: number
  unit: string
  startDate: Date
  endDate: Date
  sourceName: string
}

export interface HealthKitWorkout {
  id: string
  workoutType: string
  startDate: Date
  endDate: Date
  duration: number
  totalDistance: number | null
  totalEnergyBurned: number | null
  sourceName: string
}

/**
 * Request HealthKit authorization
 */
export async function requestHealthKitPermissions(): Promise<boolean> {
  if (!isFlagEnabled("enableAppleHealth")) {
    console.log("[HealthKit] Feature flag disabled")
    return false
  }

  if (getPlatform() !== "ios") {
    console.log("[HealthKit] Not on iOS")
    return false
  }

  // TODO: Implement with @capacitor/health-kit plugin
  // const HealthKit = await import('@capacitor-community/health-kit');
  // return HealthKit.requestAuthorization({ ... });

  console.log("[HealthKit] Stub: Would request permissions")
  return false
}

/**
 * Get recent workouts from HealthKit
 */
export async function getHealthKitWorkouts(
  daysBack: number = 30
): Promise<HealthKitWorkout[]> {
  if (!isFlagEnabled("enableAppleHealth")) {
    return []
  }

  if (getPlatform() !== "ios") {
    return []
  }

  // TODO: Implement with @capacitor/health-kit plugin
  console.log("[HealthKit] Stub: Would fetch workouts")
  return []
}

/**
 * Check if HealthKit is connected
 */
export async function isHealthKitConnected(): Promise<boolean> {
  if (!isFlagEnabled("enableAppleHealth")) {
    return false
  }

  if (getPlatform() !== "ios") {
    return false
  }

  // TODO: Check authorization status
  return false
}

// =============================================================================
// Garmin Health Integration Stubs
// =============================================================================

export interface GarminActivity {
  activityId: string
  activityType: string
  startTime: Date
  duration: number
  distance: number | null
  calories: number | null
  averageHeartRate: number | null
  maxHeartRate: number | null
}

/**
 * Initiate Garmin OAuth flow
 */
export async function initiateGarminConnect(): Promise<string | null> {
  if (!isFlagEnabled("enableGarminHealth")) {
    console.log("[Garmin] Feature flag disabled")
    return null
  }

  // TODO: Implement OAuth flow
  // This would typically redirect to Garmin's OAuth page
  // and handle the callback to store tokens

  console.log("[Garmin] Stub: Would initiate OAuth")
  return null
}

/**
 * Get recent activities from Garmin
 */
export async function getGarminActivities(
  daysBack: number = 30
): Promise<GarminActivity[]> {
  if (!isFlagEnabled("enableGarminHealth")) {
    return []
  }

  // TODO: Implement Garmin API fetch
  console.log("[Garmin] Stub: Would fetch activities")
  return []
}

/**
 * Check if Garmin is connected
 */
export async function isGarminConnected(): Promise<boolean> {
  if (!isFlagEnabled("enableGarminHealth")) {
    return false
  }

  // TODO: Check for valid tokens
  return false
}

// =============================================================================
// Native Features
// =============================================================================

/**
 * Request push notification permissions
 */
export async function requestPushPermissions(): Promise<boolean> {
  if (!isNativeApp()) {
    return false
  }

  // TODO: Implement with @capacitor/push-notifications
  console.log("[Native] Stub: Would request push permissions")
  return false
}

/**
 * Get push notification token
 */
export async function getPushToken(): Promise<string | null> {
  if (!isNativeApp()) {
    return null
  }

  // TODO: Implement
  return null
}

/**
 * Trigger haptic feedback
 */
export async function hapticFeedback(
  type: "light" | "medium" | "heavy" | "success" | "warning" | "error"
): Promise<void> {
  if (!isNativeApp()) {
    return
  }

  // TODO: Implement with @capacitor/haptics
  console.log(`[Native] Haptic: ${type}`)
}

/**
 * Share content
 */
export async function shareContent(params: {
  title: string
  text: string
  url?: string
}): Promise<boolean> {
  if (!isNativeApp()) {
    // Fallback to Web Share API
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(params)
        return true
      } catch {
        return false
      }
    }
    return false
  }

  // TODO: Implement with @capacitor/share
  console.log("[Native] Share:", params)
  return false
}

/**
 * Open app settings
 */
export async function openAppSettings(): Promise<void> {
  if (!isNativeApp()) {
    return
  }

  // TODO: Implement
  console.log("[Native] Opening app settings")
}

/**
 * Check for app updates
 */
export async function checkForAppUpdate(): Promise<{
  available: boolean
  version?: string
}> {
  if (!isNativeApp()) {
    return { available: false }
  }

  // TODO: Implement with app store APIs
  return { available: false }
}

// =============================================================================
// Health Data Sync
// =============================================================================

export interface HealthSyncResult {
  workoutsImported: number
  newActivities: string[]
  errors: string[]
}

/**
 * Sync health data from connected sources
 */
export async function syncHealthData(): Promise<HealthSyncResult> {
  const result: HealthSyncResult = {
    workoutsImported: 0,
    newActivities: [],
    errors: [],
  }

  // Try HealthKit
  if (isFlagEnabled("enableAppleHealth") && (await isHealthKitConnected())) {
    try {
      const workouts = await getHealthKitWorkouts(7)
      // TODO: Process and import workouts
      result.workoutsImported += workouts.length
    } catch (err) {
      result.errors.push(`HealthKit sync failed: ${err}`)
    }
  }

  // Try Garmin
  if (isFlagEnabled("enableGarminHealth") && (await isGarminConnected())) {
    try {
      const activities = await getGarminActivities(7)
      // TODO: Process and import activities
      result.workoutsImported += activities.length
    } catch (err) {
      result.errors.push(`Garmin sync failed: ${err}`)
    }
  }

  return result
}
