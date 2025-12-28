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

  // Try Supabase URL first, fall back to Unsplash
  const supabaseUrl = buildSupabasePublicUrl(image.path)
  const imageUrl = supabaseUrl ?? FALLBACK_IMAGES[category]

  return { sportName: sport.name, sportSlug, category, image, imageUrl }
}
