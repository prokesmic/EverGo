"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Flame, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TeamData {
  id: string
  name: string
  logoUrl: string | null
  color: string
  score: number
  weeklyActivities: number
  streak: number
}

interface BattleBarProps {
  teamA: TeamData
  teamB: TeamData
  challengeName?: string
  endsIn?: string
  className?: string
}

export function BattleBar({
  teamA,
  teamB,
  challengeName = "Weekly Showdown",
  endsIn = "3 days",
  className,
}: BattleBarProps) {
  const total = teamA.score + teamB.score
  const teamAPercentage = total > 0 ? (teamA.score / total) * 100 : 50
  const teamBPercentage = total > 0 ? (teamB.score / total) * 100 : 50

  const isTeamAWinning = teamA.score > teamB.score
  const isTied = teamA.score === teamB.score

  return (
    <div className={cn("vapor-card p-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-100">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">{challengeName}</span>
        </div>
        <span className="vapor-chip">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Ends in {endsIn}
        </span>
      </div>

      {/* Teams Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Team A */}
        <Link href={`/teams/${teamA.id}`} className="flex items-center gap-3 group">
          <Avatar className={cn(
            "h-12 w-12 ring-2 transition-all",
            isTeamAWinning ? "ring-orange-500 ring-offset-2" : "ring-slate-200"
          )}>
            <AvatarImage src={teamA.logoUrl || undefined} alt={teamA.name} />
            <AvatarFallback className={cn("font-bold text-white", teamA.color)}>
              {teamA.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
              {teamA.name}
            </p>
            <p className="text-xs text-slate-500">{teamA.weeklyActivities} activities</p>
          </div>
        </Link>

        {/* VS Badge */}
        <div className="vapor-rivalry-vs px-4">VS</div>

        {/* Team B */}
        <Link href={`/teams/${teamB.id}`} className="flex items-center gap-3 group flex-row-reverse">
          <Avatar className={cn(
            "h-12 w-12 ring-2 transition-all",
            !isTeamAWinning && !isTied ? "ring-indigo-500 ring-offset-2" : "ring-slate-200"
          )}>
            <AvatarImage src={teamB.logoUrl || undefined} alt={teamB.name} />
            <AvatarFallback className={cn("font-bold text-white", teamB.color)}>
              {teamB.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {teamB.name}
            </p>
            <p className="text-xs text-slate-500">{teamB.weeklyActivities} activities</p>
          </div>
        </Link>
      </div>

      {/* Battle Bar */}
      <div className="vapor-battle-bar mb-4">
        <motion.div
          className="vapor-battle-fill-left"
          initial={{ width: "50%" }}
          animate={{ width: `${teamAPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div
          className="vapor-battle-fill-right"
          initial={{ width: "50%" }}
          animate={{ width: `${teamBPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="vapor-battle-center" />
      </div>

      {/* Scores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            isTeamAWinning ? "text-orange-500" : "text-slate-600"
          )}>
            {teamA.score.toLocaleString()}
          </span>
          {isTeamAWinning && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-xs text-orange-500 font-medium"
            >
              <TrendingUp className="w-3 h-3" />
              Leading
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Trophy className="w-3 h-3" />
          pts
        </div>

        <div className="flex items-center gap-2">
          {!isTeamAWinning && !isTied && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-xs text-indigo-500 font-medium"
            >
              <TrendingUp className="w-3 h-3" />
              Leading
            </motion.div>
          )}
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            !isTeamAWinning && !isTied ? "text-indigo-500" : "text-slate-600"
          )}>
            {teamB.score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Streak badges */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-slate-600">
            {teamA.streak} day streak
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-600">
            {teamB.streak} day streak
          </span>
          <Flame className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>
    </div>
  )
}

// Demo component with mock data
export function BattleBarDemo() {
  const mockTeamA = {
    id: "team-alpha",
    name: "Team Alpha",
    logoUrl: null,
    color: "bg-orange-500",
    score: 12450,
    weeklyActivities: 47,
    streak: 14,
  }

  const mockTeamB = {
    id: "team-bravo",
    name: "Team Bravo",
    logoUrl: null,
    color: "bg-indigo-500",
    score: 11200,
    weeklyActivities: 42,
    streak: 9,
  }

  return (
    <BattleBar
      teamA={mockTeamA}
      teamB={mockTeamB}
      challengeName="Weekly Showdown"
      endsIn="3 days"
    />
  )
}
