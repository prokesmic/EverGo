/**
 * Profile URL Utilities
 *
 * Privacy-safe profile URL generation.
 * NEVER expose user IDs or emails in public URLs.
 *
 * Pattern:
 * - /profile/me → redirects to /profile/{username} (server-side)
 * - /profile/{username} → public profile
 * - No /profile/{id} or /profile/{email} in links
 */

export interface ProfileUser {
  id: string
  username: string | null
}

/**
 * Get safe profile URL for a user
 * Returns null if user has no username (privacy protection)
 */
export function getProfileUrl(user: ProfileUser): string | null {
  if (!user.username) {
    // User has no username - cannot generate public profile URL
    return null
  }
  return `/profile/${user.username}`
}

/**
 * Get profile URL with fallback to /profile/me for current user
 * Use this when you know you're linking to your own profile
 */
export function getMyProfileUrl(): string {
  return '/profile/me'
}

/**
 * Check if a URL path looks like it contains sensitive data
 * (for audit/linting purposes)
 */
export function isPrivacySafeProfileUrl(url: string): boolean {
  // Pattern: /profile/{something}
  const match = url.match(/\/profile\/([^/?]+)/)
  if (!match) return true // Not a profile URL

  const identifier = match[1]

  // "me" is safe
  if (identifier === 'me') return true

  // Email pattern is NOT safe
  if (identifier.includes('@')) return false

  // CUID pattern (25+ chars with letters and numbers) suggests ID - NOT safe
  // CUIDs look like: clq1234abcd5678efgh9012ijk
  if (/^c[a-z0-9]{24,}$/i.test(identifier)) return false

  // UUID pattern is NOT safe
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)) return false

  // Looks like a username (alphanumeric with underscores/dashes, reasonable length)
  return true
}
