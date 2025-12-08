"use client"

import { Trophy, Globe, MapPin, Users, TrendingUp, Minus, TrendingDown, ChevronRight, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface RankingStat {
    scope: "CLUB" | "CITY" | "COUNTRY" | "GLOBAL"
    rank: number
    totalParticipants: number
    trend?: "up" | "down" | "same"
    trendValue?: number
}

interface RankingsStripProps {
    rankings: RankingStat[]
    seasonName?: string
    seasonDaysLeft?: number
}

export function RankingsStrip({ rankings, seasonName = "Winter 2025", seasonDaysLeft = 12 }: RankingsStripProps) {
    const getIcon = (scope: string) => {
        switch (scope) {
            case "CLUB": return <Users className="h-4 w-4" />
            case "CITY": return <MapPin className="h-4 w-4" />
            case "COUNTRY": return <Trophy className="h-4 w-4" />
            case "GLOBAL": return <Globe className="h-4 w-4" />
            default: return <Trophy className="h-4 w-4" />
        }
    }

    const getLabel = (scope: string) => {
        switch (scope) {
            case "CLUB": return "Club"
            case "CITY": return "City"
            case "COUNTRY": return "National"
            case "GLOBAL": return "Global"
            default: return "Rank"
        }
    }

    const getScopeFilter = (scope: string) => {
        switch (scope) {
            case "CLUB": return "club"
            case "CITY": return "city"
            case "COUNTRY": return "country"
            case "GLOBAL": return "global"
            default: return "global"
        }
    }

    const getTrendIcon = (trend?: "up" | "down" | "same", value?: number) => {
        switch (trend) {
            case "up": return (
                <span className="flex items-center gap-0.5 text-green-500 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {value && <span>+{value}</span>}
                </span>
            )
            case "down": return (
                <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
                    <TrendingDown className="h-3 w-3" />
                    {value && <span>-{value}</span>}
                </span>
            )
            default: return <Minus className="h-3 w-3 text-muted-foreground" />
        }
    }

    return (
        <div className="card-elevated p-3 mb-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Rankings Segments */}
            <div className="flex items-center gap-1 flex-1">
                {rankings.map((stat, index) => (
                    <Link
                        key={stat.scope}
                        href={`/rankings?scope=${getScopeFilter(stat.scope)}`}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 group min-w-fit",
                            "hover:bg-muted/80 active:scale-[0.98]",
                            stat.rank <= 3 && "bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            stat.rank <= 3
                                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                            {getIcon(stat.scope)}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                {getLabel(stat.scope)}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className={cn(
                                    "text-base font-bold tabular-nums",
                                    stat.rank <= 3 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                )}>
                                    #{stat.rank}
                                </span>
                                <span className="text-xs text-muted-foreground">/ {stat.totalParticipants.toLocaleString()}</span>
                                {getTrendIcon(stat.trend, stat.trendValue)}
                            </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground ml-1 transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Season Badge */}
            {seasonName && (
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 ml-auto shrink-0">
                    <Award className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">{seasonName}</span>
                        <span className="text-[10px] text-muted-foreground">{seasonDaysLeft} days left</span>
                    </div>
                </div>
            )}

            {rankings.length === 0 && (
                <div className="flex items-center justify-center gap-2 w-full py-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm">Complete your first activity to see your rankings!</span>
                </div>
            )}
        </div>
    )
}
