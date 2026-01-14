// components/hero/HomeHeroBanner.tsx
// Stunning immersive hero - avatar and stats integrated inside the banner
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Plus, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner } from "./HeroBanner"
import { resolveHeroImage } from "@/lib/hero/resolveHeroImage"
import { getSportThumbImage } from "@/lib/sports/media"

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
  /** Bottom dock slot (e.g., HeroRibbon) - renders inside hero at bottom */
  bottomDock?: React.ReactNode
}

export function HomeHeroBanner({
  user,
  primarySport,
  stats,
  sportIndex = 0,
  bottomDock,
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

  // Resolve hero image using single source of truth (handles placeholder detection)
  const heroImageSrc = resolveHeroImage({
    bannerUrl: user.coverPhotoUrl,
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
        bottomDock={bottomDock}
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
        {/* Content directly on the hero - uses flex to fill available space */}
        <div className="h-full w-full flex flex-col justify-end pb-4 px-6 md:px-8">
          {/* Identity Section: Large Avatar with Name */}
          <div className="flex items-end gap-5 md:gap-6">
            {/* Avatar - Large, prominent */}
            <Link
              href="/profile/me"
              className="shrink-0 relative h-24 w-24 md:h-32 md:w-32 lg:h-36 lg:w-36 overflow-hidden rounded-2xl border-3 border-white/40 shadow-2xl hover:scale-[1.02] transition-transform ring-2 ring-white/20 ring-offset-2 ring-offset-transparent"
            >
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-primary/80 text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
                  {(user.displayName ?? user.username ?? "U").slice(0, 2).toUpperCase()}
                </div>
              )}
            </Link>

            {/* Name, Username, Meta */}
            <div className="min-w-0 flex-1 pb-1">
              {/* Primary Sport Pill */}
              {primarySport && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
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
                  </span>
                </div>
              )}

              {/* Name + Username */}
              <Link href="/profile/me" className="group">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-2xl group-hover:text-white/90 transition-colors truncate">
                  {user.displayName ?? user.username ?? "Athlete"}
                </h1>
              </Link>
              {user.username && (
                <span className="text-sm text-white/70 font-light">@{user.username}</span>
              )}

              {/* Location & Joined */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60 font-light">
                {locationLabel && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Joined {joinMonthYear}
                </span>
              </div>
            </div>
          </div>
        </div>
      </HeroBanner>

      {/* Stats Strip - Outside hero, below banner */}
      <div className="mt-4 px-4 md:px-6">
        <div className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
          <StatsStripItem value={stats.activities} label="Activities" href="/profile/me" />
          <div className="w-px h-6 bg-border mx-4" />
          <StatsStripItem value={stats.followers} label="Followers" href="/profile/me?tab=followers" />
          <div className="w-px h-6 bg-border mx-4" />
          <StatsStripItem value={stats.following} label="Following" href="/profile/me?tab=following" />
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
