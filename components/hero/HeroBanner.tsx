// components/hero/HeroBanner.tsx
// Stunning immersive hero banner with parallax effect
// SOURCE OF TRUTH for all hero banners in the app

"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { ReactNode, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

// Using the SAME default image as Profile (guaranteed to work on prod)
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
  /** Enable parallax scroll effect */
  parallax?: boolean
  /** Glow color for power users (e.g., "orange", "gold", "silver") */
  glowColor?: "orange" | "gold" | "silver" | "bronze" | null
}

export function HeroBanner({
  imageSrc,
  children,
  topRight,
  heightClass = "h-[280px]",
  className,
  alt = "Hero banner",
  "data-testid": testId = "hero-banner",
  parallax = true,
  glowColor = null,
}: HeroBannerProps) {
  const containerRef = useRef<HTMLElement>(null)

  // Parallax scroll effect
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const scale = useTransform(scrollY, [0, 500], [1, 1.1])

  // ALWAYS use a real image, never a gradient fallback
  const heroSrc = imageSrc && imageSrc.trim().length > 0 ? imageSrc : DEFAULT_HERO_BANNER

  // Glow styles based on tier
  const glowStyles = glowColor ? {
    orange: "shadow-[0_0_60px_rgba(249,115,22,0.3),inset_0_0_60px_rgba(249,115,22,0.1)]",
    gold: "shadow-[0_0_60px_rgba(234,179,8,0.3),inset_0_0_60px_rgba(234,179,8,0.1)]",
    silver: "shadow-[0_0_60px_rgba(148,163,184,0.3),inset_0_0_60px_rgba(148,163,184,0.1)]",
    bronze: "shadow-[0_0_60px_rgba(180,83,9,0.3),inset_0_0_60px_rgba(180,83,9,0.1)]",
  }[glowColor] : ""

  return (
    <section
      ref={containerRef}
      data-testid={testId}
      className={cn(
        "relative w-full overflow-hidden rounded-3xl",
        glowStyles,
        className
      )}
    >
      <div className={cn("relative w-full", heightClass)}>
        {/* Background image with parallax */}
        <motion.div
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
          style={parallax ? { y, scale } : undefined}
        >
          <Image
            data-testid={`${testId}-image`}
            src={heroSrc}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Premium gradient overlay - bottom-up fade for immersion */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Left-side gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

        {/* Subtle vignette effect */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />

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
