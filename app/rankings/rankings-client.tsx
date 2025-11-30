"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { PageGrid } from "@/components/layout/page-grid"
import { YourRankingsWidget } from "@/components/rankings/your-rankings-widget"
import { RankingBar } from "@/components/rankings/ranking-bar"
import { InsightsCard } from "@/components/rankings/insights-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Trophy, Users, MapPin, Globe } from "lucide-react"
import { Sport } from "@prisma/client"

interface RankingsClientProps {
    sports: Sport[]
}

export function RankingsClient({ sports }: RankingsClientProps) {
    const { data: session } = useSession()
    const [sport, setSport] = useState("all")
    const [scope, setScope] = useState("global")
    const [period, setPeriod] = useState("all_time")
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [userRankings, setUserRankings] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch Leaderboard
                const leaderboardRes = await fetch(`/api/rankings/leaderboard?sport=${sport}&scope=${scope}&period=${period}`)
                const leaderboardData = await leaderboardRes.json()
                setLeaderboard(leaderboardData.leaderboard || [])

                if (session?.user?.email) { // Using email as proxy for ID check if ID not available in session user object directly yet
                    // We need userId. NextAuth session usually has it if configured. 
                    // Assuming session.user.id exists or we need to fetch it.
                    // For now, let's assume we can get it or the API handles it.
                    // Actually, the API expects userId in path.
                    // Let's assume session.user has id. If not, we might need to fetch /api/auth/session or similar.
                    // Standard NextAuth setup often needs a callback to add id to session.
                    // I'll assume it's there for now.
                    const userId = (session.user as any).id
                    if (userId) {
                        const userRes = await fetch(`/api/rankings/user/${userId}`)
                        const userData = await userRes.json()
                        setUserRankings(userData)

                        const insightsRes = await fetch(`/api/rankings/insights/${userId}`)
                        const insightsData = await insightsRes.json()
                        setInsights(insightsData.insights || [])
                    }
                }
            } catch (error) {
                console.error("Error fetching rankings data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [sport, scope, period, session])

    const leftSidebar = (
        <div className="space-y-6">
            {userRankings && <YourRankingsWidget rankings={userRankings} />}
        </div>
    )

    const rightSidebar = (
        <div className="space-y-6">
            <InsightsCard insights={insights} />
            {/* Pro Tip Card */}
            <div className="bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl shadow-lg p-6 text-white">
                <h3 className="font-semibold mb-2">Pro Tip</h3>
                <p className="text-sm text-white/90">
                    Consistency is key! Log activities at least 3 times a week to boost your ranking score multiplier.
                </p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-bg-page pb-20 md:pb-0">
            {userRankings && (
                <RankingBar rankings={userRankings.sportIndex} />
            )}

            <div className="max-w-[1400px] mx-auto px-4 pt-6 mb-6">
                <h1 className="text-3xl font-bold text-text-primary">Rankings</h1>
                <p className="text-text-secondary">See who's topping the leaderboards.</p>
            </div>

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-border-light p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-[200px]">
                                <Label className="mb-2 block text-xs font-medium text-text-muted">Sport</Label>
                                <Select value={sport} onValueChange={setSport}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Sport" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sports (Sport Index)</SelectItem>
                                        {sports.map((s) => (
                                            <SelectItem key={s.slug} value={s.slug}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex-1">
                                <Label className="mb-2 block text-xs font-medium text-text-muted">Scope</Label>
                                <div className="flex rounded-lg border border-border-medium overflow-hidden divide-x divide-border-medium">
                                    {[
                                        { id: 'global', label: 'Global', icon: Globe },
                                        { id: 'country', label: 'Country', icon: MapPin },
                                        { id: 'city', label: 'City', icon: MapPin },
                                        { id: 'friends', label: 'Friends', icon: Users },
                                    ].map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setScope(s.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${scope === s.id
                                                    ? 'bg-brand-blue text-white'
                                                    : 'bg-white text-text-secondary hover:bg-gray-50'
                                                }`}
                                        >
                                            <s.icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-[180px]">
                                <Label className="mb-2 block text-xs font-medium text-text-muted">Period</Label>
                                <Select value={period} onValueChange={setPeriod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_time">All Time</SelectItem>
                                        <SelectItem value="this_year">This Year</SelectItem>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="this_week">This Week</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-border-light">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-16">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Athlete</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Location</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Score</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Trend</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-text-muted">Loading rankings...</td>
                                        </tr>
                                    ) : leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-text-muted">No rankings found for this criteria.</td>
                                        </tr>
                                    ) : (
                                        leaderboard.map((entry) => (
                                            <tr
                                                key={entry.userId}
                                                className={`hover:bg-gray-50 transition-colors ${session?.user?.email === entry.username ? 'bg-blue-50/50' : ''
                                                    }`}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center w-8 h-8 font-bold text-text-primary">
                                                        {entry.rank === 1 && <span className="text-2xl">🥇</span>}
                                                        {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                                                        {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                                                        {entry.rank > 3 && entry.rank}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-border-light">
                                                            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                                                            <AvatarFallback>{entry.displayName?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-text-primary text-sm">{entry.displayName}</div>
                                                            {/* Friend badge could go here */}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-text-secondary">
                                                    {entry.location || "Unknown"}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-text-primary">
                                                    {entry.score.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-gray-400 text-sm">-</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </PageGrid>
        </div>
    )
}
