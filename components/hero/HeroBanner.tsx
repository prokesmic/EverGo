// components/hero/HeroBanner.tsx
// Reusable hero banner wrapper - EXACT copy of Profile hero pattern
// This is the SOURCE OF TRUTH for all hero banners in the app

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

// Using the SAME default image as Profile (guaranteed to work on prod)
// This URL is already allowlisted in next.config.ts
export const DEFAULT_HERO_BANNER = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80"

interface HeroBannerProps {
  /** Image source URL. Falls back to DEFAULT_HERO_BANNER if empty/null */
  imageSrc?: string | null
  /** Content to render inside the hero (absolute positioned) */
  children?: ReactNode
  /** Optional top-right slot (e.g., Edit button) */
  topRight?: ReactNode
  /** Height class - default matches Profile hero */
  heightClass?: string
  /** Additional classes for the outer section */
  className?: string
  /** Alt text for the image */
  alt?: string
  /** Data testid for testing */
  "data-testid"?: string
}

export function HeroBanner({
  imageSrc,
  children,
  topRight,
  heightClass = "h-[280px]",
  className,
  alt = "Hero banner",
  "data-testid": testId = "hero-banner",
}: HeroBannerProps) {
  // ALWAYS use a real image, never a gradient fallback
  const heroSrc = imageSrc && imageSrc.trim().length > 0 ? imageSrc : DEFAULT_HERO_BANNER

  return (
    <section
      data-testid={testId}
      className={cn("relative w-full overflow-hidden rounded-2xl", className)}
    >
      <div className={cn("relative w-full", heightClass)}>
        {/* Background image - ALWAYS shows a photo, never a gradient */}
        <Image
          data-testid={`${testId}-image`}
          src={heroSrc}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Dark gradient overlay for readability - left to right fade */}
        {/* This is the EXACT same gradient used on Profile */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

        {/* Top-right slot (e.g., Edit Profile button) */}
        {topRight && (
          <div className="absolute right-4 top-4 z-20">{topRight}</div>
        )}

        {/* Main content slot - positioned inside the hero */}
        {children && (
          <div className="absolute inset-0 z-10">{children}</div>
        )}
      </div>
    </section>
  )
}
