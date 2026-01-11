// components/profile/ProfileHeroBanner.tsx
// USES SHARED HeroBanner component - MUST match Home hero exactly
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "@/components/hero/HeroBanner"
import { cn } from "@/lib/utils"
import { getSportHeroImage, getSportThumbImage } from "@/lib/sports/media"

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
    avatarUrl,
    bannerUrl,
    counts,
  } = props

  // Priority: custom cover > sport-specific image > generic fallback
  // This matches Home hero logic exactly
  const sportHeroImage = getSportHeroImage(primarySportKey ?? primarySportLabel)
  const heroImageSrc = bannerUrl && bannerUrl.trim().length > 0 ? bannerUrl : sportHeroImage

  // Sport thumbnail for chip (matches Home)
  const sportThumb = primarySportLabel
    ? getSportThumbImage(primarySportKey ?? primarySportLabel)
    : null

  // Profile URL for stats links
  const profileHref = username ? `/profile/${username}` : "/profile/me"

  return (
    <HeroBanner
      imageSrc={heroImageSrc}
      heightClass="h-[320px]"
      data-testid="profile-hero"
      topRight={
        isOwnProfile ? (
          <Link href={onEditHref}>
            <Button
              data-testid="profile-edit-btn"
              type="button"
              variant="outline"
              className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        ) : undefined
      }
    >
      {/* Left overlay panel - EXACT SAME as Home */}
      <div className="h-full w-full flex items-center">
        <div
          className={cn(
            "ml-4 md:ml-6 w-[calc(100%-2rem)] max-w-[400px] rounded-2xl border border-white/15 bg-black/40",
            "backdrop-blur-md px-5 py-5 text-white"
          )}
        >
          {/* Avatar + Info Row */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-lg">
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-primary text-xl md:text-2xl font-bold">
                  {displayName?.slice(0, 2)?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Name + Meta */}
            <div className="min-w-0 flex-1">
              <div className="text-xl md:text-2xl font-semibold leading-tight truncate">
                {displayName}
              </div>
              <div className="truncate text-sm text-white/80">{handleOrEmail}</div>

              {/* Location & Joined */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/80">
                {locationLabel && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locationLabel}
                  </span>
                )}
                {joinedLabel && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {joinedLabel}
                  </span>
                )}
              </div>

              {/* Primary Sport Chip with thumbnail - matches Home */}
              {primarySportLabel && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium">
                  {sportThumb && (
                    <Image
                      src={sportThumb}
                      alt={primarySportLabel}
                      width={16}
                      height={16}
                      className="rounded-full object-cover"
                    />
                  )}
                  {primarySportLabel}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row - EXACT SAME as Home */}
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-3 gap-4">
            <StatItem label="ACTIVITIES" value={counts.activities} href={profileHref} />
            <StatItem label="FOLLOWERS" value={counts.followers} href={`${profileHref}?tab=followers`} />
            <StatItem label="FOLLOWING" value={counts.following} href={`${profileHref}?tab=following`} />
          </div>
        </div>
      </div>
    </HeroBanner>
  )
}

function StatItem({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="text-center hover:opacity-80 transition-opacity">
      <div className="text-xl font-semibold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] tracking-wide text-white/70">{label}</div>
    </Link>
  )
}
