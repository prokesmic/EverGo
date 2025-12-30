// Landing page type scale - clamped, responsive, premium feel
// Used for consistent typography across all landing sections

export const landingType = {
  // Hero headline - bold but not overwhelming
  h1: "text-[clamp(32px,5vw,56px)] leading-[1.05] font-bold tracking-[-0.02em]",

  // Section headings
  h2: "text-[clamp(24px,3vw,36px)] leading-tight font-bold tracking-[-0.01em]",

  // Card/feature titles
  h3: "text-[clamp(18px,2vw,22px)] leading-tight font-semibold",

  // Body text with good contrast
  p: "text-[15px] sm:text-[16px] leading-relaxed font-normal text-slate-600",

  // Small/supporting text
  small: "text-[13px] leading-relaxed text-slate-500",

  // Eyebrow/badge text
  eyebrow: "text-xs font-bold uppercase tracking-wider",
}

// Section padding - tighter, more premium feel
export const sectionPadding = {
  // Standard section padding
  section: "py-14 sm:py-16 lg:py-20",

  // Hero section (more top padding for header)
  hero: "pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-14 lg:pb-16",

  // Container horizontal padding
  container: "px-4 sm:px-6",
}

// Card styling - tighter, more refined
export const cardStyles = {
  // Standard card
  base: "rounded-2xl border border-slate-200 p-4 sm:p-5",

  // Featured/prominent card
  featured: "rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-lg",

  // Dark card
  dark: "rounded-2xl bg-slate-900 p-4 sm:p-5",
}

// Button sizes - smaller, denser
export const buttonStyles = {
  // Primary CTA
  primary: "h-11 px-5 rounded-xl text-[15px] font-semibold",

  // Large/hero CTA
  large: "h-12 px-6 rounded-xl text-[15px] font-semibold",

  // Secondary/outline
  secondary: "h-11 px-5 rounded-xl text-[15px] font-medium border-2",
}

// Max widths for text blocks
export const textWidths = {
  // Hero headline max width
  heroHeadline: "max-w-[680px]",

  // Hero description
  heroDescription: "max-w-[560px]",

  // Section description
  sectionDescription: "max-w-[520px]",
}
