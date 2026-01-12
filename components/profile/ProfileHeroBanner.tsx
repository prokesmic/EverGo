// components/profile/ProfileHeroBanner.tsx
// Stunning immersive profile hero with identity panel inside the banner
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "@/components/hero/HeroBanner"
import { HeroIdentityPanel } from "@/components/hero/HeroIdentityPanel"
import { resolveHeroImage } from "@/lib/hero/resolveHeroImage"
import { getSportThumbImage } from "@/lib/sports/media"
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

  // Resolve hero image using single source of truth
  const heroImageSrc = resolveHeroImage({
    coverPhotoUrl: bannerUrl,
    sportKey: primarySportKey,
    sportName: primarySportLabel,
  })

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
        {/* Content directly on the hero */}
        <div className="h-full w-full flex flex-col justify-between p-4 md:p-6">
          {/* Top Section: Sport Pill + Location */}
          <div className="flex items-start justify-between">
            {primarySportLabel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                  {sportThumb && (
                    <Image
                      src={sportThumb}
                      alt={primarySportLabel}
                      width={18}
                      height={18}
                      className="rounded-full object-cover"
                    />
                  )}
                  {primarySportLabel}
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
              {joinedLabel && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {joinedLabel}
                </span>
              )}
            </motion.div>
          </div>

          {/* Bottom Section: Identity Panel */}
          <HeroIdentityPanel
            displayName={displayName}
            username={username}
            avatarUrl={avatarUrl}
            stats={counts}
            profileHref={profileHref}
          />
        </div>
      </HeroBanner>
    </div>
  )
}
