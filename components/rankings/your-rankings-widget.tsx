"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

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
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">Your Rankings</CardTitle>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border-light">
                    {rankings.sports.map((sport) => (
                        <div key={sport.slug} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{sport.icon}</span>
                                <div>
                                    <div className="font-medium text-sm">{sport.name}</div>
                                    <div className="text-xs text-muted-foreground">{sport.scopeName}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-ranking-gold" />
                                <span className="font-bold text-sm">#{sport.rank.toLocaleString()}</span>
                                {sport.trend === 'up' && (
                                    <span className="text-success text-xs font-medium">↑{sport.trendAmount}</span>
                                )}
                                {sport.trend === 'down' && (
                                    <span className="text-error text-xs font-medium">↓{sport.trendAmount}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sport Index Footer */}
                <div className="px-4 py-3 bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white mt-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-blue-100 font-medium">Your Sport Index</div>
                            <div className="text-2xl font-bold tracking-tight">{rankings.sportIndex.score}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-blue-100 font-medium">Top {rankings.sportIndex.percentile}%</div>
                            <div className="text-sm font-medium">#{rankings.sportIndex.globalRank.toLocaleString()} globally</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
