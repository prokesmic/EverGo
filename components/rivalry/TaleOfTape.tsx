"use client"

/**
 * Tale of the Tape - Side-by-Side Comparison Component
 *
 * Boxing-style matchup view showing:
 * - Both fighters with avatars
 * - Head-to-head record
 * - Key comparison metrics with color coding
 * - Recent form indicators
 * - Streak visualization
 */

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  Zap,
  Route,
  Clock,
  Flame,
  Trophy,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { TaleOfTapeData, FighterStats, ComparisonMetrics } from "@/lib/rivalry/taleOfTape"

interface TaleOfTapeProps {
  data: TaleOfTapeData
  className?: string
}

export function TaleOfTape({ data, className }: TaleOfTapeProps) {
  const { user, opponent, headToHead, comparison } = data

  return (
    <div className={cn("rounded-2xl bg-card border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-transparent to-primary/10 px-6 py-4 border-b">
        <h2 className="text-center font-bold text-lg text-foreground">Tale of the Tape</h2>
      </div>

      {/* Fighter Headers */}
      <div className="grid grid-cols-3 gap-4 p-4 border-b">
        <FighterHeader fighter={user} side="left" />
        <div className="flex items-center justify-center">
          <div className="text-2xl font-black text-muted-foreground">VS</div>
        </div>
        <FighterHeader fighter={opponent} side="right" />
      </div>

      {/* Head-to-Head Record */}
      <div className="p-4 bg-muted/30 border-b">
        <div className="text-center mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Head-to-Head Record
          </span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className={cn(
            "text-3xl font-black",
            comparison.headToHead === "user" ? "text-emerald-500" : "text-foreground"
          )}>
            {headToHead.userWins}
          </div>
          <div className="text-muted-foreground text-sm">-</div>
          <div className="text-xl font-bold text-muted-foreground">
            {headToHead.ties}
          </div>
          <div className="text-muted-foreground text-sm">-</div>
          <div className={cn(
            "text-3xl font-black",
            comparison.headToHead === "opponent" ? "text-emerald-500" : "text-foreground"
          )}>
            {headToHead.opponentWins}
          </div>
        </div>
        {headToHead.currentStreak > 0 && (
          <div className="text-center mt-2">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              headToHead.streakHolder === "user"
                ? "bg-emerald-500/20 text-emerald-600"
                : "bg-red-500/20 text-red-600"
            )}>
              {headToHead.currentStreak} win streak
            </span>
          </div>
        )}
      </div>

      {/* Comparison Rows */}
      <div className="divide-y">
        <ComparisonRow
          label="Sport Index"
          icon={Zap}
          userValue={user.sportIndex}
          opponentValue={opponent.sportIndex}
          winner={comparison.sportIndex}
        />
        <ComparisonRow
          label="Day Streak"
          icon={Flame}
          userValue={user.dayStreak}
          opponentValue={opponent.dayStreak}
          winner={comparison.dayStreak}
          suffix=" days"
        />
        <ComparisonRow
          label="Week Activities"
          icon={Activity}
          userValue={user.weekActivities}
          opponentValue={opponent.weekActivities}
          winner={comparison.weekActivities}
        />
        <ComparisonRow
          label="Week Distance"
          icon={Route}
          userValue={user.weekDistance}
          opponentValue={opponent.weekDistance}
          winner={comparison.weekDistance}
          suffix=" km"
          decimals={1}
        />
        <ComparisonRow
          label="Week Power"
          icon={Zap}
          userValue={user.weekPower}
          opponentValue={opponent.weekPower}
          winner={comparison.weekPower}
        />
      </div>

      {/* Form Indicators */}
      <div className="p-4 border-t">
        <div className="text-center mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Recent Form (Last 7 Days)
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormDots form={user.recentForm} side="left" />
          <div />
          <FormDots form={opponent.recentForm} side="right" />
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function FighterHeader({
  fighter,
  side,
}: {
  fighter: FighterStats
  side: "left" | "right"
}) {
  const isLeft = side === "left"

  return (
    <div className={cn("flex flex-col items-center", isLeft ? "" : "")}>
      <Link
        href={`/profile/${fighter.username ?? fighter.id}`}
        className="relative group"
      >
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
          {fighter.avatarUrl ? (
            <Image
              src={fighter.avatarUrl}
              alt={fighter.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {fighter.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {fighter.dayStreak > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Flame className="w-3 h-3" />
            {fighter.dayStreak}
          </div>
        )}
      </Link>
      <h3 className="mt-2 font-semibold text-foreground text-sm truncate max-w-[100px]">
        {fighter.displayName}
      </h3>
      {fighter.username && (
        <span className="text-xs text-muted-foreground">@{fighter.username}</span>
      )}
    </div>
  )
}

function ComparisonRow({
  label,
  icon: Icon,
  userValue,
  opponentValue,
  winner,
  suffix = "",
  decimals = 0,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  userValue: number
  opponentValue: number
  winner: "user" | "opponent" | "tie"
  suffix?: string
  decimals?: number
}) {
  const formatValue = (v: number) =>
    decimals > 0 ? v.toFixed(decimals) : v.toLocaleString()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-3 items-center p-3 hover:bg-muted/20 transition-colors"
    >
      {/* User Value */}
      <div className="flex items-center gap-2 justify-start">
        {winner === "user" && (
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        )}
        <span
          className={cn(
            "text-lg font-bold",
            winner === "user" ? "text-emerald-500" : "text-foreground"
          )}
        >
          {formatValue(userValue)}{suffix}
        </span>
      </div>

      {/* Label */}
      <div className="flex items-center justify-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>

      {/* Opponent Value */}
      <div className="flex items-center gap-2 justify-end">
        <span
          className={cn(
            "text-lg font-bold",
            winner === "opponent" ? "text-emerald-500" : "text-foreground"
          )}
        >
          {formatValue(opponentValue)}{suffix}
        </span>
        {winner === "opponent" && (
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        )}
      </div>
    </motion.div>
  )
}

function FormDots({
  form,
  side,
}: {
  form: { date: string; hasActivity: boolean; power: number }[]
  side: "left" | "right"
}) {
  return (
    <div className={cn(
      "flex items-center gap-1",
      side === "left" ? "justify-start" : "justify-end"
    )}>
      {form.map((day, i) => (
        <motion.div
          key={day.date}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "w-3 h-3 rounded-full",
            day.hasActivity
              ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"
              : "bg-muted"
          )}
          title={`${day.date}: ${day.hasActivity ? `${day.power} power` : "No activity"}`}
        />
      ))}
    </div>
  )
}
