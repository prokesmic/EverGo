'use client'

/**
 * V6 Hero Banner Component
 *
 * Competition-focused hero with:
 * - Sports identity badges
 * - Power front & center
 * - Competition status bar (ranks, gauntlets, rivalry record)
 */

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MapPin,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Swords,
  Trophy,
  Globe,
  Building2
} from 'lucide-react'
import { getSportEmoji } from '@/lib/sports/sportIcons'

interface HeroBannerProps {
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
    coverPhotoUrl: string | null
    city: string | null
    country: string | null
  }
  primarySports: Array<{
    id: string
    name: string
    slug: string
  }>
  weeklyPower: {
    current: number
    delta: number
  }
  seasonRanks: {
    global: number | null
    city: number | null
    cityName: string | null
  }
  competitionStats: {
    activeGauntlets: number
    rivalryWins: number
    rivalryLosses: number
  }
  className?: string
}

export function HeroBanner({
  user,
  primarySports,
  weeklyPower,
  seasonRanks,
  competitionStats,
  className
}: HeroBannerProps) {
  const TrendIcon = weeklyPower.delta > 0
    ? TrendingUp
    : weeklyPower.delta < 0
      ? TrendingDown
      : Minus

  const trendColor = weeklyPower.delta > 0
    ? 'text-emerald-400'
    : weeklyPower.delta < 0
      ? 'text-red-400'
      : 'text-slate-400'

  const hasRivalries = competitionStats.rivalryWins + competitionStats.rivalryLosses > 0

  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      {/* Cover Photo */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-slate-800 to-slate-900">
        {user.coverPhotoUrl ? (
          <Image
            src={user.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">

        {/* Top Row: Avatar + Identity + Power */}
        <div className="flex items-end justify-between mb-4">

          {/* Left: Avatar + Name + Location */}
          <div className="flex items-end gap-4">
            <Link href={`/profile/${user.username ?? user.id}`}>
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl md:text-2xl bg-emerald-600 text-white">
                  {(user.displayName ?? user.username ?? '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="pb-1">
              <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                {user.displayName ?? user.username ?? 'Athlete'}
              </h1>
              {user.city && (
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  {user.city}{user.country ? `, ${user.country}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Right: Power Card */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            <div className="text-xs text-white/60 uppercase tracking-wide mb-1">
              This Week
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {weeklyPower.current.toLocaleString()}
              </span>
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className={cn("flex items-center gap-1 text-sm mt-1", trendColor)}>
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{weeklyPower.delta > 0 ? '+' : ''}{weeklyPower.delta}</span>
              <span className="text-white/40">vs last week</span>
            </div>
          </div>
        </div>

        {/* Sports Badges */}
        {primarySports.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {primarySports.slice(0, 4).map((sport) => (
              <Link
                key={sport.id}
                href={`/rankings?sport=${sport.slug}`}
                className="group"
              >
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20 hover:bg-white/20 transition-colors">
                  <span className="text-lg">
                    {getSportEmoji(sport.slug)}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {sport.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Competition Status Bar */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">

          {/* Global Rank */}
          {seasonRanks.global && (
            <div className="flex items-center gap-1.5 text-white/90">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">#{seasonRanks.global}</span>
              <span className="text-white/60 text-sm">Global</span>
            </div>
          )}

          {/* City Rank */}
          {seasonRanks.city && seasonRanks.cityName && (
            <div className="flex items-center gap-1.5 text-white/90">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">#{seasonRanks.city}</span>
              <span className="text-white/60 text-sm">{seasonRanks.cityName}</span>
            </div>
          )}

          {/* Separator */}
          {(seasonRanks.global || seasonRanks.city) && (competitionStats.activeGauntlets > 0 || hasRivalries) && (
            <div className="w-px h-4 bg-white/20 hidden md:block" />
          )}

          {/* Active Gauntlets */}
          {competitionStats.activeGauntlets > 0 && (
            <Link
              href="/gauntlets"
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <Swords className="w-4 h-4 text-orange-400" />
              <span className="font-semibold">{competitionStats.activeGauntlets}</span>
              <span className="text-white/60 text-sm">
                Active {competitionStats.activeGauntlets === 1 ? 'Gauntlet' : 'Gauntlets'}
              </span>
            </Link>
          )}

          {/* Rivalry Record */}
          {hasRivalries && (
            <Link
              href={`/profile/${user.username ?? user.id}?tab=rivalries`}
              className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">
                {competitionStats.rivalryWins}-{competitionStats.rivalryLosses}
              </span>
              <span className="text-white/60 text-sm">vs Rivals</span>
            </Link>
          )}

          {/* No competitions yet */}
          {!seasonRanks.global && !seasonRanks.city &&
            competitionStats.activeGauntlets === 0 && !hasRivalries && (
              <Link
                href="/gauntlets/new"
                className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
              >
                <Swords className="w-4 h-4" />
                <span className="text-sm">Throw your first gauntlet</span>
              </Link>
            )}
        </div>
      </div>
    </div>
  )
}
