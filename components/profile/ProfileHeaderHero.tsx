"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Settings, UserPlus, UserMinus, MoreHorizontal, Calendar, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ResolvedHero } from "@/lib/hero/heroResolver"

interface ProfileHeaderHeroProps {
  user: {
    id: string
    displayName: string | null
    username: string | null
    avatarUrl: string | null
    city: string | null
    bio: string | null
    createdAt: Date
  }
  stats: {
    followers: number
    following: number
    activities: number
  }
  hero: ResolvedHero
  isCurrentUser: boolean
  isFollowing: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}

export function ProfileHeaderHero({
  user,
  stats,
  hero,
  isCurrentUser,
  isFollowing,
  onFollow,
  onUnfollow,
}: ProfileHeaderHeroProps) {
  const initials = (user.displayName || user.username || "U")
    .substring(0, 2)
    .toUpperCase()

  const backgroundImage =
    hero?.imageUrl ??
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80"
  const objectPosition = hero?.image?.objectPosition ?? "50% 35%"

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  return (
    <section className="relative w-full overflow-hidden min-h-[280px] md:min-h-[340px]">
      {/* Sport-specific background image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={`${hero?.sportName ?? "Sport"} background`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1400px"
          className="object-cover"
          style={{ objectPosition }}
        />
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />
      </div>

      {/* Accent glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left: Avatar + User Info */}
          <div className="flex items-start gap-5">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="h-24 w-24 md:h-28 md:w-28 ring-4 ring-white/20 ring-offset-4 ring-offset-slate-900 shadow-2xl">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName ?? "User"} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="flex-1 pt-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {user.displayName || user.username || "Athlete"}
              </h1>
              {user.username && user.displayName && (
                <p className="text-sm text-slate-400 mt-0.5">@{user.username}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-300">
                {user.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {memberSince}
                </span>
                {hero?.sportName && hero.sportName !== "Sport" && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="flex items-center gap-1 text-orange-400 font-medium capitalize">
                      <Trophy className="w-3.5 h-3.5" />
                      {hero.sportName}
                    </span>
                  </>
                )}
              </div>

              {user.bio && (
                <p className="mt-3 text-sm text-slate-300 max-w-lg line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isCurrentUser ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <>
                {isFollowing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onUnfollow}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Following
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={onFollow}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-8">
            <Link
              href={`/profile/${user.username || user.id}/activities`}
              className="group"
            >
              <p className="text-2xl font-bold text-white tabular-nums group-hover:text-orange-400 transition-colors">
                {stats.activities}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Activities</p>
            </Link>
            <Link
              href={`/profile/${user.username || user.id}/followers`}
              className="group"
            >
              <p className="text-2xl font-bold text-white tabular-nums group-hover:text-orange-400 transition-colors">
                {stats.followers}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Followers</p>
            </Link>
            <Link
              href={`/profile/${user.username || user.id}/following`}
              className="group"
            >
              <p className="text-2xl font-bold text-white tabular-nums group-hover:text-orange-400 transition-colors">
                {stats.following}
              </p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Following</p>
            </Link>
          </div>
        </div>

        {/* Photo credit */}
        {hero?.image?.credit?.name && (
          <div className="mt-4 text-[10px] text-white/40">
            Photo:{" "}
            {hero.image.credit.url ? (
              <a
                className="underline hover:text-white/60 transition-colors"
                href={hero.image.credit.url}
                target="_blank"
                rel="noreferrer"
              >
                {hero.image.credit.name}
              </a>
            ) : (
              hero.image.credit.name
            )}
          </div>
        )}
      </div>
    </section>
  )
}
