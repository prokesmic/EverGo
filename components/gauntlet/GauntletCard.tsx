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
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-slate-100 text-slate-700',
  DECLINED: 'bg-red-100 text-red-500',
  EXPIRED: 'bg-slate-100 text-slate-400',
  CANCELLED: 'bg-slate-100 text-slate-400',
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
      isActive ? "border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50" :
      isPending && isOpponent ? "border-amber-200 bg-amber-50" :
      "border-slate-200 bg-white",
      className
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isActive ? "bg-violet-100" : "bg-slate-100"
            )}>
              <Swords className={cn(
                "w-4 h-4",
                isActive ? "text-violet-600" : "text-slate-500"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
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
          <div className="flex items-center gap-1 text-xs text-slate-500">
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
            <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto mb-1 overflow-hidden">
              {/* User avatar placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {(isChallenger ? gauntlet.challenger.displayName : gauntlet.opponent.displayName)?.charAt(0) || 'U'}
              </div>
            </div>
            <p className="text-xs font-medium text-slate-900 truncate">You</p>
            {(isActive || isCompleted) && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-violet-500" />
                <span className="text-sm font-bold text-violet-600">{Math.round(myPower)}</span>
              </div>
            )}
          </div>

          {/* VS */}
          <div className="px-4">
            <span className="text-lg font-bold text-slate-300">VS</span>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto mb-1 overflow-hidden">
              {opponent.avatarUrl ? (
                <img src={opponent.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-lg">
                  {opponent.displayName?.charAt(0) || opponent.username?.charAt(0) || 'O'}
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-slate-900 truncate">
              {opponent.displayName || opponent.username}
            </p>
            {(isActive || isCompleted) && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-slate-400" />
                <span className="text-sm font-bold text-slate-600">{Math.round(theirPower)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Message */}
        {gauntlet.message && isPending && (
          <div className="mt-3 p-2 bg-white/50 rounded-lg">
            <p className="text-xs text-slate-600 italic">"{gauntlet.message}"</p>
          </div>
        )}

        {/* Result Badge */}
        {isCompleted && (
          <div className={cn(
            "mt-3 py-2 px-3 rounded-lg flex items-center justify-center gap-2",
            isWinner ? "bg-emerald-100" : isTie ? "bg-slate-100" : "bg-red-50"
          )}>
            {isWinner ? (
              <>
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">You Won!</span>
              </>
            ) : isTie ? (
              <span className="text-sm font-medium text-slate-600">It's a Tie!</span>
            ) : (
              <span className="text-sm font-medium text-red-600">Better luck next time</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && isOpponent && onAccept && onDecline && (
        <div className="border-t border-amber-200 bg-white/50 p-3 flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-violet-600 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
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
          className="block border-t border-slate-200 p-3 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
        >
          View Details →
        </Link>
      )}
    </div>
  )
}
