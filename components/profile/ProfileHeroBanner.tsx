// components/profile/ProfileHeroBanner.tsx
// Stunning immersive profile hero - text directly on image, avatar breaches the edge
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "@/components/hero/HeroBanner"
import { cn } from "@/lib/utils"
import { getSportHeroImage, getSportThumbImage } from "@/lib/sports/media"
import { motion } from "framer-motion"

type ProfileHeroBannerProps = {
  isOwnProfile: boolean
  onEditHref?: string

  // Data
  displayName: string
  username?: string | null
  handleOrEmail: string
  locationLabel?: string | null
  joinedLabel?: string | null
  bio?: string | null
  primarySportLabel?: string | null
  /** Sport key/slug for sport-specific hero image */
  primarySportKey?: string | null
  /** Sport Index for glow effect */
  sportIndex?: number

  avatarUrl?: string | null
  bannerUrl?: string | null

  counts: {
    activities: number
    followers: number
    following: number
  }
}

export function ProfileHeroBanner(props: ProfileHeroBannerProps) {
  const {
    isOwnProfile,
    onEditHref = "/settings/profile",
    displayName,
    username,
    handleOrEmail,
    locationLabel,
    joinedLabel,
    primarySportLabel,
    primarySportKey,
    sportIndex = 0,
    avatarUrl,
    bannerUrl,
    counts,
  } = props

  // Priority: custom cover > sport-specific image > generic fallback
  const sportHeroImage = getSportHeroImage(primarySportKey ?? primarySportLabel)
  const heroImageSrc = bannerUrl && bannerUrl.trim().length > 0 ? bannerUrl : sportHeroImage

  // Sport thumbnail for chip
  const sportThumb = primarySportLabel
    ? getSportThumbImage(primarySportKey ?? primarySportLabel)
    : null

  // Profile URL for stats links
  const profileHref = username ? `/profile/${username}` : "/profile/me"

  // Determine glow color based on sport index
  const glowColor = sportIndex >= 1000 ? "gold"
    : sportIndex >= 500 ? "silver"
    : sportIndex >= 100 ? "bronze"
    : null

  return (
    <div className="relative">
      <HeroBanner
        imageSrc={heroImageSrc}
        data-testid="profile-hero"
        glowColor={glowColor}
        topRight={
          isOwnProfile ? (
            <Link href={onEditHref}>
              <Button
                data-testid="profile-edit-btn"
                type="button"
                variant="outline"
                className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          ) : undefined
        }
      >
        {/* Content directly on the hero - NO container box */}
        <div className="h-full w-full flex flex-col justify-end pb-12 md:pb-14 px-6 md:px-8">
          {/* Primary Sport Pill - prominent glass effect */}
          {primarySportLabel && (
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
                    alt={primarySportLabel}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                )}
                {primarySportLabel}
              </span>
              {/* DEBUG: Show sport key being used for hero image - REMOVE AFTER VERIFICATION */}
              {process.env.NODE_ENV === "development" && (
                <span className="text-[10px] px-2 py-1 bg-yellow-500/80 text-black rounded font-mono">
                  SPORT_KEY: {primarySportKey ?? primarySportLabel ?? "none"}
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
              {displayName}
            </h1>
          </motion.div>

          {/* Handle/Email */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-1"
          >
            <span className="text-lg text-white/70 font-light">{handleOrEmail}</span>
          </motion.div>

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
            {joinedLabel && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {joinedLabel}
              </span>
            )}
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
        <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full border-4 border-background shadow-2xl">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-primary/80 text-2xl md:text-3xl font-bold text-primary-foreground">
              {displayName?.slice(0, 2)?.toUpperCase() || "U"}
            </div>
          )}
        </div>
      </motion.div>

      {/* Floating Stats - Right side breach */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35 }}
        className="absolute -bottom-4 right-6 md:right-8 z-30"
      >
        <div className="flex items-center gap-4 bg-background/90 backdrop-blur-md rounded-2xl border border-border shadow-xl px-5 py-3">
          <StatBadge value={counts.activities} label="Activities" href={profileHref} />
          <div className="w-px h-8 bg-border" />
          <StatBadge value={counts.followers} label="Followers" href={`${profileHref}?tab=followers`} />
          <div className="w-px h-8 bg-border" />
          <StatBadge value={counts.following} label="Following" href={`${profileHref}?tab=following`} />
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
