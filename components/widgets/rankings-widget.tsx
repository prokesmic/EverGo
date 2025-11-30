"use client"

import { useState } from "react"
import { Trophy, ChevronRight, Medal } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Period = "Weekly" | "Monthly" | "All-time"
type Scope = "Club" | "City" | "Country" | "Global"

export interface RankingItem {
    rank: number
    name: string
    value: string
    avatarUrl: string
    isCurrentUser: boolean
}

interface RankingsWidgetProps {
    rankings: RankingItem[]
    userRank?: number
}

export function RankingsWidget({ rankings: initialRankings, userRank }: RankingsWidgetProps) {
    const [period, setPeriod] = useState<Period>("Weekly")
    const [scope, setScope] = useState<Scope>("Club")

    // In a real app, we would fetch data based on period/scope here.
    // For now, we use the passed initialRankings as a base and mock the rest if needed,
    // or just display the passed rankings regardless of tabs for MVP.
    const displayRankings = initialRankings.length > 0 ? initialRankings : []

    return (
        <CardShell
            title="Rankings"
            icon={<Trophy className="h-5 w-5" />}
            action={<Link href="/rankings" className="flex items-center">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
                {(["Weekly", "Monthly", "All-time"] as Period[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                            period === p ? "bg-white text-brand-blue shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* Scope Toggle */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                {(["Club", "City", "Country", "Global"] as Scope[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => setScope(s)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors",
                            scope === s
                                ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Summary */}
            {userRank && (
                <div className="text-sm text-gray-600 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    You are <span className="font-bold text-brand-blue">#{userRank}</span> in your {scope.toLowerCase()} this {period.toLowerCase()} 🎉
                </div>
            )}

            {/* List */}
            <div className="space-y-1">
                {displayRankings.map((user) => (
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
                            <div className="text-xs text-gray-500">Running</div>
                        </div>

                        <div className="text-sm font-bold text-gray-900">{user.value}</div>
                    </div>
                ))}
                {displayRankings.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No rankings available yet.
                    </div>
                )}
            </div>
        </CardShell>
    )
}
