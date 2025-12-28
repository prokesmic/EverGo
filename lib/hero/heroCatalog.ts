export type HeroCategory =
  | "endurance"
  | "strength"
  | "water"
  | "winter"
  | "team"
  | "racket"
  | "combat"
  | "outdoor"
  | "mindbody"
  | "generic"

export type HeroImage = {
  path: string
  objectPosition?: string // e.g. "50% 35%"
  credit?: { name: string; url?: string }
}

export const HERO_BUCKET = "hero-banners"

export const CATEGORY_HERO_IMAGES: Record<HeroCategory, HeroImage[]> = {
  endurance: [
    { path: "categories/endurance/01.webp", objectPosition: "50% 35%" },
    { path: "categories/endurance/02.webp", objectPosition: "50% 40%" },
    { path: "categories/endurance/03.webp", objectPosition: "50% 30%" },
    { path: "categories/endurance/04.webp", objectPosition: "50% 35%" },
    { path: "categories/endurance/05.webp", objectPosition: "50% 35%" },
    { path: "categories/endurance/06.webp", objectPosition: "50% 35%" },
  ],
  strength: [
    { path: "categories/strength/01.webp", objectPosition: "50% 30%" },
    { path: "categories/strength/02.webp", objectPosition: "50% 35%" },
    { path: "categories/strength/03.webp", objectPosition: "50% 30%" },
    { path: "categories/strength/04.webp", objectPosition: "50% 35%" },
    { path: "categories/strength/05.webp", objectPosition: "50% 30%" },
    { path: "categories/strength/06.webp", objectPosition: "50% 30%" },
  ],
  water: [
    { path: "categories/water/01.webp", objectPosition: "50% 40%" },
    { path: "categories/water/02.webp", objectPosition: "50% 35%" },
    { path: "categories/water/03.webp", objectPosition: "50% 35%" },
    { path: "categories/water/04.webp", objectPosition: "50% 35%" },
    { path: "categories/water/05.webp", objectPosition: "50% 40%" },
    { path: "categories/water/06.webp", objectPosition: "50% 40%" },
  ],
  winter: [
    { path: "categories/winter/01.webp", objectPosition: "50% 40%" },
    { path: "categories/winter/02.webp", objectPosition: "50% 35%" },
    { path: "categories/winter/03.webp", objectPosition: "50% 35%" },
    { path: "categories/winter/04.webp", objectPosition: "50% 40%" },
    { path: "categories/winter/05.webp", objectPosition: "50% 40%" },
    { path: "categories/winter/06.webp", objectPosition: "50% 40%" },
  ],
  team: [
    { path: "categories/team/01.webp", objectPosition: "50% 35%" },
    { path: "categories/team/02.webp", objectPosition: "50% 35%" },
    { path: "categories/team/03.webp", objectPosition: "50% 35%" },
    { path: "categories/team/04.webp", objectPosition: "50% 35%" },
    { path: "categories/team/05.webp", objectPosition: "50% 35%" },
    { path: "categories/team/06.webp", objectPosition: "50% 35%" },
  ],
  racket: [
    { path: "categories/racket/01.webp", objectPosition: "50% 35%" },
    { path: "categories/racket/02.webp", objectPosition: "50% 35%" },
    { path: "categories/racket/03.webp", objectPosition: "50% 35%" },
    { path: "categories/racket/04.webp", objectPosition: "50% 35%" },
    { path: "categories/racket/05.webp", objectPosition: "50% 35%" },
    { path: "categories/racket/06.webp", objectPosition: "50% 35%" },
  ],
  combat: [
    { path: "categories/combat/01.webp", objectPosition: "50% 35%" },
    { path: "categories/combat/02.webp", objectPosition: "50% 35%" },
    { path: "categories/combat/03.webp", objectPosition: "50% 35%" },
    { path: "categories/combat/04.webp", objectPosition: "50% 35%" },
    { path: "categories/combat/05.webp", objectPosition: "50% 35%" },
    { path: "categories/combat/06.webp", objectPosition: "50% 35%" },
  ],
  outdoor: [
    { path: "categories/outdoor/01.webp", objectPosition: "50% 40%" },
    { path: "categories/outdoor/02.webp", objectPosition: "50% 35%" },
    { path: "categories/outdoor/03.webp", objectPosition: "50% 35%" },
    { path: "categories/outdoor/04.webp", objectPosition: "50% 40%" },
    { path: "categories/outdoor/05.webp", objectPosition: "50% 40%" },
    { path: "categories/outdoor/06.webp", objectPosition: "50% 40%" },
  ],
  mindbody: [
    { path: "categories/mindbody/01.webp", objectPosition: "50% 35%" },
    { path: "categories/mindbody/02.webp", objectPosition: "50% 35%" },
    { path: "categories/mindbody/03.webp", objectPosition: "50% 35%" },
    { path: "categories/mindbody/04.webp", objectPosition: "50% 35%" },
    { path: "categories/mindbody/05.webp", objectPosition: "50% 35%" },
    { path: "categories/mindbody/06.webp", objectPosition: "50% 35%" },
  ],
  generic: [
    { path: "categories/generic/01.webp", objectPosition: "50% 35%" },
    { path: "categories/generic/02.webp", objectPosition: "50% 35%" },
    { path: "categories/generic/03.webp", objectPosition: "50% 35%" },
    { path: "categories/generic/04.webp", objectPosition: "50% 35%" },
    { path: "categories/generic/05.webp", objectPosition: "50% 35%" },
    { path: "categories/generic/06.webp", objectPosition: "50% 35%" },
  ],
}

