import {
  CATEGORY_HERO_IMAGES,
  HERO_BUCKET,
  SPORT_HERO_OVERRIDES,
  HeroCategory,
  HeroImage,
} from "./heroCatalog"

export type SportLike = { id: string; name: string }

export type ResolvedHero = {
  sportName: string
  sportSlug: string
  category: HeroCategory
  image: HeroImage
  imageUrl: string
  // Debug info (for development)
  debug?: {
    usedSupabase: boolean
    usedSportFallback: boolean
    usedCategoryFallback: boolean
    supabaseUrl: string | null
  }
}

export function sportToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function inferHeroCategoryFromSportName(name: string): HeroCategory {
  const n = name.toLowerCase()

  // Water sports
  if (
    /(swim|open water|surf|kite|windsurf|sup|paddle|kayak|canoe|sail|rowing|wake|diving)/.test(
      n
    )
  )
    return "water"

  // Winter sports
  if (
    /(ski|snowboard|ice|skating|biathlon|cross-country ski|xc ski|snow)/.test(n)
  )
    return "winter"

  // Racket sports
  if (
    /(tennis|padel|badminton|squash|pickleball|table tennis|ping pong)/.test(n)
  )
    return "racket"

  // Team sports
  if (
    /(football|soccer|basketball|volleyball|handball|hockey|lacrosse|rugby|baseball|softball|cricket)/.test(
      n
    )
  )
    return "team"

  // Combat sports
  if (
    /(boxing|mma|martial|judo|karate|taekwondo|muay|bjj|jiu-jitsu|wrestling)/.test(
      n
    )
  )
    return "combat"

  // Strength training
  if (
    /(gym|strength|weights|weightlifting|powerlifting|crossfit|hiit|functional|calisthenics)/.test(
      n
    )
  )
    return "strength"

  // Mind & body
  if (/(yoga|pilates|mobility|stretch|breath|meditation)/.test(n))
    return "mindbody"

  // Endurance sports
  if (
    /(run|trail|marathon|cycling|bike|triathlon|duathlon|row|cardio|endurance)/.test(
      n
    )
  )
    return "endurance"

  // Outdoor/adventure
  if (/(hike|hiking|climb|climbing|mountain|alpin|trek|orienteering)/.test(n))
    return "outdoor"

  return "generic"
}

function hashToIndex(seed: string, modulo: number): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % modulo
}

