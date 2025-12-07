import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Flame, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

interface StreakAlertProps {
  currentStreak: number
  lastActivityDate: Date | null
  weeklyGoal?: number
  weeklyProgress?: number
}

export function StreakAlert({
  currentStreak,
  lastActivityDate,
  weeklyGoal = 3,
  weeklyProgress = 0,
}: StreakAlertProps) {
  const now = new Date()
  const lastActivity = lastActivityDate ? new Date(lastActivityDate) : null

  // Calculate hours since last activity
  const hoursSinceLastActivity = lastActivity
    ? Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60))
    : null

  // Determine if streak is at risk (no activity in 20+ hours)
  const streakAtRisk = hoursSinceLastActivity !== null && hoursSinceLastActivity >= 20 && hoursSinceLastActivity < 24

  // Determine if streak is about to break (no activity in 24+ hours)
  const streakAboutToBreak = hoursSinceLastActivity !== null && hoursSinceLastActivity >= 24

  // Check if weekly goal is at risk (less than 2 days left in week and behind)
  const dayOfWeek = now.getDay() // 0 = Sunday
  const daysLeftInWeek = 7 - dayOfWeek
  const activitiesNeeded = weeklyGoal - weeklyProgress
  const weeklyGoalAtRisk = daysLeftInWeek <= 2 && activitiesNeeded > daysLeftInWeek

  // Don't show anything if everything is fine
  if (!streakAtRisk && !streakAboutToBreak && !weeklyGoalAtRisk && currentStreak === 0) {
    return null
  }

  // Show streak celebration for milestones
  if (currentStreak > 0 && currentStreak % 7 === 0 && hoursSinceLastActivity && hoursSinceLastActivity < 6) {
    return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Flame className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">
              🎉 {currentStreak}-Day Streak Milestone!
            </h3>
            <p className="text-white/90 mb-4">
              Amazing consistency! Keep it going to build lasting habits.
            </p>
            <div className="flex gap-2">
              <Link href="/challenges">
                <Button size="sm" variant="secondary">
                  Join a Challenge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show urgent warning if streak is about to break
  if (streakAboutToBreak && currentStreak > 0) {
    return (
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg animate-pulse">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Flame className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Urgent: Your {currentStreak}-Day Streak is Breaking!
            </h3>
            <p className="text-white/90 mb-4">
              You haven't logged an activity in {hoursSinceLastActivity} hours. Complete any workout today to save your streak!
            </p>
            <div className="flex gap-2">
              <Link href="/activity/create">
                <Button size="sm" variant="secondary">
                  Log Activity Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show warning if streak is at risk
  if (streakAtRisk && currentStreak > 0) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Flame className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">
              Don't Break Your {currentStreak}-Day Streak!
            </h3>
            <p className="text-white/90 mb-4">
              Complete any activity today to keep your streak alive. You've got this!
            </p>
            <div className="bg-white/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Time remaining:</span>
                <span className="font-mono font-bold">
                  {24 - (hoursSinceLastActivity || 0)} hours
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/activity/create">
                <Button size="sm" variant="secondary">
                  Log Quick Activity
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show weekly goal reminder
  if (weeklyGoalAtRisk) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">
              Push to Hit Your Weekly Goal!
            </h3>
            <p className="text-white/90 mb-4">
              You need {activitiesNeeded} more {activitiesNeeded === 1 ? 'activity' : 'activities'} in the next {daysLeftInWeek} {daysLeftInWeek === 1 ? 'day' : 'days'} to reach your weekly goal of {weeklyGoal}.
            </p>
            <div className="bg-white/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress:</span>
                <span className="font-bold">{weeklyProgress} / {weeklyGoal}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${(weeklyProgress / weeklyGoal) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/activity/create">
                <Button size="sm" variant="secondary">
                  Log Activity
                </Button>
              </Link>
              <Link href="/challenges">
                <Button size="sm" variant="outline" className="border-white/40 hover:bg-white/10">
                  Browse Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
