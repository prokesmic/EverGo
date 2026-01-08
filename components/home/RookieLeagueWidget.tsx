"use client"

/**
 * Rookie League Widget
 *
 * Shows the user's current cohort standing and weekly leaderboard.
 * Designed to create urgency and engagement for new users.
 */

import { cn } from "@/lib/utils"
import { Trophy, Users, Clock, Medal, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CohortMember {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string | null
  score: number
  sportIndex: number
}

interface RookieLeagueWidgetProps {
  cohort: {
    id: string
    label: string
    startAt: Date
    endAt: Date
    memberCount: number
  } | null
  userRank: number | null
  leaderboard: CohortMember[]
  className?: string
}

export function RookieLeagueWidget({
  cohort,
  userRank,
  leaderboard,
  className,
}: RookieLeagueWidgetProps) {
  if (!cohort) {
    return <RookieLeagueEmptyState className={className} />
  }

  // Calculate time remaining
  const now = new Date()
  const endAt = new Date(cohort.endAt)
  const msRemaining = endAt.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden",
        "bg-gradient-to-br from-amber-500/10 via-background to-background",
        "border-amber-500/20",
        className
      )}
      data-testid="rookie-league-widget"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-amber-500/10 bg-amber-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Rookie League</h3>
              <p className="text-[10px] text-muted-foreground">{cohort.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysRemaining === 0
                ? "Ends today"
                : daysRemaining === 1
                ? "1 day left"
                : `${daysRemaining} days left`}
            </span>
          </div>
        </div>
      </div>

      {/* User's rank highlight */}
      {userRank && (
        <div className="px-4 py-3 bg-amber-500/5 border-b border-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  userRank <= 3
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {userRank <= 3 ? (
                  <Medal className="h-4 w-4" />
                ) : (
                  `#${userRank}`
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Your rank</p>
                <p className="text-xs text-muted-foreground">
                  of {cohort.memberCount} rookies
                </p>
              </div>
            </div>
            {userRank <= 3 && (
              <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-medium">
                Podium!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mini leaderboard */}
      <div className="p-2">
        <div className="space-y-1">
          {leaderboard.slice(0, 5).map((member, index) => (
            <div
              key={member.userId}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg transition",
                index === 0 && "bg-amber-500/10",
                "hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "w-5 text-xs font-medium text-center",
                  index < 3 ? "text-amber-500" : "text-muted-foreground"
                )}
              >
                {member.rank}
              </span>
              <Avatar className="h-6 w-6">
                {member.avatarUrl && <AvatarImage src={member.avatarUrl} />}
                <AvatarFallback className="text-[10px]">
                  {member.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-xs font-medium truncate">
                {member.displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {member.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Link
        href="/rankings?scope=cohort"
        className="flex items-center justify-center gap-1.5 px-4 py-2.5 border-t border-amber-500/10 text-xs font-medium text-amber-500 hover:bg-amber-500/5 transition"
      >
        Full standings
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

/**
 * Empty state when user is not in a cohort
 */
function RookieLeagueEmptyState({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-6 text-center",
        "border-amber-500/30 bg-amber-500/5",
        className
      )}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
        <Users className="h-6 w-6 text-amber-500" />
      </div>
      <h3 className="font-semibold text-sm">Join the Rookie League</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Compete against athletes who joined the same week as you!
      </p>
      <Link
        href="/challenges/discover"
        className="inline-flex mt-3 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-500 text-xs font-medium hover:bg-amber-500/30 transition"
      >
        Log your first activity
      </Link>
    </div>
  )
}

/**
 * Compact version for sidebar/mobile
 */
interface CompactRookieLeagueProps {
  cohort: { label: string; endAt: Date } | null
  userRank: number | null
  totalMembers: number
  className?: string
}

export function CompactRookieLeague({
  cohort,
  userRank,
  totalMembers,
  className,
}: CompactRookieLeagueProps) {
  if (!cohort) return null

  const now = new Date()
  const endAt = new Date(cohort.endAt)
  const daysRemaining = Math.max(
    0,
    Math.ceil((endAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  return (
    <Link
      href="/rankings?scope=cohort"
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition",
        "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Star className="h-5 w-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Rookie League</span>
          {userRank && userRank <= 3 && (
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {userRank ? `#${userRank} of ${totalMembers}` : "Not ranked yet"} •{" "}
          {daysRemaining}d left
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  )
}
