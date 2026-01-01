"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserPlus, RefreshCw, ArrowRight, Loader2, MapPin, Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { cn } from "@/lib/utils"

type FilterMode = "near" | "sport" | "fof"

interface SuggestedAthlete {
  id: string
  displayName: string
  avatarUrl: string | null
  city: string | null
  country?: string | null
  primarySport: string | null
  mutualFollows: number
  totalActivities: number
  isFollowing: boolean
  score?: number
  reason?: string
}

interface PeopleToFollowProps {
  className?: string
  limit?: number
  defaultMode?: FilterMode
  userHasCity?: boolean
}

const FILTER_CHIPS: { id: FilterMode; label: string }[] = [
  { id: "near", label: "Near you" },
  { id: "sport", label: "Top in your sport" },
  { id: "fof", label: "Friends of friends" },
]

/**
 * People to Follow widget for right sidebar
 * Compact list with filter chips and refresh button
 */
export function PeopleToFollow({
  className,
  limit = 6,
  defaultMode,
  userHasCity = true,
}: PeopleToFollowProps) {
  // Default to "near" if user has city, otherwise "sport"
  const initialMode = defaultMode ?? (userHasCity ? "near" : "sport")

  const [mode, setMode] = useState<FilterMode>(initialMode)
  const [suggestions, setSuggestions] = useState<SuggestedAthlete[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [followingLoading, setFollowingLoading] = useState<Set<string>>(new Set())

  const fetchSuggestions = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const response = await fetch(`/api/social/suggestions?mode=${mode}&limit=${limit}`)
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
      setRefreshing(false)
    }
  }, [mode, limit])

  useEffect(() => {
    fetchSuggestions()
  }, [fetchSuggestions])

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

  const handleRefresh = () => {
    fetchSuggestions(true)
  }

  // Filter out already followed
  const visibleSuggestions = suggestions
    .filter((s) => !following.has(s.id))
    .slice(0, limit)

  // Get reason text for suggestion
  const getReasonText = (athlete: SuggestedAthlete): string => {
    if (athlete.reason) return athlete.reason
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

  if (loading) {
    return <LoadingState />
  }

  return (
    <Card className={cn("border-border-subtle", className)} data-testid="people-to-follow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-orange-500" />
            People to follow
          </CardTitle>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
            title="Refresh suggestions"
          >
            <RefreshCw className={cn("w-4 h-4 text-slate-400", refreshing && "animate-spin")} />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setMode(chip.id)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                mode === chip.id
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              data-testid={`filter-chip-${chip.id}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pt-2">
        <AnimatePresence mode="popLayout">
          {visibleSuggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-4 text-center text-sm text-slate-500"
            >
              No suggestions for this filter. Try another!
            </motion.div>
          ) : (
            visibleSuggestions.map((athlete) => (
              <motion.div
                key={athlete.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AthleteListItem
                  athlete={athlete}
                  isLoading={followingLoading.has(athlete.id)}
                  onFollow={handleFollow}
                  reason={getReasonText(athlete)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {suggestions.length > limit && (
          <Link href="/discover/athletes">
            <Button variant="ghost" size="sm" className="w-full text-xs text-orange-600 mt-2">
              See all
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
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
    <div className="flex items-center gap-2.5 py-1.5">
      <Link href={`/profile/${athlete.id}`}>
        <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all">
          <AvatarImage src={athlete.avatarUrl || undefined} alt={athlete.displayName} />
          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href={`/profile/${athlete.id}`} className="hover:underline">
          <div className="text-sm font-medium text-slate-900 truncate">{athlete.displayName}</div>
        </Link>
        <div className="text-xs text-slate-500 truncate flex items-center gap-1">
          {athlete.mutualFollows > 0 ? (
            <><Users className="w-3 h-3" /> {reason}</>
          ) : athlete.city ? (
            <><MapPin className="w-3 h-3" /> {reason}</>
          ) : (
            <><Trophy className="w-3 h-3" /> {reason}</>
          )}
        </div>
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

function LoadingState() {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex gap-1.5 mt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-7 w-14 rounded" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default PeopleToFollow
