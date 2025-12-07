"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, MapPin, Trophy } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

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

interface FollowSuggestionsWidgetProps {
  suggestions: SuggestedAthlete[]
}

export function FollowSuggestionsWidget({ suggestions }: FollowSuggestionsWidgetProps) {
  const [following, setFollowing] = useState<Set<string>>(
    new Set(suggestions.filter(s => s.isFollowing).map(s => s.id))
  )
  const [loading, setLoading] = useState<Set<string>>(new Set())

  const handleFollow = async (userId: string) => {
    setLoading(prev => new Set([...prev, userId]))

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
      setLoading(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card className="border-border-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand-primary" />
          Athletes You May Know
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.slice(0, 5).map((athlete) => {
          const isFollowing = following.has(athlete.id)
          const isLoading = loading.has(athlete.id)
          const initials = athlete.displayName
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)

          return (
            <div key={athlete.id} className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0 last:pb-0">
              <Link href={`/profile/${athlete.id}`}>
                <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all">
                  <AvatarImage src={athlete.avatarUrl || undefined} alt={athlete.displayName} />
                  <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/profile/${athlete.id}`} className="hover:underline">
                  <h4 className="font-semibold text-sm text-text-primary truncate">
                    {athlete.displayName}
                  </h4>
                </Link>

                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  {athlete.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{athlete.city}</span>
                    </div>
                  )}
                  {athlete.primarySport && (
                    <span className="truncate">{athlete.primarySport}</span>
                  )}
                </div>

                {athlete.mutualFollows > 0 && (
                  <p className="text-xs text-text-muted mt-1">
                    {athlete.mutualFollows} mutual {athlete.mutualFollows === 1 ? "follow" : "follows"}
                  </p>
                )}

                {athlete.totalActivities > 0 && (
                  <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                    <Trophy className="w-3 h-3" />
                    <span>{athlete.totalActivities} activities</span>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={() => handleFollow(athlete.id)}
                disabled={isLoading || isFollowing}
                className="text-xs h-7 px-3 shrink-0"
              >
                {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          )
        })}

        {suggestions.length > 5 && (
          <Link href="/search">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              See All Suggestions
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
