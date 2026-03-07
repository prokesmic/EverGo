"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { UserPlus, Users, ArrowRight, Loader2, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SuggestedAthlete {
  id: string
  username: string | null  // Privacy: use this for profile URLs, not id
  displayName: string
  avatarUrl: string | null
  city: string | null
  country?: string | null
  primarySport: string | null
  mutualFollows: number
  totalActivities: number
  isFollowing: boolean
  score?: number
}

interface SuggestedAthletesProps {
  variant?: "cards" | "list"
  title?: string
  limit?: number
  mode?: "near" | "sport" | "fof"
  className?: string
}

/**
 * Unified component for athlete recommendations.
 * Supports two display variants:
 * - "cards": Grid/carousel layout for main content area
 * - "list": Compact list for sidebars
 */
export function SuggestedAthletes({
  variant = "cards",
  title = "Suggested Athletes",
  limit = variant === "cards" ? 12 : 6,
  mode,
  className,
}: SuggestedAthletesProps) {
  const [suggestions, setSuggestions] = useState<SuggestedAthlete[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [followingLoading, setFollowingLoading] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const params = new URLSearchParams()
        params.set("limit", String(limit))
        if (mode) {
          params.set("mode", mode)
        }

        const response = await fetch(`/api/social/suggestions?${params.toString()}`)
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setFollowing(
          new Set(
            data.suggestions
              ?.filter((s: SuggestedAthlete) => s.isFollowing)
              .map((s: SuggestedAthlete) => s.id) || []
          )
        )
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [limit, mode])

  const handleFollow = useCallback(async (userId: string) => {
    setFollowingLoading((prev) => new Set([...prev, userId]))

    try {
      const response = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setFollowing((prev) => new Set([...prev, userId]))
        // Optimistically remove from suggestions
        setSuggestions((prev) => prev.filter((s) => s.id !== userId))
      }
    } catch (error) {
      console.error("Error following user:", error)
    } finally {
      setFollowingLoading((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }, [])

  // Get reason text for why this athlete is suggested
  const getReasonText = (athlete: SuggestedAthlete): string => {
    if (athlete.mutualFollows > 0) {
      return `${athlete.mutualFollows} mutual${athlete.mutualFollows > 1 ? "s" : ""}`
    }
    if (athlete.primarySport) {
      return athlete.primarySport
    }
    if (athlete.city) {
      return athlete.city
    }
    return `${athlete.totalActivities} activities`
  }

  // Filter out already followed
  const visibleSuggestions = suggestions
    .filter((s) => !following.has(s.id))
    .slice(0, limit)

  if (loading) {
    return variant === "cards" ? (
      <LoadingCardsState />
    ) : (
      <LoadingListState />
    )
  }

  // Hide if no suggestions
  if (visibleSuggestions.length === 0) {
    return null
  }

  if (variant === "list") {
    return (
      <Card className={cn("border-border-subtle", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-orange-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleSuggestions.map((athlete) => (
            <AthleteListItem
              key={athlete.id}
              athlete={athlete}
              isLoading={followingLoading.has(athlete.id)}
              onFollow={handleFollow}
              reason={getReasonText(athlete)}
            />
          ))}

          {suggestions.length > limit && (
            <Link href="/discover/athletes">
              <Button variant="ghost" size="sm" className="w-full text-xs text-orange-600">
                See All Suggestions
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  // Cards variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl bg-gradient-to-br from-white via-white to-orange-50/30 backdrop-blur-md border border-slate-200/60 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">
              Follow athletes to see their activities in your feed
            </p>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleSuggestions.map((athlete, index) => (
            <AthleteCard
              key={athlete.id}
              athlete={athlete}
              index={index}
              isLoading={followingLoading.has(athlete.id)}
              onFollow={handleFollow}
              reason={getReasonText(athlete)}
            />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
        <Link href="/discover/athletes">
          <Button
            variant="ghost"
            className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            Discover More Athletes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ===== Sub-components =====

function AthleteCard({
  athlete,
  index,
  isLoading,
  onFollow,
  reason,
}: {
  athlete: SuggestedAthlete
  index: number
  isLoading: boolean
  onFollow: (id: string) => void
  reason: string
}) {
  const initials = athlete.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "relative rounded-xl p-4 text-center transition-all duration-200",
        "bg-slate-50/80 hover:bg-white hover:shadow-md",
        "border border-transparent hover:border-slate-200"
      )}
    >
      <Link href={`/profile/${athlete.username || athlete.id}`} className="block mb-3">
        <Avatar className="w-14 h-14 mx-auto ring-2 ring-white shadow-sm">
          <AvatarImage src={athlete.avatarUrl || undefined} alt={athlete.displayName} />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Link href={`/profile/${athlete.username || athlete.id}`} className="block hover:underline">
        <h4 className="font-medium text-sm text-slate-900 truncate">{athlete.displayName}</h4>
      </Link>

      <p className="text-xs text-slate-500 mt-0.5 truncate">{reason}</p>

      <Button
        size="sm"
        onClick={() => onFollow(athlete.id)}
        disabled={isLoading}
        className="w-full mt-3 h-8 text-xs bg-orange-500 hover:bg-orange-600"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-1" />
            Follow
          </>
        )}
      </Button>
    </motion.div>
  )
}

function AthleteListItem({
  athlete,
  isLoading,
  onFollow,
  reason,
}: {
  athlete: SuggestedAthlete
  isLoading: boolean
  onFollow: (id: string) => void
  reason: string
}) {
  const initials = athlete.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
      <Link href={`/profile/${athlete.username || athlete.id}`}>
        <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all">
          <AvatarImage src={athlete.avatarUrl || undefined} alt={athlete.displayName} />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${athlete.username || athlete.id}`} className="hover:underline">
          <h4 className="font-semibold text-sm text-slate-900 truncate">{athlete.displayName}</h4>
        </Link>

        <p className="text-xs text-slate-500 mt-0.5 truncate">{reason}</p>

        {athlete.totalActivities > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <Trophy className="w-3 h-3" />
            <span>{athlete.totalActivities} activities</span>
          </div>
        )}
      </div>

      <Button
        size="sm"
        onClick={() => onFollow(athlete.id)}
        disabled={isLoading}
        className="text-xs h-7 px-3 shrink-0 bg-orange-500 hover:bg-orange-600"
      >
        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Follow"}
      </Button>
    </div>
  )
}

function LoadingCardsState() {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 p-8">
      <div className="flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Finding athletes for you...</span>
      </div>
    </div>
  )
}

function LoadingListState() {
  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-7 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedAthletes
