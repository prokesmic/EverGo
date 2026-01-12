/**
 * Hero Image Resolution - Single Source of Truth
 *
 * Resolves the hero image for any user/profile context.
 * Priority: Custom cover photo > Sport-specific image > Default fallback
 *
 * KEY LOGIC: Detects known system images (sport-specific or placeholder) and
 * treats them as "no custom cover" so the current sport's image can be used.
 */

import { getSportHeroImage } from "@/lib/sports/media"

// Known system banner URLs that should be treated as "no custom cover set"
// If a user's coverPhotoUrl matches any of these Unsplash image IDs, use current sport image instead
// This allows hero image to change when user switches primary sport
const SYSTEM_BANNER_IMAGE_IDS = [
  // Generic fallback
  "photo-1571019614242-c5c5dee9f50b",

  // Water Sports
  "photo-1559339352-11d035aa65de", // kitesurfing
  "photo-1502680390469-be75c86b636f", // surfing
  "photo-1530549387789-4c1017266635", // swimming
  "photo-1526188717906-ab4a2f949f0d", // SUP
  "photo-1544551763-46a013bb70d5", // kayaking
  "photo-1500930287596-c1ecaa373bb2", // sailing
  "photo-1568430462989-44163eb1752f", // windsurfing

  // Endurance
  "photo-1552674605-db6ffd4facb5", // running / triathlon
  "photo-1551632811-561732d1e306", // trail running / hiking
  "photo-1541625602330-2277a4c46182", // cycling
  "photo-1544191696-102dbdaeeaa0", // mountain biking

  // Outdoor
  "photo-1522163182402-834f871fd851", // climbing
  "photo-1564769662533-4f00a87b4056", // bouldering

  // Winter Sports
  "photo-1551698618-1dfe5d97d256", // skiing
  "photo-1478700823809-50c28f8e2c7b", // snowboarding

  // Racket Sports
  "photo-1554068865-24cecd4e34b8", // tennis / padel
  "photo-1626224583764-f87db24ac4ea", // badminton

  // Team Sports
  "photo-1579952363873-27f3bade9f55", // football / soccer
  "photo-1546519638-68e109498ffc", // basketball
  "photo-1612872087720-bb876e2e67d1", // volleyball

  // Strength & Fitness
  "photo-1534438327276-14e5300c3a48", // gym / strength
  "photo-1517963879433-6ad2b056d712", // weightlifting
  "photo-1526506118085-60ce8714f8c5", // crossfit / calisthenics

  // Mind & Body
  "photo-1544367567-0f2fcb009e0b", // yoga
  "photo-1518611012118-696072aa579a", // pilates

  // Combat
  "photo-1549719386-74dfcbf7dbed", // boxing / mma

  // Other
  "photo-1535131749006-b7f58c99034b", // golf
  "photo-1564982752979-3f7bc974d29a", // skateboarding
  "photo-1518834107812-67b0b7c58434", // dance
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
 * Checks if a URL is a known system image (not a custom user upload)
 */
function isSystemBanner(url: string): boolean {
  return SYSTEM_BANNER_IMAGE_IDS.some((imageId) => url.includes(imageId))
}

/**
 * Resolves the hero image URL based on priority:
 * 1. User's custom cover photo (if set AND not a system image)
 * 2. Sport-specific hero image (if sport is known)
 * 3. Default generic fallback
 *
 * @returns The hero image URL to use
 */
export function resolveHeroImage(params: ResolveHeroImageParams): string {
  const { bannerUrl, sportKey, sportName } = params

  // Check if bannerUrl is empty or a known system image (not custom upload)
  const isEmpty = !bannerUrl || bannerUrl.trim() === ""
  const isSystem = bannerUrl ? isSystemBanner(bannerUrl) : false

  // Priority 1: Custom cover photo (only if real custom upload, not system image)
  if (!isEmpty && !isSystem) {
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
