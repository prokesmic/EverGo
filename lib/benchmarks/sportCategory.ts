import { SportCategory } from "./templates"

/**
 * Infers the sport category from the sport name.
 * Used to determine which benchmark templates to apply.
 */
export function inferSportCategory(sportName: string): SportCategory {
  const n = sportName.toLowerCase()

  if (/(run|trail|marathon)/.test(n)) return "ENDURANCE"
  if (/(cycling|bike|mtb|bicycle)/.test(n)) return "CYCLING"
  if (/(swim)/.test(n)) return "SWIMMING"
  if (/(gym|strength|weights|crossfit|powerlifting|weightlifting|calisthenics|fitness)/.test(n)) return "STRENGTH"
  if (/(football|soccer|basketball|volleyball|hockey|rugby|handball|baseball|cricket)/.test(n)) return "TEAM"
  if (/(tennis|padel|badminton|squash|pickleball|table tennis|golf)/.test(n)) return "RACKET"
  if (/(boxing|mma|judo|karate|taekwondo|muay|bjj|jiu-jitsu|wrestling)/.test(n)) return "COMBAT"
  if (/(kite|kitesurf|wake|surf|windsurf|sup|paddle)/.test(n)) return "WATER_BOARD"
  if (/(hike|hiking|climb|climbing|trek|orienteering|mountain)/.test(n)) return "OUTDOOR"
  if (/(ski|snow|snowboard|ice|skating|biathlon)/.test(n)) return "WINTER"
  if (/(yoga|pilates|mobility|stretch|meditation)/.test(n)) return "MINDBODY"

  return "GENERIC"
}

/**
 * Maps existing sport category names to our benchmark categories
 */
export function mapSportCategoryToBenchmarkCategory(category: string): SportCategory {
  const c = category.toUpperCase()

  switch (c) {
    case "INDIVIDUAL":
      // Most individual sports are endurance, but this is a fallback
      return "ENDURANCE"
    case "TEAM":
      return "TEAM"
    default:
      return "GENERIC"
  }
}
