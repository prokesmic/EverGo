import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal } from "lucide-react"
import Link from "next/link"

export interface RankingEntry {
    userId: string
    displayName: string
    username: string
    avatarUrl: string | null
    value: number
    unit: string
    rank: number
}

interface LeaderboardProps {
    entries: RankingEntry[]
    metricLabel: string
}

export function Leaderboard({ entries, metricLabel }: LeaderboardProps) {
    if (entries.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No rankings available for this period.</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center">Rank</th>
                            <th className="px-4 py-3">Athlete</th>
                            <th className="px-4 py-3 text-right">{metricLabel}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {entries.map((entry) => (
                            <tr key={entry.userId} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 text-center font-bold text-muted-foreground">
                                    {entry.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />}
                                    {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400 mx-auto" />}
                                    {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-700 mx-auto" />}
                                    {entry.rank > 3 && entry.rank}
                                </td>
                                <td className="px-4 py-3">
                                    <Link href={`/profile/${entry.username}`} className="flex items-center gap-3 hover:underline">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={entry.avatarUrl || ""} alt={entry.displayName} />
                                            <AvatarFallback>{entry.displayName[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{entry.displayName}</span>
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-medium">
                                    {entry.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                    <span className="text-xs text-muted-foreground ml-1">{entry.unit}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
