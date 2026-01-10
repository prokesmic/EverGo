// components/hero/HomeHeroBanner.tsx
// Home page hero banner - uses sport-specific images based on user's primary sport
// Simplified: Identity only in overlay, metrics in ribbon below
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "./HeroBanner"
import { cn } from "@/lib/utils"
import { getSportHeroImage, getSportThumbImage } from "@/lib/sports/media"

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
}

export function HomeHeroBanner({
  user,
  primarySport,
  stats,
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

  // Get sport-specific hero image based on primary sport
  // Priority: user's cover photo > sport-specific image > generic fallback
  const sportHeroImage = getSportHeroImage(primarySport?.slug ?? primarySport?.name)
  const heroImageSrc = user.coverPhotoUrl || sportHeroImage

  // Sport thumbnail for chip
  const sportThumb = primarySport
    ? getSportThumbImage(primarySport.slug ?? primarySport.name)
    : null

  return (
    <HeroBanner
      imageSrc={heroImageSrc}
      heightClass="h-[320px]"
      data-testid="home-hero"
      topRight={
        <Link href="/activity/create">
          <Button
            data-testid="home-log-activity-btn"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Log Activity
          </Button>
        </Link>
      }
    >
      {/* Left overlay panel - dark glassmorphism card */}
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
            <Link
              href="/profile/me"
              className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-lg hover:border-white transition-colors"
            >
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-primary text-xl md:text-2xl font-bold">
                  {(user.displayName ?? user.username ?? "U").slice(0, 2).toUpperCase()}
                </div>
              )}
            </Link>

            {/* Name + Meta */}
            <div className="min-w-0 flex-1">
              <Link href="/profile/me" className="hover:opacity-80 transition-opacity">
                <div className="text-xl md:text-2xl font-semibold leading-tight truncate">
                  {user.displayName ?? user.username ?? "Athlete"}
                </div>
              </Link>
              {user.username && (
                <div className="truncate text-sm text-white/80">@{user.username}</div>
              )}

              {/* Location & Joined */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/80">
                {locationLabel && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {locationLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {joinMonthYear}
                </span>
              </div>

              {/* Primary Sport Chip with thumbnail */}
              {primarySport && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium">
                  {sportThumb && (
                    <Image
                      src={sportThumb}
                      alt={primarySport.name}
                      width={16}
                      height={16}
                      className="rounded-full object-cover"
                    />
                  )}
                  {primarySport.name}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-3 gap-4">
            <StatItem label="ACTIVITIES" value={stats.activities} href="/profile/me" />
            <StatItem label="FOLLOWERS" value={stats.followers} href="/profile/me?tab=followers" />
            <StatItem label="FOLLOWING" value={stats.following} href="/profile/me?tab=following" />
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
