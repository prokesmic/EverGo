"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { PageGrid } from "@/components/layout/page-grid"
import { PageSubheader } from "@/components/layout/page-subheader"
import { YourRankingsWidget } from "@/components/rankings/your-rankings-widget"
import { InsightsCard } from "@/components/rankings/insights-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, MapPin, Globe, TrendingUp, TrendingDown, Minus, Medal, Crown, Sparkles, Filter, ChevronRight } from "lucide-react"
import { Sport } from "@prisma/client"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface RankingsClientProps {
    sports: Sport[]
}

const scopeOptions = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'country', label: 'National', icon: MapPin },
    { id: 'city', label: 'City', icon: MapPin },
    { id: 'club', label: 'Club', icon: Users },
]

export function RankingsClient({ sports }: RankingsClientProps) {
    const { data: session } = useSession()
    const searchParams = useSearchParams()

    // Initialize from URL params or localStorage
    const urlScope = searchParams.get('scope')

    const [sport, setSport] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("rankings_filter_sport") || "all"
        }
        return "all"
    })

    const [scope, setScope] = useState(() => {
        if (urlScope) return urlScope
        if (typeof window !== "undefined") {
            return localStorage.getItem("rankings_filter_scope") || "global"
        }
        return "global"
    })

    const [period, setPeriod] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("rankings_filter_period") || "all_time"
        }
        return "all_time"
    })

    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [userRankings, setUserRankings] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Persist filters to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("rankings_filter_sport", sport)
        }
    }, [sport])

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("rankings_filter_scope", scope)
        }
    }, [scope])

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("rankings_filter_period", period)
        }
    }, [period])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const leaderboardRes = await fetch(`/api/rankings/leaderboard?sport=${sport}&scope=${scope}&period=${period}`)
                const leaderboardData = await leaderboardRes.json()
                setLeaderboard(leaderboardData.leaderboard || [])

                if (session?.user?.email) {
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

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
        return <span className="text-sm font-bold text-muted-foreground tabular-nums">{rank}</span>
    }

    const getTrendIcon = (trend?: string, amount?: number) => {
        if (trend === 'up') return (
            <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                {amount && <span>+{amount}</span>}
            </span>
        )
        if (trend === 'down') return (
            <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
                <TrendingDown className="h-3.5 w-3.5" />
                {amount && <span>-{amount}</span>}
            </span>
        )
        return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    }

    const leftSidebar = (
        <>
            {userRankings && <YourRankingsWidget rankings={userRankings} />}
            {insights.length > 0 && <InsightsCard insights={insights} />}
        </>
    )

    const rightSidebar = (
        <>
            {/* Season Info */}
            <div className="card-elevated p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Winter 2025 Season</h3>
                        <p className="text-xs text-muted-foreground">12 days remaining</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Climb the leaderboard to earn exclusive season badges and rewards!
                </p>
                <Link href="/challenges" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                    View Season Challenges <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Pro Tip Card */}
            <div className="card-elevated p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                    Consistency is key! Log activities at least 3 times a week to boost your ranking score multiplier.
                </p>
            </div>
        </>
    )

    const filterBar = (
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Scope Toggle Buttons */}
            <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
                {scopeOptions.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setScope(s.id)}
                        className={cn(
                            "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                            scope === s.id
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <s.icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Sport Filter */}
            <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="w-full lg:w-[180px] h-9">
                    <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sports.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>
                            {s.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Period Filter */}
            <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-full lg:w-[150px] h-9">
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
    )

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <PageSubheader
                title="Rankings"
                subtitle="See who's topping the leaderboards"
                filters={filterBar}
            />

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                {/* Leaderboard Card */}
                <div className="card-elevated overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm">
                                {scope === 'global' ? 'Global' : scope === 'country' ? 'National' : scope === 'city' ? 'City' : 'Club'} Leaderboard
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {period === 'all_time' ? 'All Time' : period === 'this_year' ? 'This Year' : period === 'this_month' ? 'This Month' : 'This Week'}
                        </span>
                    </div>

                    {/* Leaderboard List */}
                    <div className="divide-y divide-border">
                        {loading ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <div className="animate-pulse flex flex-col items-center gap-2">
                                    <Trophy className="h-8 w-8 opacity-50" />
                                    <span>Loading rankings...</span>
                                </div>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="empty-state py-12">
                                <Trophy className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">No rankings yet</h3>
                                <p className="text-sm text-muted-foreground mb-4">Be the first to climb the leaderboard!</p>
                                <Button asChild>
                                    <Link href="/activity/create">Log Activity</Link>
                                </Button>
                            </div>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const isCurrentUser = session?.user?.email === entry.username || (session?.user as any)?.id === entry.userId
                                const isTopThree = entry.rank <= 3

                                return (
                                    <Link
                                        key={entry.userId}
                                        href={`/profile/${entry.username || entry.userId}`}
                                        className={cn(
                                            "leaderboard-row flex items-center gap-3 px-4 py-3 transition-all duration-200",
                                            "hover:bg-muted/50",
                                            isCurrentUser && "bg-primary/5 hover:bg-primary/10",
                                            isTopThree && "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20"
                                        )}
                                    >
                                        {/* Rank */}
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            isTopThree ? "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30" : "bg-muted/50"
                                        )}>
                                            {getRankBadge(entry.rank)}
                                        </div>

                                        {/* Avatar */}
                                        <Avatar className={cn(
                                            "h-10 w-10 border-2 shrink-0",
                                            isTopThree ? "border-amber-400/50" : "border-border"
                                        )}>
                                            <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                                            <AvatarFallback className="text-sm font-semibold">
                                                {entry.displayName?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Name & Location */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "font-semibold text-sm truncate",
                                                    isCurrentUser && "text-primary"
                                                )}>
                                                    {entry.displayName}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{entry.location || "Unknown location"}</span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right shrink-0">
                                            <div className={cn(
                                                "font-bold tabular-nums",
                                                isTopThree ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                            )}>
                                                {entry.score.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">points</div>
                                        </div>

                                        {/* Trend */}
                                        <div className="w-12 flex justify-end shrink-0">
                                            {getTrendIcon(entry.trend, entry.trendAmount)}
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>

                    {/* Load More */}
                    {leaderboard.length > 0 && leaderboard.length >= 20 && (
                        <div className="p-4 border-t border-border text-center">
                            <Button variant="outline" size="sm">
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            </PageGrid>
        </div>
    )
}
