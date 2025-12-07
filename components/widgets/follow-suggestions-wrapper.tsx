"use client"

import { useEffect, useState } from "react"
import { FollowSuggestionsWidget } from "./follow-suggestions-widget"
import { Skeleton } from "@/components/ui/skeleton"

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

export function FollowSuggestionsWrapper() {
  const [suggestions, setSuggestions] = useState<SuggestedAthlete[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const response = await fetch("/api/social/suggestions")
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  if (loading) {
    return (
      <div className="border border-border-subtle rounded-lg p-4 bg-surface-secondary">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
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

  if (suggestions.length === 0) {
    return null
  }

  return <FollowSuggestionsWidget suggestions={suggestions} />
}
