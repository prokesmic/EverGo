"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Trophy, Medal, Users, Target, Calendar, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface PersonalRecord {
  id: string
  discipline: string
  value: string
  achievedAt: Date
  isRecent?: boolean
}

interface Team {
  id: string
  name: string
  sport: string
  logoUrl?: string | null
  memberCount: number
}

interface Challenge {
  id: string
  title: string
  progress: number
  target: number
  unit: string
  endsAt: Date
}

interface ProfileSideRailProps {
  personalRecords?: PersonalRecord[]
  teams?: Team[]
  activeChallenges?: Challenge[]
  userId: string
  username?: string | null
}

export function ProfileSideRail({
  personalRecords = [],
  teams = [],
  activeChallenges = [],
  userId,
  username,
}: ProfileSideRailProps) {
  const profilePath = username || userId

  // Pre-compute days left to avoid impure function calls during render
  const now = useMemo(() => Date.now(), [])
  const challengesWithDaysLeft = useMemo(() =>
    activeChallenges.map((challenge) => ({
      ...challenge,
      daysLeft: Math.ceil((new Date(challenge.endsAt).getTime() - now) / (1000 * 60 * 60 * 24)),
      progressPercent: Math.min(100, (challenge.progress / challenge.target) * 100),
    })),
    [activeChallenges, now]
  )

  return (
    <aside className="space-y-4">
      {/* Personal Records Widget */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Personal Records</h3>
          </div>
          <Link
            href={`/profile/${profilePath}/records`}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {personalRecords.length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-400">
            No personal records yet
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {personalRecords.slice(0, 5).map((pr) => (
              <div
                key={pr.id}
                className={cn(
                  "flex items-center justify-between p-3 hover:bg-slate-50 transition-colors",
                  pr.isRecent && "bg-amber-50/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Medal className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{pr.discipline}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(pr.achievedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{pr.value}</p>
                  {pr.isRecent && (
                    <span className="inline-flex items-center text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teams Widget */}
      {teams.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Teams</h3>
            </div>
            <Link
              href={`/profile/${profilePath}/teams`}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {teams.slice(0, 3).map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={team.logoUrl ?? undefined} alt={team.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    {team.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{team.name}</p>
                  <p className="text-xs text-slate-500">
                    {team.sport} · {team.memberCount} members
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Challenges Widget */}
      {activeChallenges.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Active Challenges</h3>
            </div>
            <Link
              href="/challenges"
              className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {challengesWithDaysLeft.slice(0, 3).map((challenge) => {
              const { progressPercent, daysLeft } = challenge

              return (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="block p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {challenge.title}
                    </p>
                    <span className="text-xs text-slate-500 shrink-0 ml-2">
                      {daysLeft}d left
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        progressPercent >= 100
                          ? "bg-emerald-500"
                          : progressPercent >= 75
                          ? "bg-emerald-400"
                          : progressPercent >= 50
                          ? "bg-yellow-400"
                          : "bg-orange-400"
                      )}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-slate-500">
                      {challenge.progress} / {challenge.target} {challenge.unit}
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Upcoming Events Widget */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-slate-900 text-sm">Upcoming Events</h3>
          </div>
          <Link
            href="/calendar"
            className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4 text-center text-sm text-slate-400">
          No upcoming events
        </div>
      </div>
    </aside>
  )
}
