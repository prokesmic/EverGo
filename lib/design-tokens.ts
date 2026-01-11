/**
 * Aurora Design System - Token Reference (V10)
 *
 * RULE: Always use semantic tokens, NEVER hardcode colors.
 *
 * This file documents the design system tokens available in Tailwind.
 * See app/globals.css for CSS variable definitions.
 *
 * Semantic Token Categories:
 * 1. Backgrounds: bg-background, bg-card, bg-muted, bg-primary
 * 2. Text: text-foreground, text-primary, text-muted-foreground, text-card-foreground
 * 3. Borders: border-border, border-primary
 * 4. Interactive: hover:bg-muted, hover:text-primary
 */

// Background Tokens
export const BACKGROUND_TOKENS = {
  page: 'bg-background',           // Main page background
  card: 'bg-card',                 // Card/panel backgrounds
  muted: 'bg-muted',               // Subtle backgrounds (chips, badges)
  primary: 'bg-primary',           // Primary action backgrounds
  destructive: 'bg-destructive',   // Error/danger backgrounds
  secondary: 'bg-secondary',       // Secondary backgrounds
} as const

// Text Tokens
export const TEXT_TOKENS = {
  primary: 'text-foreground',           // Main body text
  secondary: 'text-muted-foreground',   // Secondary/hint text
  brand: 'text-primary',                // Brand/action text
  inverse: 'text-primary-foreground',   // Text on primary backgrounds
  card: 'text-card-foreground',         // Text on card backgrounds
  destructive: 'text-destructive',      // Error text
} as const

// Border Tokens
export const BORDER_TOKENS = {
  default: 'border-border',         // Default borders
  muted: 'border-muted',            // Subtle borders
  primary: 'border-primary',        // Primary/accent borders
  destructive: 'border-destructive', // Error borders
} as const

// Interactive State Tokens
export const INTERACTIVE_TOKENS = {
  hoverBg: 'hover:bg-muted',
  hoverText: 'hover:text-primary',
  focusRing: 'focus:ring-primary',
  activeBg: 'active:bg-primary/10',
} as const

/**
 * BANNED PATTERNS - Do NOT use these in code:
 *
 * ❌ text-emerald-600 → ✅ text-primary
 * ❌ bg-slate-100 → ✅ bg-muted
 * ❌ text-gray-500 → ✅ text-muted-foreground
 * ❌ bg-orange-500 → ✅ bg-primary
 * ❌ #F97316 → ✅ var(--primary)
 * ❌ bg-white → ✅ bg-background or bg-card
 * ❌ text-black → ✅ text-foreground
 *
 * Exception: Opacity modifiers like bg-primary/10 are OK
 */

// Color audit utility - check if a class uses hardcoded colors
export function isHardcodedColor(className: string): boolean {
  const hardcodedPatterns = [
    // Specific color names with numbers
    /\b(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d+/,
    // Hex colors
    /#[0-9a-fA-F]{3,8}/,
    // RGB/HSL
    /rgb\(|rgba\(|hsl\(|hsla\(/,
    // bg-white, bg-black, text-white, text-black
    /\b(bg|text)-(white|black)\b/,
  ]

  return hardcodedPatterns.some((pattern) => pattern.test(className))
}

// Get suggestion for hardcoded color
export function getSuggestion(className: string): string | null {
  const suggestions: Record<string, string> = {
    'text-emerald': 'text-primary',
    'text-orange': 'text-primary',
    'bg-orange': 'bg-primary',
    'bg-emerald': 'bg-primary',
    'text-slate': 'text-foreground or text-muted-foreground',
    'bg-slate': 'bg-muted or bg-card',
    'text-gray': 'text-muted-foreground',
    'bg-gray': 'bg-muted',
    'bg-white': 'bg-background or bg-card',
    'text-white': 'text-primary-foreground',
    'bg-black': 'bg-foreground',
    'text-black': 'text-foreground',
  }

  for (const [pattern, suggestion] of Object.entries(suggestions)) {
    if (className.includes(pattern)) {
      return suggestion
    }
  }

  return null
}

/**
 * Design System Quick Reference:
 *
 * BUTTONS:
 * - Primary: bg-primary text-primary-foreground hover:bg-primary/90
 * - Secondary: bg-secondary text-secondary-foreground hover:bg-secondary/80
 * - Ghost: hover:bg-muted hover:text-foreground
 * - Destructive: bg-destructive text-destructive-foreground
 *
 * CARDS:
 * - Container: bg-card text-card-foreground border border-border rounded-xl
 * - Header: font-semibold text-card-foreground
 * - Description: text-muted-foreground
 *
 * INPUTS:
 * - Border: border border-input focus:border-primary
 * - Background: bg-background
 * - Placeholder: placeholder:text-muted-foreground
 *
 * BADGES:
 * - Default: bg-muted text-muted-foreground
 * - Primary: bg-primary text-primary-foreground
 *
 * TEXT HIERARCHY:
 * - Heading: text-foreground font-semibold
 * - Body: text-foreground
 * - Caption: text-muted-foreground text-sm
 * - Link: text-primary hover:underline
 */
