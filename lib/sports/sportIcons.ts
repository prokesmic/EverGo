/**
 * Sport Icons Configuration (V6)
 *
 * Comprehensive sport icon mapping with emojis and gradient colors
 */

export const SPORT_ICONS: Record<string, { emoji: string; color: string }> = {
  // Endurance
  running: { emoji: '🏃', color: 'from-orange-500 to-red-500' },
  cycling: { emoji: '🚴', color: 'from-green-500 to-emerald-500' },
  swimming: { emoji: '🏊', color: 'from-blue-500 to-cyan-500' },
  triathlon: { emoji: '🏅', color: 'from-purple-500 to-pink-500' },

  // Outdoor
  hiking: { emoji: '🥾', color: 'from-amber-500 to-orange-500' },
  climbing: { emoji: '🧗', color: 'from-stone-500 to-slate-500' },
  skiing: { emoji: '⛷️', color: 'from-sky-500 to-blue-500' },
  snowboarding: { emoji: '🏂', color: 'from-indigo-500 to-purple-500' },

  // Gym & Fitness
  gym: { emoji: '🏋️', color: 'from-red-500 to-rose-500' },
  crossfit: { emoji: '💪', color: 'from-orange-500 to-amber-500' },
  yoga: { emoji: '🧘', color: 'from-teal-500 to-emerald-500' },
  pilates: { emoji: '🤸', color: 'from-pink-500 to-rose-500' },

  // Racket Sports
  tennis: { emoji: '🎾', color: 'from-lime-500 to-green-500' },
  badminton: { emoji: '🏸', color: 'from-blue-500 to-indigo-500' },
  squash: { emoji: '🎾', color: 'from-yellow-500 to-orange-500' },
  'table-tennis': { emoji: '🏓', color: 'from-red-500 to-orange-500' },

  // Team Sports
  soccer: { emoji: '⚽', color: 'from-green-500 to-emerald-500' },
  basketball: { emoji: '🏀', color: 'from-orange-500 to-red-500' },
  volleyball: { emoji: '🏐', color: 'from-yellow-500 to-amber-500' },
  hockey: { emoji: '🏒', color: 'from-blue-500 to-slate-500' },

  // Water Sports
  rowing: { emoji: '🚣', color: 'from-blue-500 to-teal-500' },
  kayaking: { emoji: '🛶', color: 'from-cyan-500 to-blue-500' },
  surfing: { emoji: '🏄', color: 'from-teal-500 to-cyan-500' },
  sailing: { emoji: '⛵', color: 'from-sky-500 to-blue-500' },

  // Combat
  boxing: { emoji: '🥊', color: 'from-red-500 to-rose-500' },
  martial_arts: { emoji: '🥋', color: 'from-slate-500 to-gray-500' },
  wrestling: { emoji: '🤼', color: 'from-amber-500 to-yellow-500' },

  // Other
  golf: { emoji: '⛳', color: 'from-green-500 to-lime-500' },
  dance: { emoji: '💃', color: 'from-pink-500 to-purple-500' },
  skating: { emoji: '⛸️', color: 'from-blue-500 to-indigo-500' },
  walking: { emoji: '🚶', color: 'from-slate-500 to-gray-500' },

  // Default
  default: { emoji: '🏅', color: 'from-slate-500 to-gray-500' }
}

export function getSportIcon(slug: string): { emoji: string; color: string } {
  return SPORT_ICONS[slug] ?? SPORT_ICONS.default
}

export function getSportEmoji(slug: string): string {
  return (SPORT_ICONS[slug] ?? SPORT_ICONS.default).emoji
}

export function getSportColor(slug: string): string {
  return (SPORT_ICONS[slug] ?? SPORT_ICONS.default).color
}
