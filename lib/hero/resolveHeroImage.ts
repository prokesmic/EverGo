/**
 * Hero Image Resolution - Single Source of Truth
 *
 * Resolves the hero image for any user/profile context.
 * Priority: Custom cover photo > Sport-specific image > Default fallback
 *
 * KEY LOGIC: Detects known placeholder images and treats them as "no cover"
 * so sport-specific images can win.
 */

import { getSportHeroImage } from "@/lib/sports/media"

// Known placeholder/default banner URLs that should be treated as "no cover set"
// If a user's coverPhotoUrl matches any of these, use sport image instead
const PLACEHOLDER_BANNER_PATTERNS = [
  // The default generic fitness image used as fallback
  "photo-1571019614242-c5c5dee9f50b",
  // Add any other known placeholder image IDs here
]

export interface ResolveHeroImageParams {
  /** User's custom cover photo URL from DB */
  bannerUrl?: string | null
  /** Primary sport key/slug for sport-specific image */
  sportKey?: string | null
  /** Primary sport name (fallback for key) */
  sportName?: string | null
}

/**
 * Checks if a URL is a known placeholder that should be ignored
 */
function isPlaceholderBanner(url: string): boolean {
  return PLACEHOLDER_BANNER_PATTERNS.some((pattern) => url.includes(pattern))
}

/**
 * Resolves the hero image URL based on priority:
 * 1. User's custom cover photo (if set AND not a placeholder)
 * 2. Sport-specific hero image (if sport is known)
 * 3. Default generic fallback
 *
 * @returns The hero image URL to use
 */
export function resolveHeroImage(params: ResolveHeroImageParams): string {
  const { bannerUrl, sportKey, sportName } = params

  // Check if bannerUrl is empty or a known placeholder
  const isEmpty = !bannerUrl || bannerUrl.trim() === ""
  const isPlaceholder = bannerUrl ? isPlaceholderBanner(bannerUrl) : false

  // Priority 1: Custom cover photo (only if real, not placeholder)
  if (!isEmpty && !isPlaceholder) {
    return bannerUrl
  }

  // Priority 2: Sport-specific image
  const sportIdentifier = sportKey ?? sportName
  if (sportIdentifier) {
    return getSportHeroImage(sportIdentifier)
  }

  // Priority 3: Generic fallback (from getSportHeroImage with null)
  return getSportHeroImage(null)
}
