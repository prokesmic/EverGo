"use client"

import { useState, useEffect } from "react"
import { Trophy, ChevronRight, Activity, Target } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"

type RankingMode = "most-active" | "benchmark"
type Scope = "global" | "country" | "city"

export interface RankingItem {
    rank: number
    name: string
    value: string
    subtitle?: string
    avatarUrl: string
    isCurrentUser: boolean
}

interface RankingsWidgetProps {
    rankings?: RankingItem[]
    userRank?: number
}

export function RankingsWidget({ rankings: initialRankings = [], userRank }: RankingsWidgetProps) {
    const [mode, setMode] = useState<RankingMode>("most-active")
    const [scope, setScope] = useState<Scope>("global")
    const [rankings, setRankings] = useState<RankingItem[]>(initialRankings)
    const [loading, setLoading] = useState(false)
    const [currentUserRank, setCurrentUserRank] = useState(userRank)

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true)
            try {
                if (mode === "most-active") {
                    const res = await fetch(`/api/rankings/most-active?scope=${scope}&windowDays=28&limit=5`)
                    const data = await res.json()

                    const formatted: RankingItem[] = (data.entries || []).map((entry: any) => ({
                        rank: entry.rank,
                        name: entry.displayName || entry.username || "Unknown",
                        value: `${entry.activityScore}`,
                        subtitle: `${entry.activityCount} activities`,
                        avatarUrl: entry.avatarUrl || "",
                        isCurrentUser: false, // Will be set by parent if needed
                    }))
                    setRankings(formatted)
                } else {
                    // For benchmark mode, we'd need to select a benchmark
                    // For now, just show placeholder
                    setRankings([])
                }
            } catch (error) {
                console.error("Error fetching rankings:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchRankings()
    }, [mode, scope])

    const displayRankings = rankings.length > 0 ? rankings : initialRankings

    return (
        <CardShell
            title="Rankings"
            icon={<Trophy className="h-5 w-5" />}
            action={<Link href="/rankings" className="flex items-center">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            {/* Mode Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                <button
                    onClick={() => setMode("most-active")}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                        mode === "most-active" ? "bg-white text-brand-blue shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Activity className="h-3 w-3" />
                    Most Active
                </button>
                <button
                    onClick={() => setMode("benchmark")}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1",
                        mode === "benchmark" ? "bg-white text-brand-blue shadow-sm" : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    <Target className="h-3 w-3" />
                    Benchmarks
                </button>
            </div>

            {/* Scope Toggle */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                {([
                    { id: "global" as Scope, label: "Global" },
                    { id: "country" as Scope, label: "National" },
                    { id: "city" as Scope, label: "City" },
                ]).map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setScope(s.id)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                            scope === s.id
                                ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Summary */}
            {currentUserRank && (
                <div className="text-sm text-gray-600 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    You are <span className="font-bold text-brand-blue">#{currentUserRank}</span> {scope === "global" ? "globally" : `in your ${scope}`}
                </div>
            )}

            {/* List */}
            <div className="space-y-1">
                {loading ? (
                    <div className="text-center py-8 text-gray-500 text-sm animate-pulse">
                        Loading rankings...
                    </div>
                ) : displayRankings.length > 0 ? (
                    displayRankings.map((user) => (
                        <div
                            key={user.rank}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                user.isCurrentUser ? "bg-brand-blue/5 border border-brand-blue/10" : "hover:bg-gray-50"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                                user.rank === 1 ? "bg-yellow-400 text-white shadow-sm" :
                                    user.rank === 2 ? "bg-gray-300 text-white shadow-sm" :
                                        user.rank === 3 ? "bg-amber-600 text-white shadow-sm" :
                                            "bg-gray-100 text-gray-600"
                            )}>
                                {user.rank}
                            </div>

                            <Avatar className="h-8 w-8 border border-gray-100">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate text-gray-900 flex items-center gap-1">
                                    {user.name}
                                    {user.isCurrentUser && <span className="text-[10px] bg-brand-blue text-white px-1 rounded">YOU</span>}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {user.subtitle || (mode === "most-active" ? "Activity Score" : "Personal Best")}
                                </div>
                            </div>

                            <div className="text-sm font-bold text-gray-900">{user.value}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        {mode === "benchmark"
                            ? "Select a benchmark on the Rankings page to see leaderboards."
                            : "No activity data yet. Start logging to appear!"}
                    </div>
                )}
            </div>
        </CardShell>
    )
}
