"use client"

import { Trophy } from "lucide-react"

interface RankingBarProps {
    rankings: {
        city: { rank: number; name: string }
        country: { rank: number; name: string }
        global: { rank: number }
    }
}

export function RankingBar({ rankings }: RankingBarProps) {
    if (!rankings) return null

    return (
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white text-sm md:text-base">
                    {/* City Rank */}
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-ranking-gold" />
                        <span className="font-bold">#{rankings.city.rank.toLocaleString()}</span>
                        <span className="text-blue-100">in {rankings.city.name}</span>
                    </div>

                    {/* Country Rank */}
                    <div className="flex items-center gap-2 border-l border-white/20 pl-8 hidden sm:flex">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-ranking-silver" />
                        <span className="font-bold">#{rankings.country.rank.toLocaleString()}</span>
                        <span className="text-blue-100">in {rankings.country.name}</span>
                    </div>

                    {/* Global Rank */}
                    <div className="flex items-center gap-2 border-l border-white/20 pl-8 hidden md:flex">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-ranking-bronze" />
                        <span className="font-bold">#{rankings.global.rank.toLocaleString()}</span>
                        <span className="text-blue-100">Worldwide</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
