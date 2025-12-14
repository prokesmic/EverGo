"use client"

import { Sparkles, Brain, Target, Dumbbell } from "lucide-react"
import Link from "next/link"

type AiCoachProps = {
  stats: {
    sportIndex: number
    totalDuration: number
    totalActivities: number
    streakDays?: number
  }
}

export function AuroraAiCoachWidget({ stats }: AiCoachProps) {
  // Simple heuristic summary based on training load
  const volume = Math.round(stats.totalDuration / 60)
  const streak = stats.streakDays ?? 0
  const activities = stats.totalActivities

  let headline = "Easy day - Focus on recovery"
  let detail = "Your body will thank you for a lighter day. A short walk or mobility session keeps the streak alive."
  let icon = <Sparkles className="w-5 h-5" />
  let iconBg = "bg-indigo-100 text-indigo-600"

  if (volume < 90 && streak < 3) {
    headline = "Let's build your base"
    detail = "Aim for 30-40 minutes in an easy zone today. Consistency beats intensity in the first weeks."
    icon = <Target className="w-5 h-5" />
    iconBg = "bg-sky-100 text-sky-600"
  } else if (volume >= 150 && streak >= 4) {
    headline = "You're on a roll!"
    detail = "You've stacked solid work. Consider a quality workout: intervals, tempo, or hills depending on your sport."
    icon = <Dumbbell className="w-5 h-5" />
    iconBg = "bg-emerald-100 text-emerald-600"
  } else if (activities >= 5 && streak >= 7) {
    headline = "Recovery is progress too"
    detail = "Great streak! Take an active recovery day to let your body adapt and come back stronger."
    icon = <Brain className="w-5 h-5" />
    iconBg = "bg-amber-100 text-amber-600"
  }

  return (
    <div className="eg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="eg-widget-title">EverGo Coach</p>
          <p className="text-base font-semibold text-slate-900">{headline}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed">{detail}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-[11px] text-slate-500">
          Based on your training load ({volume} min) and {streak}-day streak
        </p>
        <Link
          href="/training"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View plans
        </Link>
      </div>

      {stats.sportIndex < 300 && (
        <div className="bg-gradient-to-r from-indigo-50 to-sky-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-indigo-700">Pro tip:</span>{" "}
            Upgrade to Pro for fully personalized AI training plans tailored to your goals and schedule.
          </p>
        </div>
      )}
    </div>
  )
}
