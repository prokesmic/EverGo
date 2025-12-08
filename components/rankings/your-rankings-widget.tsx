"use client"

import { CardShell } from "@/components/ui/CardShell"
import { Trophy, TrendingUp, TrendingDown, Award, ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface RankingSport {
    slug: string
    name: string
    icon: string
    scopeName: string
    rank: number
    trend: 'up' | 'down' | 'same'
    trendAmount: number
}

interface YourRankingsWidgetProps {
    rankings: {
        sportIndex: {
            score: number
            percentile: number
            globalRank: number
        }
        sports: RankingSport[]
    }
}

export function YourRankingsWidget({ rankings }: YourRankingsWidgetProps) {
    if (!rankings) return null

    return (
        <div className="card-elevated overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Your Rankings</span>
                </div>
                <Link href="/profile/me/stats" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Sport Rankings List */}
            <div className="divide-y divide-border">
                {rankings.sports.map((sport) => (
                    <div key={sport.slug} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{sport.icon}</span>
                            <div>
                                <div className="font-medium text-sm">{sport.name}</div>
                                <div className="text-xs text-muted-foreground">{sport.scopeName}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm tabular-nums">#{sport.rank.toLocaleString()}</span>
                            {sport.trend === 'up' && (
                                <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium">
                                    <TrendingUp className="h-3 w-3" />
                                    {sport.trendAmount}
                                </span>
                            )}
                            {sport.trend === 'down' && (
                                <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
                                    <TrendingDown className="h-3 w-3" />
                                    {sport.trendAmount}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sport Index Footer */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-xs text-primary-foreground/80 font-medium">Your Sport Index</div>
                        <div className="text-2xl font-bold tracking-tight">{rankings.sportIndex.score}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-primary-foreground/80 font-medium">Top {rankings.sportIndex.percentile}%</div>
                        <div className="text-sm font-semibold">#{rankings.sportIndex.globalRank.toLocaleString()} globally</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
