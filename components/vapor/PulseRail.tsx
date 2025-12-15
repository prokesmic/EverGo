"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Activity, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FriendActivity {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  isActive: boolean
  lastActivityTime: string | null
  sportEmoji: string
}

interface PulseRailProps {
  className?: string
}

export function PulseRail({ className }: PulseRailProps) {
  const { data: session } = useSession()
  const [friends, setFriends] = useState<FriendActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFriendActivities = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/social/friends/activities")
        if (res.ok) {
          const data = await res.json()
          setFriends(data.friends || [])
        }
      } catch (error) {
        console.error("Error fetching friend activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFriendActivities()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchFriendActivities, 30000)
    return () => clearInterval(interval)
  }, [session])

  // Sort: active friends first, then by last activity time
  const sortedFriends = [...friends].sort((a, b) => {
    if (a.isActive && !b.isActive) return -1
    if (!a.isActive && b.isActive) return 1
    if (!a.lastActivityTime) return 1
    if (!b.lastActivityTime) return -1
    return new Date(b.lastActivityTime).getTime() - new Date(a.lastActivityTime).getTime()
  })

  // Mock data for demo when no friends
  const mockFriends: FriendActivity[] = [
    { id: "1", userId: "1", displayName: "Sarah K.", avatarUrl: null, isActive: true, lastActivityTime: new Date().toISOString(), sportEmoji: "🏃" },
    { id: "2", userId: "2", displayName: "Mike R.", avatarUrl: null, isActive: true, lastActivityTime: new Date().toISOString(), sportEmoji: "🚴" },
    { id: "3", userId: "3", displayName: "Alex T.", avatarUrl: null, isActive: false, lastActivityTime: new Date(Date.now() - 3600000).toISOString(), sportEmoji: "🏊" },
    { id: "4", userId: "4", displayName: "Emma L.", avatarUrl: null, isActive: false, lastActivityTime: new Date(Date.now() - 7200000).toISOString(), sportEmoji: "🎾" },
    { id: "5", userId: "5", displayName: "Jake M.", avatarUrl: null, isActive: false, lastActivityTime: new Date(Date.now() - 10800000).toISOString(), sportEmoji: "⛳" },
    { id: "6", userId: "6", displayName: "Lisa W.", avatarUrl: null, isActive: false, lastActivityTime: null, sportEmoji: "🏋️" },
  ]

  const displayFriends = sortedFriends.length > 0 ? sortedFriends : mockFriends

  if (loading) {
    return (
      <div className={cn("px-4 py-3", className)}>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-slate-200" />
              <div className="w-12 h-3 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("px-4 py-3 vapor-canvas", className)}>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {/* Add Activity Button */}
        <Link
          href="/activity/create"
          className="flex flex-col items-center gap-1.5 shrink-0"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500 text-center truncate w-16">
            Your story
          </span>
        </Link>

        {/* Friend Stories */}
        {displayFriends.map((friend) => (
          <Link
            key={friend.id}
            href={`/profile/${friend.userId}`}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="relative">
              {/* Pulse ring for active users */}
              {friend.isActive && (
                <div className="absolute -inset-1 rounded-full vapor-pulse-ring" />
              )}

              {/* Story ring */}
              <div className={cn(
                "p-[3px] rounded-full",
                friend.isActive
                  ? "vapor-story-ring"
                  : friend.lastActivityTime
                    ? "bg-gradient-to-br from-slate-300 to-slate-400"
                    : "vapor-story-ring-inactive"
              )}>
                <Avatar className="w-14 h-14 vapor-story-avatar">
                  <AvatarImage src={friend.avatarUrl || undefined} alt={friend.displayName} />
                  <AvatarFallback className="text-lg font-semibold bg-slate-100 text-slate-600">
                    {friend.displayName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Activity indicator */}
              {friend.isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                  <Activity className="w-2.5 h-2.5 text-white" />
                </div>
              )}

              {/* Sport emoji badge */}
              <div className="absolute -top-1 -right-1 text-sm">
                {friend.sportEmoji}
              </div>
            </div>

            <span className={cn(
              "text-[10px] font-medium text-center truncate w-16 transition-colors",
              friend.isActive ? "text-orange-600" : "text-slate-600",
              "group-hover:text-slate-900"
            )}>
              {friend.displayName.split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
