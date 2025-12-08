"use client"

import { Zap, CheckCircle2, Clock, Target, ChevronRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TodaySummaryCardProps {
    hasActivityToday: boolean
    todayDistance?: number
    todayTime?: number
    streakDays?: number
    nextGoalName?: string
    nextGoalProgress?: number
}

export function TodaySummaryCard({
    hasActivityToday,
    todayDistance = 0,
    todayTime = 0,
    streakDays = 0,
    nextGoalName = "Weekly Goal",
    nextGoalProgress = 0
}: TodaySummaryCardProps) {
    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = Math.round(minutes % 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    return (
        <div className="card-elevated p-4">
            <div className="flex items-center justify-between gap-4">
                {/* Left: Today Status */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                        "p-2.5 rounded-xl shrink-0",
                        hasActivityToday
                            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                    )}>
                        {hasActivityToday ? (
                            <CheckCircle2 className="h-5 w-5" />
                        ) : (
                            <Zap className="h-5 w-5" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-foreground">
                            {hasActivityToday ? "You're active today!" : "No activity yet"}
                        </div>
                        {hasActivityToday ? (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{todayDistance.toFixed(1)} km</span>
                                <span className="text-muted-foreground/50">|</span>
                                <span>{formatTime(todayTime)}</span>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                Log an activity to keep your streak going
                            </div>
                        )}
                    </div>
                </div>

                {/* Center: Quick Stats */}
                <div className="hidden sm:flex items-center gap-4">
                    {streakDays > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                {streakDays} day streak
                            </span>
                        </div>
                    )}
                    {nextGoalProgress > 0 && nextGoalProgress < 100 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {nextGoalProgress}% to {nextGoalName}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: CTA */}
                <div className="shrink-0">
                    {hasActivityToday ? (
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link href="/activity">
                                View Details
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild size="sm" className="gap-1.5 shadow-sm">
                            <Link href="/activity/create">
                                <Zap className="h-4 w-4" />
                                Log Activity
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
