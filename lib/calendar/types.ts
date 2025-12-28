/**
 * Calendar Types
 *
 * Unified types for calendar items that merge Activities, Events, and Challenges
 */

export type CalendarItemType = "activity" | "event" | "challenge"

export type CalendarAccent = "emerald" | "sky" | "violet" | "orange" | "rose" | "slate" | "yellow" | "cyan" | "lime" | "purple" | "green"

export interface CalendarItem {
  id: string
  type: CalendarItemType
  title: string
  startAt: string // ISO date string
  endAt?: string // ISO date string
  sportSlug?: string
  sportName?: string
  locationName?: string
  isAllDay?: boolean
  accent?: CalendarAccent
  meta?: {
    // Activity-specific
    durationSeconds?: number
    distanceMeters?: number
    caloriesBurned?: number
    // Event-specific
    hostId?: string
    participantCount?: number
    isPublic?: boolean
    // Challenge-specific
    targetValue?: number
    targetUnit?: string
    progress?: number
    isCompleted?: boolean
  }
}

export type CalendarView = "agenda" | "week" | "month"

export interface CalendarFilters {
  types: CalendarItemType[]
  sportSlugs: string[]
  dateRange: {
    from: Date
    to: Date
  }
}

export interface CalendarState {
  view: CalendarView
  selectedDate: Date
  filters: CalendarFilters
}

// Sport color mapping
export const sportColorMap: Record<string, CalendarAccent> = {
  running: "emerald",
  cycling: "yellow",
  swimming: "cyan",
  football: "green",
  soccer: "green",
  tennis: "lime",
  fitness: "purple",
  gym: "purple",
  yoga: "violet",
  hiking: "orange",
  skiing: "sky",
  snowboarding: "sky",
  basketball: "orange",
  volleyball: "rose",
  golf: "lime",
  boxing: "rose",
  mma: "rose",
  climbing: "orange",
  surfing: "cyan",
}

export function getSportAccent(sportSlug?: string): CalendarAccent {
  if (!sportSlug) return "slate"
  return sportColorMap[sportSlug.toLowerCase()] || "slate"
}

export function getAccentClasses(accent: CalendarAccent): { bg: string; text: string; border: string; dot: string } {
  const classes: Record<CalendarAccent, { bg: string; text: string; border: string; dot: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    sky: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", dot: "bg-rose-500" },
    slate: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-500" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", dot: "bg-cyan-500" },
    lime: { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200", dot: "bg-lime-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  }
  return classes[accent]
}

export function getTypeIcon(type: CalendarItemType): string {
  switch (type) {
    case "activity":
      return "Activity"
    case "event":
      return "CalendarDays"
    case "challenge":
      return "Trophy"
    default:
      return "Circle"
  }
}
