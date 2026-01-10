"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Settings, UserPlus, UserMinus, Calendar, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ResolvedHero } from "@/lib/hero/heroResolver"
import { useState } from "react"

// Category-specific Unsplash fallbacks (guaranteed to work)
const CATEGORY_FALLBACKS: Record<string, string> = {
  endurance: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1920&q=80",
  strength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80",
  water: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80",
  winter: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=1920&q=80",
  team: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1920&q=80",
  racket: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=80",
  combat: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1920&q=80",
  outdoor: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1920&q=80",
  mindbody: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80",
  generic: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80",
}

// Default hero image when nothing else is available
const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1920&q=80"

interface UserSport {
  id: string
  sportId: string
  isPrimary: boolean
  sport: {
    id: string
    name: string
    slug: string
  }
}

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
  sports: UserSport[]
  isCurrentUser: boolean
  isFollowing: boolean
  onFollow?: () => void
  onUnfollow?: () => void
}

export function ProfileHeaderHero({
  user,
  stats,
  hero,
  sports,
  isCurrentUser,
  isFollowing,
  onFollow,
  onUnfollow,
}: ProfileHeaderHeroProps) {
  const initials = (user.displayName || user.username || "U")
    .substring(0, 2)
    .toUpperCase()

  // Image URL resolution with multiple fallbacks
  const primaryImage = hero?.imageUrl ?? DEFAULT_HERO_IMAGE
  const fallbackImage = CATEGORY_FALLBACKS[hero?.category ?? "generic"] ?? DEFAULT_HERO_IMAGE

  // State for image error handling
  const [imageSrc, setImageSrc] = useState(primaryImage)
  const [hasError, setHasError] = useState(false)

  const objectPosition = hero?.image?.objectPosition ?? "50% 35%"

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackImage)
    }
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  // Primary sport for display
  const primarySport = sports.find(s => s.isPrimary) ?? sports[0]

  return (
    <section
      data-testid="profile-hero"
      className="relative w-full overflow-hidden h-[280px] md:h-[320px]"
    >
      {/* Background Hero Image */}
      <div className="absolute inset-0">
        <Image
          data-testid="profile-hero-image"
          src={imageSrc}
          alt={`${hero?.sportName ?? "Sport"} background`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition }}
          onError={handleImageError}
        />

        {/* Left-to-right dark gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

        {/* Subtle bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Edit Profile Button - Top Right on Hero */}
      <div className="absolute top-4 right-4 z-20">
        {isCurrentUser ? (
          <Link href="/settings/profile">
            <Button
              data-testid="profile-edit-btn"
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/25 hover:bg-white/30 backdrop-blur-sm"
            >
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
                className="bg-white/20 text-white border-white/25 hover:bg-white/30 backdrop-blur-sm"
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
          </>
        )}
      </div>

      {/* Left Overlay Panel - Dark glassmorphism card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10",
          "w-[calc(100%-2rem)] max-w-[380px]",
          "bg-black/40 backdrop-blur-md rounded-xl",
          "border border-white/15 shadow-2xl",
          "p-5 md:p-6"
        )}
      >
        {/* Avatar + Name Row */}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 md:h-24 md:w-24 ring-4 ring-white/20 shadow-xl flex-shrink-0">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName ?? "User"} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xl md:text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white truncate">
              {user.displayName || user.username || "Athlete"}
            </h1>
            {user.username && user.displayName && (
              <p className="text-sm text-white/60 truncate">@{user.username}</p>
            )}

            {/* Location & Joined */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-white/70">
              {user.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="mt-3 text-sm text-white/80 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Primary Sport Chip */}
        {primarySport && (
          <div className="mt-4">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              "bg-orange-500/90 text-white ring-2 ring-orange-400/50 shadow-lg shadow-orange-500/20"
            )}>
              <Trophy className="w-3.5 h-3.5" />
              {primarySport.sport.name}
            </span>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <div className="flex items-center gap-6">
            <Link
              href={`/profile/${user.username || user.id}/activities`}
              className="group text-center"
            >
              <p className="text-xl font-bold text-white tabular-nums group-hover:text-orange-400 transition-colors">
                {stats.activities}
              </p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Activities</p>
            </Link>
            <Link
              href={`/profile/${user.username || user.id}/followers`}
              className="group text-center"
            >
              <p className="text-xl font-bold text-white tabular-nums group-hover:text-orange-400 transition-colors">
                {stats.followers}
              </p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Followers</p>
            </Link>
            <Link
              href={`/profile/${user.username || user.id}/following`}
              className="group text-center"
            >
              <p className="text-xl font-bold text-white tabular-nums group-hover:text-orange-400 transition-colors">
                {stats.following}
              </p>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Following</p>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Photo credit - bottom right */}
      {hero?.image?.credit?.name && (
        <div className="absolute bottom-3 right-4 z-10 text-[10px] text-white/40">
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
    </section>
  )
}
