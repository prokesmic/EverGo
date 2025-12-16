"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { UserPlus, Users, ArrowRight, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface SuggestedAthlete {
  id: string
  displayName: string
  avatarUrl: string | null
  city: string | null
  primarySport: string | null
  mutualFollows: number
  totalActivities: number
  isFollowing: boolean
}

export function SuggestedAthletesCarousel() {
  const [suggestions, setSuggestions] = useState<SuggestedAthlete[]>([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [followingLoading, setFollowingLoading] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const response = await fetch("/api/social/suggestions")
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setFollowing(new Set(data.suggestions?.filter((s: SuggestedAthlete) => s.isFollowing).map((s: SuggestedAthlete) => s.id) || []))
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  const handleFollow = async (userId: string) => {
    setFollowingLoading(prev => new Set([...prev, userId]))

    try {
      const response = await fetch("/api/social/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setFollowing(prev => new Set([...prev, userId]))
      }
    } catch (error) {
      console.error("Error following user:", error)
    } finally {
      setFollowingLoading(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Finding athletes for you...</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-gradient-to-br from-white via-white to-orange-50/30 backdrop-blur-md border border-slate-200/60 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Build Your Network</h3>
            <p className="text-sm text-slate-500">
              Follow athletes to see their activities in your feed
            </p>
          </div>
        </div>
      </div>

      {/* Athletes Grid */}
      {suggestions.length > 0 ? (
        <>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {suggestions.slice(0, 8).map((athlete, index) => {
                const isFollowed = following.has(athlete.id)
                const isLoading = followingLoading.has(athlete.id)
                const initials = athlete.displayName
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)

                return (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      "relative rounded-xl p-4 text-center transition-all duration-200",
                      "bg-slate-50/80 hover:bg-white hover:shadow-md",
                      "border border-transparent hover:border-slate-200"
                    )}
                  >
                    <Link href={`/profile/${athlete.id}`} className="block mb-3">
                      <Avatar className="w-14 h-14 mx-auto ring-2 ring-white shadow-sm">
                        <AvatarImage src={athlete.avatarUrl || undefined} alt={athlete.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <Link href={`/profile/${athlete.id}`} className="block hover:underline">
                      <h4 className="font-medium text-sm text-slate-900 truncate">
                        {athlete.displayName}
                      </h4>
                    </Link>

                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {athlete.primarySport || athlete.city || `${athlete.totalActivities} activities`}
                    </p>

                    {athlete.mutualFollows > 0 && (
                      <p className="text-[10px] text-orange-600 mt-1">
                        {athlete.mutualFollows} mutual
                      </p>
                    )}

                    <Button
                      size="sm"
                      variant={isFollowed ? "outline" : "default"}
                      onClick={() => handleFollow(athlete.id)}
                      disabled={isLoading || isFollowed}
                      className={cn(
                        "w-full mt-3 h-8 text-xs",
                        !isFollowed && "bg-orange-500 hover:bg-orange-600"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isFollowed ? (
                        "Following"
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
            <Link href="/search">
              <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                Discover More Athletes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        /* Empty State - No suggestions available */
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="font-medium text-slate-700 mb-2">No suggestions yet</h4>
          <p className="text-sm text-slate-500 mb-4">
            Complete your profile to get personalized athlete recommendations
          </p>
          <Link href="/search">
            <Button className="bg-orange-500 hover:bg-orange-600">
              Browse Athletes
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  )
}
