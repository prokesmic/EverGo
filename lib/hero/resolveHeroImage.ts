/**
 * Hero Image Resolution - Single Source of Truth
 *
 * Resolves the hero image for any user/profile context.
 * Priority: Custom cover photo > Sport-specific image > Default fallback
 */

import { getSportHeroImage } from "@/lib/sports/media"
import { DEFAULT_HERO_BANNER } from "@/components/hero/HeroBanner"

export interface ResolveHeroImageParams {
  /** User's custom cover photo URL */
  coverPhotoUrl?: string | null
  /** Primary sport key/slug for sport-specific image */
  sportKey?: string | null
  /** Primary sport name (fallback for key) */
  sportName?: string | null
}

/**
 * Resolves the hero image URL based on priority:
 * 1. User's custom cover photo (if set)
 * 2. Sport-specific hero image (if sport is known)
 * 3. Default fallback banner
 *
 * @returns The hero image URL to use
 */
export function resolveHeroImage(params: ResolveHeroImageParams): string {
  const { coverPhotoUrl, sportKey, sportName } = params

  // Priority 1: Custom cover photo
  if (coverPhotoUrl && coverPhotoUrl.trim().length > 0) {
    return coverPhotoUrl
  }

  // Priority 2: Sport-specific image (use slug first, then name)
  const sportIdentifier = sportKey ?? sportName
  if (sportIdentifier) {
    const sportImage = getSportHeroImage(sportIdentifier)
    // getSportHeroImage returns the generic fallback if sport not found
    // We still return it as it's better than nothing
    return sportImage
  }

  // Priority 3: Default fallback
  return DEFAULT_HERO_BANNER
}

/**
 * Debug helper: shows which image source was used
 * Only for development debugging
 */
export function resolveHeroImageWithDebug(
  params: ResolveHeroImageParams
): { url: string; source: "cover" | "sport" | "fallback"; sportKey?: string } {
  const { coverPhotoUrl, sportKey, sportName } = params

  if (coverPhotoUrl && coverPhotoUrl.trim().length > 0) {
    return { url: coverPhotoUrl, source: "cover" }
  }

  const sportIdentifier = sportKey ?? sportName
  if (sportIdentifier) {
    return {
      url: getSportHeroImage(sportIdentifier),
      source: "sport",
      sportKey: sportIdentifier,
    }
  }

  return { url: DEFAULT_HERO_BANNER, source: "fallback" }
}
