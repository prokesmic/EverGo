"use client"

/**
 * FollowingStrip - Horizontal scrollable avatar row of users you follow
 *
 * Social Model: Follow is canonical. "Friends" = mutual follows (derived).
 * See lib/follow.ts for utilities.
 *
 * Click any avatar to jump to their profile instantly
 */

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface FollowingUser {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
}

interface FollowingStripProps {
  following: FollowingUser[]
  className?: string
}

export function FollowingStrip({ following, className }: FollowingStripProps) {
  if (following.length === 0) {
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
        {following.map((user) => (
          <FollowingAvatar key={user.id} user={user} />
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

function FollowingAvatar({ user }: { user: FollowingUser }) {
  const displayName = user.displayName || user.username || "User"
  const initials = displayName.slice(0, 2).toUpperCase()
  // Privacy: Only use username in URLs, never expose user IDs
  const profileUrl = user.username ? `/profile/${user.username}` : null

  const avatarContent = (
    <>
      <Avatar className="w-12 h-12 border-2 border-background shadow-sm group-hover:border-primary/30 transition-colors">
        <AvatarImage src={user.avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="text-xs font-medium bg-muted">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-[10px] text-muted-foreground truncate max-w-[60px] text-center">
        {displayName.split(" ")[0]}
      </span>
    </>
  )

  // Only render as link if user has a username
  if (profileUrl) {
    return (
      <Link
        href={profileUrl}
        className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
      >
        {avatarContent}
      </Link>
    )
  }

  // User has no username - render as non-clickable
  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
      {avatarContent}
    </div>
  )
}

// Backwards compatibility wrapper - accepts "friends" prop name
// TODO: Remove after updating all consumers
interface FriendsStripProps {
  friends: FollowingUser[]
  className?: string
}

export function FriendsStrip({ friends, className }: FriendsStripProps) {
  return <FollowingStrip following={friends} className={className} />
}
