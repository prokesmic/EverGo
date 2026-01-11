/**
 * User Route Helpers
 *
 * Centralized URL generation for user-related routes.
 * Ensures consistent profile URLs across the app.
 */

interface ProfileUser {
  username?: string | null
  id?: string | null
  email?: string | null
}

/**
 * Get the profile URL for the current user.
 * Priority: username > 'me' fallback
 *
 * @example
 * getMyProfileHref({ username: "john" }) // => "/profile/john"
 * getMyProfileHref({ username: null }) // => "/profile/me"
 */
export function getMyProfileHref(user: ProfileUser | null | undefined): string {
  if (!user) return "/profile/me"
  if (user.username) return `/profile/${user.username}`
  // Fallback to /profile/me which will redirect to username-based URL
  return "/profile/me"
}

/**
 * Get the profile URL for any user (not necessarily current user).
 * For viewing other users' profiles.
 */
export function getProfileHref(user: ProfileUser | null | undefined): string {
  if (!user) return "/profile/me"
  if (user.username) return `/profile/${user.username}`
  if (user.id) return `/profile/${user.id}`
  return "/profile/me"
}

/**
 * Settings routes
 */
export const SETTINGS_ROUTES = {
  profile: "/settings/profile",
  notifications: "/notifications/settings",
} as const

/**
 * Get the default settings page
 */
export function getSettingsHref(): string {
  return SETTINGS_ROUTES.profile
}