export function buildSupabasePublicUrl(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${HERO_BUCKET}/${path}`
}

// Sport-specific Unsplash fallback images (higher priority than category)
// Each sport has multiple high-quality images for variety
const SPORT_FALLBACK_IMAGES: Record<string, string[]> = {
  // Water sports
  kitesurfing: [
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=80",
  ],
  surfing: [
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1455729552865-3658a5d39692?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
  ],
  swimming: [
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?auto=format&fit=crop&w=1920&q=80",
  ],
  "open-water-swimming": [
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1920&q=80",
  ],
  sup: [
    "https://images.unsplash.com/photo-1526188717906-ab4a2f949f0d?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80",
  ],
  kayaking: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1521882996091-02a5f9c1d7f0?auto=format&fit=crop&w=1920&q=80",
  ],
  sailing: [
    "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1534278931827-8a259344abe7?auto=format&fit=crop&w=1920&q=80",
  ],
  windsurfing: [
    "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80",
  ],
  diving: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1920&q=80",
  ],

  // Endurance sports
  running: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1920&q=80",
  ],
  "trail-running": [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1920&q=80",
  ],
  cycling: [
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1920&q=80",
  ],
  "mountain-biking": [
    "https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1920&q=80",
  ],
  triathlon: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1920&q=80",
  ],
  marathon: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1920&q=80",
  ],
  rowing: [
    "https://images.unsplash.com/photo-1508394522741-82ac9c15ba69?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1920&q=80",
  ],

  // Winter sports
  skiing: [
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=1920&q=80",
  ],
  snowboarding: [
    "https://images.unsplash.com/photo-1478700823809-50c28f8e2c7b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
  ],
  "cross-country-skiing": [
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=1920&q=80",
  ],
  "ice-skating": [
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
  ],

  // Racket sports
  tennis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1920&q=80",
  ],
  padel: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1920&q=80",
  ],
  badminton: [
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1920&q=80",
  ],
  squash: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
  ],
  "table-tennis": [
    "https://images.unsplash.com/photo-1611251135345-18c56206b863?auto=format&fit=crop&w=1920&q=80",
  ],
  pickleball: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
  ],

  // Team sports
  basketball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1920&q=80",
  ],
  football: [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1920&q=80",
  ],
  soccer: [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1920&q=80",
  ],
  volleyball: [
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1920&q=80",
  ],
  "beach-volleyball": [
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1920&q=80",
  ],
  handball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
  ],
  hockey: [
    "https://images.unsplash.com/photo-1515703407324-5f73f9a9e7f1?auto=format&fit=crop&w=1920&q=80",
  ],
  rugby: [
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1920&q=80",
  ],
  baseball: [
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=1920&q=80",
  ],
  cricket: [
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1920&q=80",
  ],

  // Combat sports
  boxing: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517438322307-e67f79e6e5fb?auto=format&fit=crop&w=1920&q=80",
  ],
  mma: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],
  "jiu-jitsu": [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],
  judo: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],
  karate: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],
  taekwondo: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],
  wrestling: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],

  // Strength & fitness
  gym: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1920&q=80",
  ],
  weightlifting: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1920&q=80",
  ],
  crossfit: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80",
  ],
  calisthenics: [
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80",
  ],
  hiit: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
  ],
  powerlifting: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
  ],

  // Mind & body
  yoga: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1920&q=80",
  ],
  pilates: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1920&q=80",
  ],
  meditation: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
  ],
  stretching: [
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1920&q=80",
  ],

  // Outdoor & adventure
  hiking: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1920&q=80",
  ],
  climbing: [
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1920&q=80",
  ],
  bouldering: [
    "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1920&q=80",
  ],
  mountaineering: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1920&q=80",
  ],
  trekking: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1920&q=80",
  ],

  // Other sports
  golf: [
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=1920&q=80",
  ],
  skateboarding: [
    "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=1920&q=80",
  ],
  rollerblading: [
    "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=1920&q=80",
  ],
  dance: [
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=1920&q=80",
  ],
  gymnastics: [
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80",
  ],
  fencing: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  ],
  archery: [
    "https://images.unsplash.com/photo-1565992441121-4367c2967103?auto=format&fit=crop&w=1920&q=80",
  ],
}

// Fallback to Unsplash images when Supabase bucket not available
// NOTE: water category uses kitesurfing (not swimming) to be more neutral for all water sports
const FALLBACK_IMAGES: Record<HeroCategory, string> = {
  endurance:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
  strength:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
  water:
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80", // kitesurfing - neutral for all water sports
  winter:
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
  team:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
  racket:
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
  combat:
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  outdoor:
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
  mindbody:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
  generic:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80",
}

export function resolveHeroForSport(params: {
  sport: SportLike
  userId?: string
  dateISO?: string
  includeDebug?: boolean
}): ResolvedHero {
  const { sport, userId, includeDebug } = params
  const sportSlug = sportToSlug(sport.name)
  const category = inferHeroCategoryFromSportName(sport.name)

  const overridePool = SPORT_HERO_OVERRIDES[sportSlug]
  const categoryPool =
    CATEGORY_HERO_IMAGES[category] ?? CATEGORY_HERO_IMAGES.generic
  const pool = (overridePool?.length ? overridePool : categoryPool) as HeroImage[]

  // Deterministic daily rotation based on date + sport + user
  const day = params.dateISO ?? new Date().toISOString().slice(0, 10)
  const seed = `${sportSlug}:${category}:${day}:${userId ?? "anon"}`
  const idx = hashToIndex(seed, pool.length)

  const image = pool[idx]

  // Try Supabase URL first, then sport-specific fallback, then category fallback
  const supabaseUrl = buildSupabasePublicUrl(image.path)
  let imageUrl = supabaseUrl
  let usedSupabase = !!supabaseUrl
  let usedSportFallback = false
  let usedCategoryFallback = false

  if (!imageUrl) {
    // Sport-specific Unsplash fallbacks (pick deterministically)
    const sportFallbacks = SPORT_FALLBACK_IMAGES[sportSlug]
    if (sportFallbacks?.length) {
      const fallbackIdx = hashToIndex(seed, sportFallbacks.length)
      imageUrl = sportFallbacks[fallbackIdx]
      usedSportFallback = true
    } else {
      // Fall back to category-based image
      imageUrl = FALLBACK_IMAGES[category]
      usedCategoryFallback = true
    }
  }

  const result: ResolvedHero = { sportName: sport.name, sportSlug, category, image, imageUrl }

  // Include debug info only in development or when explicitly requested
  if (includeDebug || process.env.NODE_ENV === "development") {
    result.debug = {
      usedSupabase,
      usedSportFallback,
      usedCategoryFallback,
      supabaseUrl,
    }
  }

  return result
}
