// components/profile/ProfileHeroBanner.tsx
// Stunning immersive profile hero - avatar and stats integrated inside the banner
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "@/components/hero/HeroBanner"
import { resolveHeroImage } from "@/lib/hero/resolveHeroImage"
import { getSportThumbImage } from "@/lib/sports/media"

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

  /** Bottom dock slot (e.g., HeroRibbon) - renders inside hero at bottom */
  bottomDock?: React.ReactNode
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
    bottomDock,
  } = props

  // Resolve hero image using single source of truth (handles placeholder detection)
  const heroImageSrc = resolveHeroImage({
    bannerUrl: bannerUrl,
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
        bottomDock={bottomDock}
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
        {/* Content directly on the hero - uses flex to fill available space */}
        <div className="h-full w-full flex flex-col justify-end pb-4 px-6 md:px-8">
          {/* Primary Sport Pill */}
          {primarySportLabel && (
            <div className="mb-3 flex items-center gap-2">
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
            </div>
          )}

          {/* Identity Row: Avatar + Name/Username */}
          <div className="flex items-center gap-4">
            {/* Avatar - Small, inline, inside hero */}
            <div className="shrink-0 relative h-14 w-14 md:h-16 md:w-16 overflow-hidden rounded-full border-2 border-white/30 shadow-xl">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-primary/80 text-lg md:text-xl font-bold text-primary-foreground">
                  {displayName?.slice(0, 2)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Name + Handle */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-2xl truncate">
                {displayName}
              </h1>
              <span className="text-sm text-white/70 font-light">{handleOrEmail}</span>
            </div>
          </div>

          {/* Location & Joined */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60 font-light">
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
          </div>
        </div>
      </HeroBanner>

      {/* Stats Strip - Outside hero, below banner */}
      <div className="mt-4 px-4 md:px-6">
        <div className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
          <StatsStripItem value={counts.activities} label="Activities" href={profileHref} />
          <div className="w-px h-6 bg-border mx-4" />
          <StatsStripItem value={counts.followers} label="Followers" href={`${profileHref}?tab=followers`} />
          <div className="w-px h-6 bg-border mx-4" />
          <StatsStripItem value={counts.following} label="Following" href={`${profileHref}?tab=following`} />
        </div>
      </div>
    </div>
  )
}

function StatsStripItem({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link href={href} className="text-center hover:opacity-70 transition-opacity">
      <div className="text-base font-semibold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </Link>
  )
}
