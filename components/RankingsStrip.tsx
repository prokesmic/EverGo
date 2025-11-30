import { Trophy, Globe, MapPin, Users, TrendingUp, Minus, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RankingStat {
    scope: "CLUB" | "CITY" | "COUNTRY" | "GLOBAL"
    rank: number
    totalParticipants: number
    trend?: "up" | "down" | "same"
}

interface RankingsStripProps {
    rankings: RankingStat[]
}

export function RankingsStrip({ rankings }: RankingsStripProps) {
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
            case "CLUB": return "Club Rank"
            case "CITY": return "City Rank"
            case "COUNTRY": return "National Rank"
            case "GLOBAL": return "Global Rank"
            default: return "Rank"
        }
    }

    const getTrendIcon = (trend?: "up" | "down" | "same") => {
        switch (trend) {
            case "up": return <TrendingUp className="h-3 w-3 text-green-500" />
            case "down": return <TrendingDown className="h-3 w-3 text-red-500" />
            default: return <Minus className="h-3 w-3 text-gray-400" />
        }
    }

    return (
        <div className="w-full bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white shadow-lg rounded-xl py-3 px-6 mb-0 flex items-center justify-between overflow-x-auto no-scrollbar gap-8 border border-white/10">
            {rankings.map((stat, index) => (
                <div key={stat.scope} className="flex items-center gap-3 min-w-fit group">
                    <div className={cn(
                        "p-2 rounded-full bg-white/10 text-white/80 transition-colors group-hover:bg-brand-blue group-hover:text-white",
                        stat.rank <= 3 && "bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white"
                    )}>
                        {getIcon(stat.scope)}
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">
                            {getLabel(stat.scope)}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">#{stat.rank}</span>
                            <span className="text-xs text-white/40 font-medium">/ {stat.totalParticipants}</span>
                            {getTrendIcon(stat.trend)}
                        </div>
                    </div>

                    {/* Divider */}
                    {index < rankings.length - 1 && (
                        <div className="h-8 w-px bg-white/10 ml-4 hidden md:block"></div>
                    )}
                </div>
            ))}

            {rankings.length === 0 && (
                <div className="text-sm text-white/60 w-full text-center">
                    Complete your first activity to see your rankings!
                </div>
            )}
        </div>
    )
}
