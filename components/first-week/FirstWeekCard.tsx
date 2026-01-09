'use client'

import { cn } from '@/lib/utils'
import { Sparkles, Flame, Trophy, CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { FirstWeekProgress } from '@/lib/first-week'

interface FirstWeekCardProps {
  progress: FirstWeekProgress
  className?: string
}

export function FirstWeekCard({ progress, className }: FirstWeekCardProps) {
  if (!progress.isFirstWeek) return null

  const completedMilestones = Object.values(progress.milestones).filter(Boolean).length
  const totalMilestones = Object.keys(progress.milestones).length
  const progressPercent = (completedMilestones / totalMilestones) * 100

  return (
    <div className={cn(
      "relative bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl overflow-hidden text-white",
      className
    )}>
      {/* Decorative sparkles */}
      <div className="absolute top-2 right-2 opacity-20">
        <Sparkles className="w-24 h-24" />
      </div>

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">First Week Magic</h3>
              <p className="text-xs text-white/70">
                {progress.daysRemaining} days remaining
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{progress.power}</p>
            <p className="text-xs text-white/70">Power</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>{completedMilestones} of {totalMilestones} milestones</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="space-y-2 mb-4">
          <MilestoneItem
            completed={progress.milestones.firstActivity}
            label="Log first activity"
          />
          <MilestoneItem
            completed={progress.milestones.threeActivities}
            label="Log 3 activities"
          />
          <MilestoneItem
            completed={progress.milestones.weeklyGoal}
            label="Reach 100 Power"
          />
          <MilestoneItem
            completed={progress.milestones.fiveActivities}
            label="Log 5 activities"
          />
        </div>

        {/* Next milestone CTA */}
        {progress.nextMilestone && (
          <Link
            href={progress.nextMilestone.name === 'First Activity' ? '/activity/log' : '/rankings'}
            className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <p className="text-sm font-medium">{progress.nextMilestone.name}</p>
                <p className="text-xs text-white/70">
                  {progress.nextMilestone.progress} / {progress.nextMilestone.target}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/50" />
          </Link>
        )}

        {/* All milestones complete */}
        {!progress.nextMilestone && completedMilestones === totalMilestones && (
          <div className="flex items-center gap-3 p-3 bg-emerald-400/20 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-900" />
            </div>
            <div>
              <p className="text-sm font-medium">Amazing First Week!</p>
              <p className="text-xs text-white/70">You've completed all milestones</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MilestoneItem({
  completed,
  label,
}: {
  completed: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
      ) : (
        <Circle className="w-4 h-4 text-white/40" />
      )}
      <span className={cn(
        "text-sm",
        completed ? "text-white/90 line-through" : "text-white/70"
      )}>
        {label}
      </span>
    </div>
  )
}
