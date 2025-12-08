"use client"

import { Activity, ChevronRight, TrendingUp } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ActivityBreakdown {
    sport: string
    distance: number
    percentage: number
    color: string
}

interface ActivitiesSummaryWidgetProps {
    totalDistance: number
    totalTime: number
    totalCalories: number
    breakdown: ActivityBreakdown[]
}

const sportColorMap: Record<string, string> = {
    running: "bg-sport-running",
    cycling: "bg-sport-cycling",
    swimming: "bg-sport-swimming",
    football: "bg-sport-football",
    fitness: "bg-sport-fitness",
    tennis: "bg-sport-tennis",
    basketball: "bg-sport-basketball",
    other: "bg-muted-foreground"
}

export function ActivitiesSummaryWidget({
    totalDistance,
    totalTime,
    totalCalories,
    breakdown
}: ActivitiesSummaryWidgetProps) {
    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = Math.round(minutes % 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    return (
        <CardShell
            title="Weekly Summary"
            icon={<TrendingUp className="h-5 w-5" />}
            action={<Link href="/activity" className="flex items-center text-primary hover:underline">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="stat-card-mini">
                    <span className="stat-value-mini">{totalDistance.toFixed(1)}</span>
                    <span className="stat-label-mini">km</span>
                </div>
                <div className="stat-card-mini">
                    <span className="stat-value-mini">{formatTime(totalTime)}</span>
                    <span className="stat-label-mini">time</span>
                </div>
                <div className="stat-card-mini">
                    <span className="stat-value-mini">{totalCalories > 1000 ? `${(totalCalories / 1000).toFixed(1)}k` : totalCalories}</span>
                    <span className="stat-label-mini">kcal</span>
                </div>
            </div>

            {/* Activity Breakdown */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Activity Breakdown</span>
                    <span>Last 7 Days</span>
                </div>

                {/* Stacked Progress Bar */}
                {breakdown.length > 0 && (
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                        {breakdown.map((item, index) => (
                            <div
                                key={item.sport}
                                className={cn(
                                    "h-full transition-all duration-500",
                                    sportColorMap[item.sport.toLowerCase()] || "bg-primary"
                                )}
                                style={{ width: `${item.percentage}%` }}
                            />
                        ))}
                    </div>
                )}

                {/* Sport Legend */}
                <div className="space-y-1.5">
                    {breakdown.map((item) => (
                        <div key={item.sport} className="flex items-center gap-2">
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full shrink-0",
                                sportColorMap[item.sport.toLowerCase()] || "bg-primary"
                            )} />
                            <span className="text-xs font-medium capitalize flex-1">{item.sport}</span>
                            <span className="text-xs text-muted-foreground tabular-nums">{item.distance.toFixed(1)} km</span>
                            <span className="text-xs text-muted-foreground/70 tabular-nums w-10 text-right">{item.percentage.toFixed(0)}%</span>
                        </div>
                    ))}
                </div>

                {breakdown.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                        <Activity className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No activities this week</p>
                        <Link href="/activity/create" className="text-xs text-primary hover:underline mt-1 inline-block">
                            Log your first activity
                        </Link>
                    </div>
                )}
            </div>
        </CardShell>
    )
}
