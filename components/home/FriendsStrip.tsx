"use client"

/**
 * FriendsStrip - Horizontal scrollable avatar row of users you follow
 *
 * Click any avatar to jump to their profile instantly
 */

import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FriendData {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
}

interface FriendsStripProps {
  friends: FriendData[]
  className?: string
}

export function FriendsStrip({ friends, className }: FriendsStripProps) {
  if (friends.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-card-foreground">Following</h3>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Follow athletes to see them here
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/rankings">
              Discover Athletes
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-card-foreground">Following</h3>
        <Link
          href="/profile/me?tab=following"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Avatar strip */}
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        {friends.map((friend) => (
          <FriendAvatar key={friend.id} friend={friend} />
        ))}

        {/* Add more button */}
        <Link
          href="/rankings"
          className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50 group-hover:bg-muted transition-colors">
            <UserPlus className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-[10px] text-muted-foreground">Find</span>
        </Link>
      </div>
    </div>
  )
}

function FriendAvatar({ friend }: { friend: FriendData }) {
  const displayName = friend.displayName || friend.username || "User"
  const initials = displayName.slice(0, 2).toUpperCase()
  const profileUrl = `/profile/${friend.username || friend.id}`

  return (
    <Link
      href={profileUrl}
      className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
    >
      <Avatar className="w-12 h-12 border-2 border-background shadow-sm group-hover:border-primary/30 transition-colors">
        <AvatarImage src={friend.avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="text-xs font-medium bg-muted">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-[10px] text-muted-foreground truncate max-w-[60px] text-center">
        {displayName.split(" ")[0]}
      </span>
    </Link>
  )
}
