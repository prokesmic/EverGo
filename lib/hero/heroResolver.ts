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
const SPORT_FALLBACK_IMAGES: Record<string, string[]> = {
  kitesurfing: [
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80", // Kitesurfer jumping
    "https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=1920&q=80", // Kite in sky
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=80", // Kiteboarding action
  ],
  running: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1920&q=80",
  ],
  cycling: [
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1920&q=80",
  ],
  swimming: [
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1920&q=80",
  ],
  skiing: [
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1605540436563-5bca919ae766?auto=format&fit=crop&w=1920&q=80",
  ],
  tennis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1920&q=80",
  ],
  basketball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&w=1920&q=80",
  ],
  yoga: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1920&q=80",
  ],
  bouldering: [
    "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1920&q=80",
  ],
  boxing: [
    "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1517438322307-e67f79e6e5fb?auto=format&fit=crop&w=1920&q=80",
  ],
}

// Fallback to Unsplash images when Supabase bucket not available
const FALLBACK_IMAGES: Record<HeroCategory, string> = {
  endurance:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
  strength:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
  water:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1920&q=80",
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
}): ResolvedHero {
  const { sport, userId } = params
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

  if (!imageUrl) {
    // Sport-specific Unsplash fallbacks (pick deterministically)
    const sportFallbacks = SPORT_FALLBACK_IMAGES[sportSlug]
    if (sportFallbacks?.length) {
      const fallbackIdx = hashToIndex(seed, sportFallbacks.length)
      imageUrl = sportFallbacks[fallbackIdx]
    } else {
      // Fall back to category-based image
      imageUrl = FALLBACK_IMAGES[category]
    }
  }

  return { sportName: sport.name, sportSlug, category, image, imageUrl }
}