// Sport overrides (optional, best-in-class for major sports)
export const SPORT_HERO_OVERRIDES: Record<string, HeroImage[]> = {
  running: [
    { path: "sports/running/01.webp", objectPosition: "50% 35%" },
    { path: "sports/running/02.webp", objectPosition: "50% 35%" },
    { path: "sports/running/03.webp", objectPosition: "50% 35%" },
  ],
  "trail-running": [
    { path: "sports/trail-running/01.webp", objectPosition: "50% 40%" },
    { path: "sports/trail-running/02.webp", objectPosition: "50% 40%" },
    { path: "sports/trail-running/03.webp", objectPosition: "50% 40%" },
  ],
  cycling: [
    { path: "sports/cycling/01.webp", objectPosition: "50% 35%" },
    { path: "sports/cycling/02.webp", objectPosition: "50% 35%" },
    { path: "sports/cycling/03.webp", objectPosition: "50% 35%" },
  ],
  "mountain-biking": [
    { path: "sports/mountain-biking/01.webp", objectPosition: "50% 40%" },
    { path: "sports/mountain-biking/02.webp", objectPosition: "50% 40%" },
    { path: "sports/mountain-biking/03.webp", objectPosition: "50% 40%" },
  ],
  swimming: [
    { path: "sports/swimming/01.webp", objectPosition: "50% 35%" },
    { path: "sports/swimming/02.webp", objectPosition: "50% 35%" },
    { path: "sports/swimming/03.webp", objectPosition: "50% 35%" },
  ],
  triathlon: [
    { path: "sports/triathlon/01.webp", objectPosition: "50% 35%" },
    { path: "sports/triathlon/02.webp", objectPosition: "50% 35%" },
    { path: "sports/triathlon/03.webp", objectPosition: "50% 35%" },
  ],
  tennis: [
    { path: "sports/tennis/01.webp", objectPosition: "50% 35%" },
    { path: "sports/tennis/02.webp", objectPosition: "50% 35%" },
    { path: "sports/tennis/03.webp", objectPosition: "50% 35%" },
  ],
  padel: [
    { path: "sports/padel/01.webp", objectPosition: "50% 35%" },
    { path: "sports/padel/02.webp", objectPosition: "50% 35%" },
    { path: "sports/padel/03.webp", objectPosition: "50% 35%" },
  ],
  football: [
    { path: "sports/football/01.webp", objectPosition: "50% 35%" },
    { path: "sports/football/02.webp", objectPosition: "50% 35%" },
    { path: "sports/football/03.webp", objectPosition: "50% 35%" },
  ],
  basketball: [
    { path: "sports/basketball/01.webp", objectPosition: "50% 35%" },
    { path: "sports/basketball/02.webp", objectPosition: "50% 35%" },
    { path: "sports/basketball/03.webp", objectPosition: "50% 35%" },
  ],
  gym: [
    { path: "sports/gym/01.webp", objectPosition: "50% 30%" },
    { path: "sports/gym/02.webp", objectPosition: "50% 30%" },
    { path: "sports/gym/03.webp", objectPosition: "50% 30%" },
  ],
  yoga: [
    { path: "sports/yoga/01.webp", objectPosition: "50% 35%" },
    { path: "sports/yoga/02.webp", objectPosition: "50% 35%" },
    { path: "sports/yoga/03.webp", objectPosition: "50% 35%" },
  ],
  kitesurfing: [
    { path: "sports/kitesurfing/01.webp", objectPosition: "50% 40%" },
    { path: "sports/kitesurfing/02.webp", objectPosition: "50% 40%" },
    { path: "sports/kitesurfing/03.webp", objectPosition: "50% 40%" },
  ],
  skiing: [
    { path: "sports/skiing/01.webp", objectPosition: "50% 40%" },
    { path: "sports/skiing/02.webp", objectPosition: "50% 40%" },
    { path: "sports/skiing/03.webp", objectPosition: "50% 40%" },
  ],
  snowboarding: [
    { path: "sports/snowboarding/01.webp", objectPosition: "50% 40%" },
    { path: "sports/snowboarding/02.webp", objectPosition: "50% 40%" },
    { path: "sports/snowboarding/03.webp", objectPosition: "50% 40%" },
  ],
}
