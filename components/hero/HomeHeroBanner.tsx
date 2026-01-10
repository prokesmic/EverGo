// components/hero/HomeHeroBanner.tsx
// Home page hero banner - uses the same photo-based pattern as Profile
"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, CalendarDays, Settings, Zap, Flame, Route, Clock, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroBanner, DEFAULT_HERO_BANNER } from "./HeroBanner"
import { cn } from "@/lib/utils"

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
  metrics: {
    sportIndex: number
    sportIndexDelta: number
    dayStreak: number
    thisWeekKm: number
    activeTimeMinutes: number
    weekActivities: number
  }
}

const SPORT_EMOJIS: Record<string, string> = {
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  kitesurfing: '🪁',
  hiking: '🥾',
  gym: '🏋️',
  yoga: '🧘',
  tennis: '🎾',
  default: '🏅'
}

export function HomeHeroBanner({
  user,
  primarySport,
  stats,
  metrics,
}: HomeHeroBannerProps) {
  const joinDate = new Date(user.createdAt)
  const joinMonthYear = joinDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })

  const sportEmoji = primarySport
    ? (SPORT_EMOJIS[primarySport.slug] ?? SPORT_EMOJIS.default)
    : null

  const TrendIcon = metrics.sportIndexDelta > 0
    ? TrendingUp
    : metrics.sportIndexDelta < 0
      ? TrendingDown
      : Minus

  const trendColor = metrics.sportIndexDelta > 0
    ? 'text-emerald-400'
    : metrics.sportIndexDelta < 0
      ? 'text-red-400'
      : 'text-white/60'

  // Format location
  const locationLabel = user.city
    ? `${user.city}${user.country ? `, ${user.country}` : ""}`
    : null

  return (
    <HeroBanner
      imageSrc={user.coverPhotoUrl}
      heightClass="h-[280px]"
      data-testid="home-hero"
      topRight={
        <Link href="/settings/profile">
          <Button
            data-testid="home-edit-btn"
            variant="secondary"
            className="bg-white/20 text-white border border-white/25 hover:bg-white/30 backdrop-blur"
          >
            <Settings className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      }
    >
      {/* Left overlay panel - dark glassmorphism card (same as Profile) */}
      <div className="h-full w-full flex items-center">
        <div
          className={cn(
            "ml-4 md:ml-6 w-[calc(100%-2rem)] max-w-[420px] rounded-2xl border border-white/15 bg-black/35",
            "backdrop-blur-md px-5 py-5 text-white"
          )}
        >
          {/* Avatar + Info Row */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white/70 shadow-lg">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-orange-500 text-xl md:text-2xl font-bold">
                  {(user.displayName ?? user.username ?? "U").slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + Meta */}
            <div className="min-w-0 flex-1">
              <div className="text-xl md:text-2xl font-semibold leading-tight truncate">
                {user.displayName ?? user.username ?? "Athlete"}
              </div>
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

              {/* Primary Sport Chip */}
              {primarySport && (
                <div className="mt-3 inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-medium">
                  <span className="mr-1">{sportEmoji}</span> {primarySport.name}
                </div>
              )}
            </div>
          </div>

          {/* Stats + Metrics Row */}
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-3 gap-4">
            <StatItem label="ACTIVITIES" value={stats.activities} />
            <StatItem label="FOLLOWERS" value={stats.followers} />
            <StatItem label="FOLLOWING" value={stats.following} />
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 text-sm">
            {/* Sport Index */}
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">{metrics.sportIndex}</span>
              <div className={cn("flex items-center gap-0.5 text-xs", trendColor)}>
                <TrendIcon className="w-3 h-3" />
                <span>{metrics.sportIndexDelta > 0 ? '+' : ''}{metrics.sportIndexDelta}</span>
              </div>
            </div>

            {/* Day Streak */}
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-semibold">{metrics.dayStreak}</span>
              <span className="text-xs text-white/60">streak</span>
            </div>

            {/* This Week */}
            <div className="flex items-center gap-1.5">
              <Route className="w-4 h-4 text-teal-400" />
              <span className="font-semibold">{metrics.thisWeekKm.toFixed(1)}</span>
              <span className="text-xs text-white/60">km</span>
            </div>

            {/* Active Time */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="font-semibold">{metrics.activeTimeMinutes}</span>
              <span className="text-xs text-white/60">min</span>
            </div>
          </div>
        </div>
      </div>
    </HeroBanner>
  )
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-xl font-semibold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] tracking-wide text-white/70">{label}</div>
    </div>
  )
}
