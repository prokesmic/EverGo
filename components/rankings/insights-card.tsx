"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Trophy, Target, TrendingUp, MapPin } from "lucide-react"

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

export function InsightsCard({ insights }: InsightsCardProps) {
    if (!insights || insights.length === 0) return null

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                        <div className="text-xl shrink-0 mt-0.5">
                            {insight.type === 'friend_nearby' && '🏃'}
                            {insight.type === 'close_to_milestone' && '🎯'}
                            {insight.type === 'rank_up' && '🏆'}
                            {insight.type === 'improvement' && '📈'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-relaxed">{insight.message}</p>
                            {insight.actionText && (
                                <Button variant="link" className="h-auto p-0 text-brand-blue font-medium mt-1" asChild>
                                    <Link href={insight.actionUrl || "#"}>
                                        {insight.actionText} <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
