'use client'

import { cn } from '@/lib/utils'
import { Swords, Clock, Trophy, X, Check, Zap } from 'lucide-react'
import { formatDistanceToNow, differenceInHours } from 'date-fns'
import Link from 'next/link'
import { GauntletStatus, GauntletDuration } from '@prisma/client'

interface GauntletUser {
  id: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
}

interface GauntletCardProps {
  gauntlet: {
    id: string
    challengerId: string
    opponentId: string
    challenger: GauntletUser
    opponent: GauntletUser
    duration: GauntletDuration
    message: string | null
    status: GauntletStatus
    challengerPower: number
    opponentPower: number
    startedAt: Date | string | null
    endsAt: Date | string | null
    winnerId: string | null
    createdAt: Date | string
  }
  currentUserId: string
  onAccept?: () => void
  onDecline?: () => void
  className?: string
}

const durationLabels: Record<GauntletDuration, string> = {
  ONE_DAY: '24 Hours',
  THREE_DAYS: '3 Days',
  ONE_WEEK: '1 Week',
}

const statusColors: Record<GauntletStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACTIVE: 'bg-primary/10 text-primary',
  COMPLETED: 'bg-muted text-muted-foreground',
  DECLINED: 'bg-destructive/10 text-destructive',
  EXPIRED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-muted text-muted-foreground',
}

export function GauntletCard({
  gauntlet,
  currentUserId,
  onAccept,
  onDecline,
  className,
}: GauntletCardProps) {
  const isChallenger = gauntlet.challengerId === currentUserId
  const isOpponent = gauntlet.opponentId === currentUserId
  const opponent = isChallenger ? gauntlet.opponent : gauntlet.challenger

  const myPower = isChallenger ? gauntlet.challengerPower : gauntlet.opponentPower
  const theirPower = isChallenger ? gauntlet.opponentPower : gauntlet.challengerPower

  const isPending = gauntlet.status === 'PENDING'
  const isActive = gauntlet.status === 'ACTIVE'
  const isCompleted = gauntlet.status === 'COMPLETED'

  const isWinner = gauntlet.winnerId === currentUserId
  const isTie = isCompleted && !gauntlet.winnerId

  const endsAt = gauntlet.endsAt ? new Date(gauntlet.endsAt) : null
  const hoursRemaining = endsAt ? differenceInHours(endsAt, new Date()) : null

  return (
    <div className={cn(
      "rounded-xl border overflow-hidden",
      isActive ? "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10" :
      isPending && isOpponent ? "border-amber-200 bg-amber-50" :
      "border-border bg-card",
      className
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isActive ? "bg-primary/10" : "bg-muted"
            )}>
              <Swords className={cn(
                "w-4 h-4",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                {isPending && isOpponent ? 'Challenge Received!' : 'Gauntlet'}
              </h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                statusColors[gauntlet.status]
              )}>
                {gauntlet.status === 'PENDING' ? 'Pending Response' :
                 gauntlet.status === 'ACTIVE' ? 'In Progress' :
                 gauntlet.status === 'COMPLETED' ? (isWinner ? 'Victory!' : isTie ? 'Tie' : 'Defeat') :
                 gauntlet.status}
              </span>
            </div>
          </div>

          {/* Duration / Time remaining */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {isActive && hoursRemaining !== null ? (
              <span>{hoursRemaining}h left</span>
            ) : (
              <span>{durationLabels[gauntlet.duration]}</span>
            )}
          </div>
        </div>

        {/* VS Display */}
        <div className="flex items-center justify-between">
          {/* Current User */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-1 overflow-hidden">
              {/* User avatar placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg">
                {(isChallenger ? gauntlet.challenger.displayName : gauntlet.opponent.displayName)?.charAt(0) || 'U'}
              </div>
            </div>
            <p className="text-xs font-medium text-foreground truncate">You</p>
            {(isActive || isCompleted) && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-sm font-bold text-primary">{Math.round(myPower)}</span>
              </div>
            )}
          </div>

          {/* VS */}
          <div className="px-4">
            <span className="text-lg font-bold text-muted-foreground/50">VS</span>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-1 overflow-hidden">
              {opponent.avatarUrl ? (
                <img src={opponent.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted-foreground to-muted-foreground/80 flex items-center justify-center text-background font-bold text-lg">
                  {opponent.displayName?.charAt(0) || opponent.username?.charAt(0) || 'O'}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-foreground truncate">
              {opponent.displayName || opponent.username}
            </p>
            {(isActive || isCompleted) && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm font-bold text-muted-foreground">{Math.round(theirPower)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Message */}
        {gauntlet.message && isPending && (
          <div className="mt-3 p-2 bg-background/50 rounded-lg">
            <p className="text-xs text-muted-foreground italic">"{gauntlet.message}"</p>
          </div>
        )}

        {/* Result Badge */}
        {isCompleted && (
          <div className={cn(
            "mt-3 py-2 px-3 rounded-lg flex items-center justify-center gap-2",
            isWinner ? "bg-primary/10" : isTie ? "bg-muted" : "bg-destructive/10"
          )}>
            {isWinner ? (
              <>
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">You Won!</span>
              </>
            ) : isTie ? (
              <span className="text-sm font-medium text-muted-foreground">It's a Tie!</span>
            ) : (
              <span className="text-sm font-medium text-destructive">Better luck next time</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && isOpponent && onAccept && onDecline && (
        <div className="border-t border-amber-200 bg-background/50 p-3 flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>
      )}

      {/* View Details Link */}
      {(isActive || isCompleted) && (
        <Link
          href={`/gauntlet/${gauntlet.id}`}
          className="block border-t border-border p-3 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          View Details →
        </Link>
      )}
    </div>
  )
}
