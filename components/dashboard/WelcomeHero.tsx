"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ResolvedHero } from "@/lib/hero/heroResolver"
import { useState } from "react"

// Category-specific Unsplash fallbacks (guaranteed to work)
// NOTE: water uses kitesurfing (not swimming) to be neutral for all water sports
const CATEGORY_FALLBACKS: Record<string, string> = {
  endurance: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
  strength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
  water: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80", // kitesurfing
  winter: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
  team: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
  racket: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
  combat: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  outdoor: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
  mindbody: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
  generic: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80",
}

interface WelcomeHeroProps {
  name: string
  avatarUrl?: string
  location: string
  primarySport: string
  hero?: ResolvedHero
}

export function WelcomeHero({
  name,
  avatarUrl,
  location,
  primarySport,
  hero,
}: WelcomeHeroProps) {
  const initials = name.substring(0, 2).toUpperCase()
  const greeting = getGreeting()

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  // Primary image URL
  const primaryImage = hero?.imageUrl ??
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80"

  // Fallback image based on category
  const fallbackImage = CATEGORY_FALLBACKS[hero?.category ?? "generic"] ?? CATEGORY_FALLBACKS.generic

  // State for image error handling
  const [imageSrc, setImageSrc] = useState(primaryImage)
  const [hasError, setHasError] = useState(false)

  const objectPosition = hero?.image?.objectPosition ?? "50% 35%"

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackImage)
    }
  }

  return (
    <section className="relative w-full overflow-hidden h-[170px] sm:h-[190px] md:h-[220px] lg:h-[240px]">
      {/* Sport-specific background image */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={`${hero?.sportName ?? primarySport} background`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1400px"
          className="object-cover"
          style={{ objectPosition }}
          onError={handleImageError}
        />
        {/* Premium overlay system - allows image to show through beautifully */}
        {/* 1. Subtle indigo/blue tint for brand feel */}
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply" />
        {/* 2. Left gradient for text readability (softer) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-transparent" />
        {/* 3. Bottom gradient for bottom content */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />
        {/* 4. Subtle noise texture for premium feel */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* Accent glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Content - Identity only, compact layout */}
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6 pb-10 md:pb-12">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Avatar className="h-14 w-14 md:h-16 md:w-16 ring-2 ring-orange-500/50 ring-offset-2 ring-offset-slate-900">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 mb-0.5">
              {greeting}
            </p>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              {name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-300 mt-0.5">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{location}</span>
              </span>
              <span className="text-slate-600 shrink-0">·</span>
              <span className="capitalize text-emerald-400 font-medium shrink-0">{primarySport}</span>
            </div>
          </div>
        </div>

        {/* Photo credit - subtle, positioned at bottom */}
        {hero?.image?.credit?.name && (
          <div className="absolute bottom-2 right-4 text-[9px] text-white/30">
            Photo:{" "}
            {hero.image.credit.url ? (
              <a
                className="hover:text-white/50 transition-colors"
                href={hero.image.credit.url}
                target="_blank"
                rel="noreferrer"
              >
                {hero.image.credit.name}
              </a>
            ) : (
              hero.image.credit.name
            )}
          </div>
        )}
      </div>
    </section>
  )
}
