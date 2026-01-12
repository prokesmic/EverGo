// components/hero/HomeHeroBanner.tsx
// Stunning immersive hero - text directly on image, avatar breaches the edge
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Plus, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "./HeroBanner"
import { cn } from "@/lib/utils"
import { getSportHeroImage, getSportThumbImage } from "@/lib/sports/media"
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

  // Get sport-specific hero image
  const sportHeroImage = getSportHeroImage(primarySport?.slug ?? primarySport?.name)
  const heroImageSrc = user.coverPhotoUrl || sportHeroImage

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
        {/* Content directly on the hero - NO container box */}
        <div className="h-full w-full flex flex-col justify-end pb-12 md:pb-14 px-6 md:px-8">
          {/* Primary Sport Pill - prominent glass effect */}
          {primarySport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-3 flex items-center gap-2"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 text-sm font-medium text-white shadow-lg">
                {sportThumb && (
                  <Image
                    src={sportThumb}
                    alt={primarySport.name}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                )}
                {primarySport.name}
              </span>
              {/* DEBUG: Show sport key being used for hero image - REMOVE AFTER VERIFICATION */}
              {process.env.NODE_ENV === "development" && (
                <span className="text-[10px] px-2 py-1 bg-yellow-500/80 text-black rounded font-mono">
                  SPORT_KEY: {primarySport?.slug ?? primarySport?.name ?? "none"}
                </span>
              )}
            </motion.div>
          )}

          {/* Display Name - Large, bold, directly on image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link href="/profile/me" className="group">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl group-hover:text-white/90 transition-colors">
                {user.displayName ?? user.username ?? "Athlete"}
              </h1>
            </Link>
          </motion.div>

          {/* Username */}
          {user.username && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-1"
            >
              <span className="text-lg text-white/70 font-light">@{user.username}</span>
            </motion.div>
          )}

          {/* Location & Joined - Lighter weight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/60 font-light"
          >
            {locationLabel && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {locationLabel}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Joined {joinMonthYear}
            </span>
          </motion.div>
        </div>
      </HeroBanner>

      {/* Avatar Breach - Overlapping the hero bottom edge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute -bottom-8 left-6 md:left-8 z-30"
      >
        <Link
          href="/profile/me"
          className="block relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full border-4 border-background shadow-2xl hover:scale-105 transition-transform"
        >
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-primary/80 text-2xl md:text-3xl font-bold text-primary-foreground">
              {(user.displayName ?? user.username ?? "U").slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>
      </motion.div>

      {/* Floating Stats - Right side breach */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
        className="absolute -bottom-4 right-6 md:right-8 z-30"
      >
        <div className="flex items-center gap-4 bg-background/90 backdrop-blur-md rounded-2xl border border-border shadow-xl px-5 py-3">
          <StatBadge value={stats.activities} label="Activities" href="/profile/me" />
          <div className="w-px h-8 bg-border" />
          <StatBadge value={stats.followers} label="Followers" href="/profile/me?tab=followers" />
          <div className="w-px h-8 bg-border" />
          <StatBadge value={stats.following} label="Following" href="/profile/me?tab=following" />
        </div>
      </motion.div>
    </div>
  )
}

function StatBadge({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link href={href} className="text-center hover:opacity-70 transition-opacity">
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </Link>
  )
}
