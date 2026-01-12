// components/hero/HomeHeroBanner.tsx
// Stunning immersive hero with identity panel inside the banner
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Plus, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "./HeroBanner"
import { HeroIdentityPanel } from "./HeroIdentityPanel"
import { cn } from "@/lib/utils"
import { resolveHeroImage } from "@/lib/hero/resolveHeroImage"
import { getSportThumbImage } from "@/lib/sports/media"
import { motion } from "framer-motion"

interface HomeHeroBannerProps {
  user: {
    id: string
    displayName: string | null
    username: string | null
    email: string | null
    avatarUrl: string | null
    coverPhotoUrl: string | null
    city: string | null
    country: string | null
    bio: string | null
    createdAt: Date
  }
  primarySport: {
    name: string
    slug: string
  } | null
  stats: {
    activities: number
    followers: number
    following: number
  }
  /** Sport Index for glow effect threshold */
  sportIndex?: number
}

export function HomeHeroBanner({
  user,
  primarySport,
  stats,
  sportIndex = 0,
}: HomeHeroBannerProps) {
  const joinDate = new Date(user.createdAt)
  const joinMonthYear = joinDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  // Format location
  const locationLabel = user.city
    ? `${user.city}${user.country ? `, ${user.country}` : ""}`
    : null

  // Resolve hero image using single source of truth
  const heroImageSrc = resolveHeroImage({
    coverPhotoUrl: user.coverPhotoUrl,
    sportKey: primarySport?.slug,
    sportName: primarySport?.name,
  })

  // Sport thumbnail for chip
  const sportThumb = primarySport
    ? getSportThumbImage(primarySport.slug ?? primarySport.name)
    : null

  // Determine glow color based on sport index
  const glowColor = sportIndex >= 1000 ? "gold"
    : sportIndex >= 500 ? "silver"
    : sportIndex >= 100 ? "bronze"
    : null

  return (
    <div className="relative">
      <HeroBanner
        imageSrc={heroImageSrc}
        data-testid="home-hero"
        glowColor={glowColor}
        topRight={
          <div className="flex items-center gap-2">
            <Link href="/gauntlets/new">
              <Button
                variant="outline"
                data-testid="home-throw-gauntlet-btn"
                className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <Swords className="h-4 w-4" />
                <span className="hidden sm:inline">Throw Gauntlet</span>
              </Button>
            </Link>
            <Link href="/activity/create">
              <Button
                data-testid="home-log-activity-btn"
                className="gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-shadow"
              >
                <Plus className="h-4 w-4" />
                Log Activity
              </Button>
            </Link>
          </div>
        }
      >
        {/* Content directly on the hero */}
        <div className="h-full w-full flex flex-col justify-between p-4 md:p-6">
          {/* Top Section: Sport Pill */}
          <div className="flex items-start justify-between">
            {primarySport && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                  {sportThumb && (
                    <Image
                      src={sportThumb}
                      alt={primarySport.name}
                      width={18}
                      height={18}
                      className="rounded-full object-cover"
                    />
                  )}
                  {primarySport.name}
                </span>
              </motion.div>
            )}

            {/* Location & Joined - Top right, subtle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 text-xs text-white/60"
            >
              {locationLabel && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {locationLabel}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {joinMonthYear}
              </span>
            </motion.div>
          </div>

          {/* Bottom Section: Identity Panel */}
          <HeroIdentityPanel
            displayName={user.displayName ?? user.username ?? "Athlete"}
            username={user.username}
            avatarUrl={user.avatarUrl}
            stats={stats}
            profileHref="/profile/me"
          />
        </div>
      </HeroBanner>
    </div>
  )
}
