'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Swords, Clock, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

type BattleStatus = 'ACTIVE' | 'CHALLENGER_WON' | 'OPPONENT_WON' | 'TIE' | 'EXPIRED'

interface BattleUser {
  id: string
  displayName: string | null
  username: string | null
  avatarUrl: string | null
}

interface RankBattleCardProps {
  battle: {
    id: string
    weekStart: Date
    weekEnd: Date
    challenger: BattleUser
    opponent: BattleUser
    challengerScore: number
    opponentScore: number
    challengerStartRank: number
    opponentStartRank: number
    status: BattleStatus
    winnerId: string | null
    scope: string
    scopeValue: string | null
  }
  currentUserId: string
  className?: string
}

export function RankBattleCard({
  battle,
  currentUserId,
  className
}: RankBattleCardProps) {
  const isChallenger = battle.challenger.id === currentUserId
  const userScore = isChallenger ? battle.challengerScore : battle.opponentScore
  const opponentScore = isChallenger ? battle.opponentScore : battle.challengerScore
  const user = isChallenger ? battle.challenger : battle.opponent
  const opponent = isChallenger ? battle.opponent : battle.challenger

  const totalScore = userScore + opponentScore
  const userPercent = totalScore > 0 ? (userScore / totalScore) * 100 : 50
  const opponentPercent = totalScore > 0 ? (opponentScore / totalScore) * 100 : 50

  const isActive = battle.status === 'ACTIVE'
  const userWon = battle.winnerId === currentUserId
  const isTie = battle.status === 'TIE'
  const isExpired = battle.status === 'EXPIRED'

  const getStatusMessage = () => {
    if (isActive) {
      const timeLeft = formatDistanceToNow(new Date(battle.weekEnd), { addSuffix: false })
      return `${timeLeft} remaining`
    }
    if (isExpired) return 'No activity recorded'
    if (isTie) return "It's a tie!"
    if (userWon) return 'You won!'
    return 'Better luck next week!'
  }

  const getStatusColor = () => {
    if (isActive) return 'text-blue-600'
    if (isExpired) return 'text-slate-400'
    if (isTie) return 'text-amber-600'
    if (userWon) return 'text-emerald-600'
    return 'text-red-500'
  }

  const getScopeLabel = () => {
    if (battle.scope === 'city' && battle.scopeValue) return battle.scopeValue
    if (battle.scope === 'country' && battle.scopeValue) return battle.scopeValue
    return 'Global'
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 overflow-hidden",
      !isActive && "opacity-80",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-700">
              Rank Battle
            </span>
            <span className="text-xs text-slate-400">
              {getScopeLabel()}
            </span>
          </div>
          <div className={cn("flex items-center gap-1 text-xs font-medium", getStatusColor())}>
            {isActive ? (
              <Clock className="w-3 h-3" />
            ) : userWon ? (
              <Crown className="w-3 h-3" />
            ) : null}
            {getStatusMessage()}
          </div>
        </div>
      </div>

      {/* VS Display */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* User side */}
          <div className="flex-1 text-center">
            <Avatar className="h-14 w-14 mx-auto mb-2 ring-2 ring-orange-200">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-lg bg-orange-100 text-orange-700">
                {(user.displayName ?? user.username ?? '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-slate-900 truncate">
              {user.displayName ?? user.username ?? 'You'}
            </p>
            <p className="text-xs text-slate-400">You</p>
          </div>

          {/* VS indicator */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-400">VS</span>
            </div>
          </div>

          {/* Opponent side */}
          <div className="flex-1 text-center">
            <Avatar className="h-14 w-14 mx-auto mb-2 ring-2 ring-slate-200">
              <AvatarImage src={opponent.avatarUrl ?? undefined} />
              <AvatarFallback className="text-lg bg-slate-100 text-slate-600">
                {(opponent.displayName ?? opponent.username ?? '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium text-slate-900 truncate">
              {opponent.displayName ?? opponent.username ?? 'Opponent'}
            </p>
            <p className="text-xs text-slate-400">
              #{isChallenger ? battle.opponentStartRank : battle.challengerStartRank}
            </p>
          </div>
        </div>

        {/* Score comparison bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className={cn(
              "font-semibold",
              userScore > opponentScore ? "text-emerald-600" : "text-slate-600"
            )}>
              {Math.round(userScore).toLocaleString()} pts
            </span>
            <span className={cn(
              "font-semibold",
              opponentScore > userScore ? "text-emerald-600" : "text-slate-600"
            )}>
              {Math.round(opponentScore).toLocaleString()} pts
            </span>
          </div>

          <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <motion.div
              className={cn(
                "h-full",
                userScore > opponentScore ? "bg-emerald-500" :
                userScore < opponentScore ? "bg-orange-400" :
                "bg-slate-400"
              )}
              initial={{ width: '50%' }}
              animate={{ width: `${userPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <motion.div
              className={cn(
                "h-full",
                opponentScore > userScore ? "bg-emerald-500" :
                opponentScore < userScore ? "bg-slate-400" :
                "bg-slate-400"
              )}
              initial={{ width: '50%' }}
              animate={{ width: `${opponentPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Motivational message for active battles */}
        {isActive && userScore < opponentScore && (
          <p className="mt-3 text-xs text-center text-orange-600 font-medium">
            {Math.round(opponentScore - userScore)} pts behind - keep pushing!
          </p>
        )}
        {isActive && userScore > opponentScore && (
          <p className="mt-3 text-xs text-center text-emerald-600 font-medium">
            You're winning by {Math.round(userScore - opponentScore)} pts!
          </p>
        )}
        {isActive && userScore === opponentScore && totalScore > 0 && (
          <p className="mt-3 text-xs text-center text-slate-500 font-medium">
            It's tied - every effort counts!
          </p>
        )}

        {/* Winner badge for completed battles */}
        {!isActive && !isExpired && (
          <div className="mt-3 flex justify-center">
            {userWon && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <Trophy className="w-3 h-3" />
                Victory!
              </div>
            )}
            {isTie && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Draw
              </div>
            )}
            {!userWon && !isTie && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                Defeated
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
