/**
 * HeroIdentityPanel - Compact identity strip for hero banners
 *
 * A glass panel that sits at the bottom edge of the hero banner.
 * Contains: Avatar (small, inline) + Display Name + Inline Stats Row
 *
 * This replaces the previous floating avatar + floating stats box approach
 * with a single, unified panel that doesn't overflow the hero bounds.
 */

"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HeroIdentityPanelProps {
  /** Display name to show */
  displayName: string
  /** Optional username for handle display */
  username?: string | null
  /** Avatar image URL */
  avatarUrl?: string | null
  /** Stats to display inline */
  stats: {
    activities: number
    followers: number
    following: number
  }
  /** Link for avatar click */
  profileHref?: string
  /** Custom class for the panel */
  className?: string
}

export function HeroIdentityPanel({
  displayName,
  username,
  avatarUrl,
  stats,
  profileHref = "/profile/me",
  className,
}: HeroIdentityPanelProps) {
  // Get initials for fallback avatar
  const initials = (displayName ?? "U").slice(0, 2).toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn(
        // Glass panel styling
        "bg-white/70 dark:bg-slate-900/70",
        "backdrop-blur-xl backdrop-saturate-150",
        "border border-white/30 dark:border-white/10",
        "rounded-2xl shadow-2xl",
        "px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar - Small and inline */}
        <Link href={profileHref} className="shrink-0 group">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white/50 shadow-lg group-hover:scale-105 transition-transform">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground">
                {initials}
              </div>
            )}
          </div>
        </Link>

        {/* Name + Handle */}
        <div className="flex-1 min-w-0">
          <Link
            href={profileHref}
            className="block hover:opacity-80 transition-opacity"
          >
            <div className="font-bold text-foreground truncate">
              {displayName}
            </div>
            {username && (
              <div className="text-xs text-muted-foreground truncate">
                @{username}
              </div>
            )}
          </Link>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-border/50" />

        {/* Inline Stats Row */}
        <div className="flex items-center gap-4 sm:gap-6">
          <InlineStat
            value={stats.activities}
            label="Activities"
            href={profileHref}
          />
          <InlineStat
            value={stats.followers}
            label="Followers"
            href={`${profileHref}?tab=followers`}
          />
          <InlineStat
            value={stats.following}
            label="Following"
            href={`${profileHref}?tab=following`}
          />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Compact inline stat display
 */
function InlineStat({
  value,
  label,
  href,
}: {
  value: number
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center hover:opacity-70 transition-opacity"
    >
      <span className="text-base sm:text-lg font-bold text-foreground leading-none">
        {formatNumber(value)}
      </span>
      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
        {label}
      </span>
    </Link>
  )
}

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
