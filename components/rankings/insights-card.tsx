"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Lightbulb, Trophy, Target, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
    type: 'rank_up' | 'rank_down' | 'close_to_milestone' | 'friend_nearby' | 'improvement'
    message: string
    actionText?: string
    actionUrl?: string
    priority: number
}

interface InsightsCardProps {
    insights: Insight[]
}

const insightIcons: Record<string, { icon: string; bgClass: string }> = {
    'friend_nearby': { icon: '🏃', bgClass: 'bg-blue-50 dark:bg-blue-950/30' },
    'close_to_milestone': { icon: '🎯', bgClass: 'bg-amber-50 dark:bg-amber-950/30' },
    'rank_up': { icon: '🏆', bgClass: 'bg-green-50 dark:bg-green-950/30' },
    'rank_down': { icon: '📉', bgClass: 'bg-red-50 dark:bg-red-950/30' },
    'improvement': { icon: '📈', bgClass: 'bg-purple-50 dark:bg-purple-950/30' },
}

export function InsightsCard({ insights }: InsightsCardProps) {
    if (!insights || insights.length === 0) return null

    return (
        <div className="card-elevated overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Insights</span>
            </div>

            {/* Insights List */}
            <div className="p-3 space-y-2">
                {insights.slice(0, 3).map((insight, index) => {
                    const config = insightIcons[insight.type] || insightIcons['improvement']
                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-xl border border-border/50",
                                config.bgClass
                            )}
                        >
                            <span className="text-lg shrink-0">{config.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground leading-relaxed">{insight.message}</p>
                                {insight.actionText && (
                                    <Link
                                        href={insight.actionUrl || "#"}
                                        className="text-xs text-primary hover:underline font-medium mt-1.5 inline-flex items-center gap-1"
                                    >
                                        {insight.actionText}
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
