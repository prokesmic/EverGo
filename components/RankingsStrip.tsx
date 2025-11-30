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
        <div className="w-full bg-white/80 backdrop-blur-md border border-white/20 shadow-sm rounded-xl py-3 px-6 mb-6 flex items-center justify-between overflow-x-auto no-scrollbar gap-8">
            {rankings.map((stat, index) => (
                <div key={stat.scope} className="flex items-center gap-3 min-w-fit group">
                    <div className={cn(
                        "p-2 rounded-full bg-gray-50 text-gray-500 transition-colors group-hover:bg-brand-blue/10 group-hover:text-brand-blue",
                        stat.rank <= 3 && "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100 group-hover:text-yellow-700"
                    )}>
                        {getIcon(stat.scope)}
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                            {getLabel(stat.scope)}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">#{stat.rank}</span>
                            <span className="text-xs text-gray-400 font-medium">/ {stat.totalParticipants}</span>
                            {getTrendIcon(stat.trend)}
                        </div>
                    </div>

                    {/* Divider */}
                    {index < rankings.length - 1 && (
                        <div className="h-8 w-px bg-gray-200 ml-4 hidden md:block"></div>
                    )}
                </div>
            ))}

            {rankings.length === 0 && (
                <div className="text-sm text-gray-500 w-full text-center">
                    Complete your first activity to see your rankings!
                </div>
            )}
        </div>
    )
}
