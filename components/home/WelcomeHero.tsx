'use client'

/**
 * V6 Welcome Hero Component
 *
 * Profile-style hero for the home page - matches profile page design exactly
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
      : 'text-slate-500'

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm overflow-hidden", className)}>
      {/* Cover Photo Area */}
      <div className="relative h-48 md:h-56 lg:h-64">
        {user.coverPhotoUrl ? (
          <Image
            src={user.coverPhotoUrl}
            alt="Cover photo"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300" />
        )}

        {/* Edit Profile Button - Top Right */}
        <div className="absolute top-4 right-4">
          <Link href="/settings/profile">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/95 hover:bg-white border-0 shadow-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Content - Below Cover */}
      <div className="px-6 pb-6">
        {/* Avatar Row */}
        <div className="flex items-end -mt-16 mb-4">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg ring-4 ring-orange-500">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="text-4xl bg-orange-500 text-white font-bold">
              {(user.displayName ?? user.username ?? 'U').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name & Info */}
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {user.displayName ?? user.username ?? 'Athlete'}
          </h1>
          {user.username && (
            <p className="text-slate-500">@{user.username}</p>
          )}
        </div>

        {/* Location & Join Date */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
          {user.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {user.city}{user.country ? `, ${user.country}` : ''}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Joined {joinMonthYear}
          </span>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-slate-600 mb-4">{user.bio}</p>
        )}

        {/* Primary Sport Badge */}
        {primarySport && (
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium text-sm">
              <span>{sportEmoji}</span>
              {primarySport.name}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.activities}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.followers}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.following}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">Following</div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Sport Index */}
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-900">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xl font-bold">{metrics.sportIndex}</span>
            </div>
            <div className={cn("flex items-center justify-center gap-1 text-xs mt-1", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span>{metrics.sportIndexDelta > 0 ? '+' : ''}{metrics.sportIndexDelta}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Sport Index</div>
          </div>

          {/* Day Streak */}
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-900">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xl font-bold">{metrics.dayStreak}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">Day Streak</div>
          </div>

          {/* This Week Distance */}
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-900">
              <Route className="w-4 h-4 text-teal-500" />
              <span className="text-xl font-bold">{metrics.thisWeekKm.toFixed(1)}</span>
              <span className="text-sm text-slate-500">km</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">This Week</div>
          </div>

          {/* Active Time */}
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-900">
              <Clock className="w-4 h-4 text-teal-500" />
              <span className="text-xl font-bold">{metrics.activeTimeMinutes}</span>
              <span className="text-sm text-slate-500">m</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">Active Time</div>
          </div>

          {/* Activities Count */}
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 text-slate-900">
              <Activity className="w-4 h-4 text-teal-500" />
              <span className="text-xl font-bold">{metrics.weekActivities}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-2">Activities</div>
          </div>
        </div>
      </div>
    </div>
  )
}
