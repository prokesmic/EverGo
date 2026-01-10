'use client'

/**
 * V6 Welcome Hero Component
 *
 * Profile-style hero for the home page with:
 * - Full cover photo with gradient overlay
 * - Avatar with ring
 * - Name, email, location, join date
 * - Primary sport badge
 * - Stats strip (activities, followers, following)
 * - Metrics cards (Sport Index, Streak, This Week, Active Time, Activities)
 */

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Calendar,
  Settings,
  Zap,
  Flame,
  Route,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface WelcomeHeroProps {
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
  className?: string
}

// Sport emoji mapping
const SPORT_EMOJIS: Record<string, string> = {
  running: '🏃',
  cycling: '🚴',
  swimming: '🏊',
  kitesurfing: '🪁',
  hiking: '🥾',
  gym: '🏋️',
  yoga: '🧘',
  tennis: '🎾',
  skiing: '⛷️',
  snowboarding: '🏂',
  surfing: '🏄',
  climbing: '🧗',
  rowing: '🚣',
  default: '🏅'
}

export function WelcomeHero({
  user,
  primarySport,
  stats,
  metrics,
  className
}: WelcomeHeroProps) {
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
    ? 'text-emerald-500'
    : metrics.sportIndexDelta < 0
      ? 'text-red-500'
      : 'text-slate-400'

  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-white shadow-sm", className)}>
      {/* Cover Photo Section */}
      <div className="relative h-56 md:h-64">
        {user.coverPhotoUrl ? (
          <Image
            src={user.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          /* Default gradient if no cover photo */
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500" />
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Edit Profile Button */}
        <div className="absolute top-4 right-4">
          <Link href="/settings/profile">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 bg-white/90 hover:bg-white text-slate-700"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Info Overlay */}
      <div className="relative px-6 pb-6">
        {/* Avatar - positioned to overlap cover */}
        <div className="flex items-end gap-4 -mt-16 mb-4">
          <Link href={`/profile/${user.username ?? user.id}`}>
            <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-white shadow-xl ring-4 ring-orange-500">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-3xl md:text-4xl bg-orange-500 text-white font-semibold">
                {(user.displayName ?? user.username ?? 'U')[0].toUpperCase()}
                {(user.displayName ?? user.username ?? 'U')[1]?.toUpperCase() ?? ''}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Name and details */}
          <div className="flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {user.displayName ?? user.username ?? 'Athlete'}
            </h1>

            {user.email && (
              <p className="text-slate-500 text-sm">@{user.email.split('@')[0]}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
              {user.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {user.city}{user.country ? `, ${user.country}` : ''}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Joined {joinMonthYear}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-slate-600 mb-4">{user.bio}</p>
        )}

        {/* Primary Sport Badge */}
        {primarySport && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium shadow-sm">
              <span className="text-lg">{sportEmoji}</span>
              {primarySport.name}
            </span>
          </div>
        )}

        {/* Stats Strip */}
        <div className="flex items-center gap-8 mb-6 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.activities}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Activities</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.followers}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.following}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Following</div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Sport Index */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-2xl font-bold text-slate-900">{metrics.sportIndex}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <TrendIcon className={cn("w-3 h-3", trendColor)} />
              <span className={cn("text-xs font-medium", trendColor)}>
                {metrics.sportIndexDelta > 0 ? '+' : ''}{metrics.sportIndexDelta}
              </span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Sport Index</div>
          </div>

          {/* Day Streak */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-2xl font-bold text-slate-900">{metrics.dayStreak}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Day Streak</div>
          </div>

          {/* This Week km */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Route className="w-4 h-4 text-teal-500" />
              <span className="text-2xl font-bold text-slate-900">{metrics.thisWeekKm.toFixed(1)}</span>
              <span className="text-sm text-slate-500">km</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">This Week</div>
          </div>

          {/* Active Time */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-teal-500" />
              <span className="text-2xl font-bold text-slate-900">{metrics.activeTimeMinutes}</span>
              <span className="text-sm text-slate-500">m</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Active Time</div>
          </div>

          {/* Activities */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-4 h-4 text-teal-500" />
              <span className="text-2xl font-bold text-slate-900">{metrics.weekActivities}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Activities</div>
          </div>
        </div>
      </div>
    </div>
  )
}
