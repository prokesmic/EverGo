/**
 * UI Design Tokens
 * Centralized styling tokens for consistent UI across the app
 */

export const ui = {
  // Card styles
  card: "rounded-2xl border bg-card shadow-sm",
  cardHover: "transition hover:shadow-md hover:-translate-y-[1px]",
  cardElevated: "rounded-2xl border bg-card shadow-md",

  // Spacing
  sectionGap: "mt-6",
  gridGap: "gap-4 sm:gap-6",

  // Grid layouts
  gridCols1: "grid grid-cols-1",
  gridCols2: "grid grid-cols-1 md:grid-cols-2",
  gridCols3: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  gridCols4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",

  // Container max widths
  containerNarrow: "max-w-[900px]",
  containerDefault: "max-w-[1200px]",
  containerWide: "max-w-[1400px]",

  // Sidebar layouts
  sidebarLayout: "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6",
  sidebarLayoutReversed: "grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6",

  // Text styles
  pageTitle: "text-2xl sm:text-3xl font-semibold tracking-tight",
  sectionTitle: "text-lg font-semibold",
  cardTitle: "text-base font-medium",

  // Form elements
  inputGroup: "space-y-2",
  labelText: "text-sm font-medium text-foreground",
  helpText: "text-xs text-muted-foreground",

  // Buttons
  iconButton: "h-9 w-9 p-0",

  // Status badges
  badge: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  badgeSuccess: "bg-green-100 text-green-700",
  badgeWarning: "bg-amber-100 text-amber-700",
  badgeError: "bg-red-100 text-red-700",
  badgeInfo: "bg-blue-100 text-blue-700",
} as const

// Responsive breakpoint helpers
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const
