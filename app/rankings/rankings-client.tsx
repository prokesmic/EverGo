"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { PageGrid } from "@/components/layout/page-grid"
import { PageSubheader } from "@/components/layout/page-subheader"
import { YourRankingsWidget } from "@/components/rankings/your-rankings-widget"
import { InsightsCard } from "@/components/rankings/insights-card"
import { ScopeSelector, type LeaderboardScope } from "@/components/leaderboards/ScopeSelector"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Users, MapPin, Globe, TrendingUp, TrendingDown, Minus, Medal, Crown, Sparkles, Activity, Timer, Target, ChevronRight, CheckCircle2 } from "lucide-react"
import { MobileFiltersSheet } from "@/components/layout/MobileFiltersSheet"
import { Sport } from "@prisma/client"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface RankingsClientProps {
    sports: Sport[]
}

type RankingMode = "benchmark" | "most-active"

interface Team {
    id: string
    name: string
    logoUrl: string | null
}

interface LocationInfo {
    hasCountry: boolean
    hasCity: boolean
    country: string | null
    city: string | null
}

interface LeaderboardRow {
    userId: string
    displayName: string
    avatarUrl: string | null
    value: number
    formattedValue: string
    rank: number
}

interface LeaderboardResult {
    meta: {
        key: string
        label: string
        unit: string
        order: "ASC" | "DESC"
    }
    top: LeaderboardRow[]
    me: LeaderboardRow | null
    delta: number | null
    total: number
    scopeLabel: string
}

interface BenchmarkOption {
    id: string
    slug: string
    name: string
    unit: string
}

// Inner component that uses useSearchParams
function RankingsContent({ sports }: RankingsClientProps) {
    const { data: session } = useSession()
    const searchParams = useSearchParams()

    // Initialize from URL params or localStorage
    const urlScope = searchParams.get('scope')?.toUpperCase() as LeaderboardScope | null
    const urlMode = searchParams.get('mode') as RankingMode | null
    const urlTeamId = searchParams.get('teamId') ?? undefined

    const [mode, setMode] = useState<RankingMode>(() => {
        if (urlMode === "benchmark" || urlMode === "most-active") return urlMode
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("rankings_mode")
            if (saved === "benchmark" || saved === "most-active") return saved
        }
        return "most-active"
    })

    const [sport, setSport] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("rankings_filter_sport") || "running"
        }
        return "running"
    })

    const [scope, setScope] = useState<LeaderboardScope>(() => {
        if (urlScope && ["GLOBAL", "COUNTRY", "CITY", "TEAM"].includes(urlScope)) {
            return urlScope
        }
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("rankings_filter_scope")
            if (saved && ["GLOBAL", "COUNTRY", "CITY", "TEAM"].includes(saved)) {
                return saved as LeaderboardScope
            }
        }
        return "GLOBAL"
    })

    const [teamId, setTeamId] = useState<string | undefined>(urlTeamId)
    const [teams, setTeams] = useState<Team[]>([])
    const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null)

    const [benchmarks, setBenchmarks] = useState<BenchmarkOption[]>([])
    const [selectedBenchmark, setSelectedBenchmark] = useState<string>("")
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardResult | null>(null)
    const [userRankings, setUserRankings] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Persist mode to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("rankings_mode", mode)
        }
    }, [mode])

    // Persist filters to localStorage
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

    // Fetch user context (teams and location) on mount
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const res = await fetch("/api/leaderboards", { method: "POST" })
                if (res.ok) {
                    const data = await res.json()
                    setTeams(data.teams || [])
                    setLocationInfo(data.locationInfo || null)

                    // Auto-select first team if TEAM scope but no team selected
                    if (scope === "TEAM" && !teamId && data.teams?.length > 0) {
                        setTeamId(data.teams[0].id)
                    }
                }
            } catch (error) {
                console.error("Error fetching context:", error)
            }
        }

        if (session?.user) {
            fetchContext()
        }
    }, [session])

    // Fetch benchmarks when sport changes (for benchmark mode)
    useEffect(() => {
        if (mode !== "benchmark") return

        const fetchBenchmarks = async () => {
            try {
                const res = await fetch(`/api/rankings/benchmark?sportSlug=${sport}`)
                const data = await res.json()
                setBenchmarks(data.benchmarks || [])
                if (data.benchmarks?.length > 0 && !selectedBenchmark) {
                    setSelectedBenchmark(data.benchmarks[0].id)
                }
            } catch (error) {
                console.error("Error fetching benchmarks:", error)
                setBenchmarks([])
            }
        }

        fetchBenchmarks()
    }, [sport, mode])

    // Fetch leaderboard data using new API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Determine metricKey based on mode
                let metricKey = "activity:score"
                if (mode === "benchmark" && selectedBenchmark) {
                    // For benchmark mode, we need to map benchmarkId to metricKey
                    const benchmark = benchmarks.find((b) => b.id === selectedBenchmark)
                    if (benchmark) {
                        metricKey = `${sport}:${benchmark.slug}`
                    }
                } else if (mode === "most-active") {
                    metricKey = "activity:effort"
                }

                // Build query params
                const params = new URLSearchParams({
                    metricKey,
                    scope,
                    limit: "50",
                })
                if (scope === "TEAM" && teamId) {
                    params.set("teamId", teamId)
                }

                const res = await fetch(`/api/leaderboards?${params}`)
                if (res.ok) {
                    const data: LeaderboardResult = await res.json()
                    setLeaderboardData(data)
                } else {
                    setLeaderboardData(null)
                }

                // Fetch user-specific data (legacy API)
                if (session?.user?.email) {
                    const userId = (session.user as any).id
                    if (userId) {
                        const [userRes, insightsRes] = await Promise.all([
                            fetch(`/api/rankings/user/${userId}`),
                            fetch(`/api/rankings/insights/${userId}`),
                        ])
                        if (userRes.ok) {
                            setUserRankings(await userRes.json())
                        }
                        if (insightsRes.ok) {
                            const insightsData = await insightsRes.json()
                            setInsights(insightsData.insights || [])
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching rankings data:", error)
            } finally {
                setLoading(false)
            }
        }

        // Wait for benchmarks to load before fetching benchmark leaderboard
        if (mode === "benchmark" && !selectedBenchmark && benchmarks.length === 0) {
            return
        }

        fetchData()
    }, [mode, sport, scope, teamId, selectedBenchmark, session, benchmarks])

    const handleScopeChange = (newScope: LeaderboardScope, newTeamId?: string) => {
        setScope(newScope)
        setTeamId(newTeamId)
    }

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
        return <span className="text-sm font-bold text-muted-foreground tabular-nums">{rank}</span>
    }

    const getDeltaDisplay = (delta: number | null) => {
        if (delta === null) return null
        if (delta > 0) {
            return (
                <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +{delta}
                </span>
            )
        }
        if (delta < 0) {
            return (
                <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
                    <TrendingDown className="h-3 w-3" />
                    {delta}
                </span>
            )
        }
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }

    const leftSidebar = (
        <>
            {userRankings && <YourRankingsWidget rankings={userRankings} />}
            {insights.length > 0 && <InsightsCard insights={insights} />}
        </>
    )

    const rightSidebar = (
        <>
            {/* Mode Explanation */}
            <div className="card-elevated p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                        {mode === "most-active" ? (
                            <Activity className="h-5 w-5 text-primary" />
                        ) : (
                            <Target className="h-5 w-5 text-primary" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">
                            {mode === "most-active" ? "Most Active" : "Performance Rankings"}
                        </h3>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    {mode === "most-active"
                        ? "Rankings based on total activity effort over the last 30 days. Effort is calculated from duration, intensity, and sport type."
                        : "Rankings based on actual performance in specific benchmarks like 5K time, max bench press, etc."}
                </p>
            </div>

            {/* Your Rank Card */}
            {leaderboardData?.me && (
                <div className="card-elevated p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        Your Position
                    </h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">#{leaderboardData.me.rank}</div>
                            <div className="text-xs text-muted-foreground">
                                of {leaderboardData.total.toLocaleString()} {leaderboardData.scopeLabel}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold">{leaderboardData.me.formattedValue}</div>
                            {getDeltaDisplay(leaderboardData.delta)}
                        </div>
                    </div>
                </div>
            )}

            {/* Pro Tip Card */}
            <div className="card-elevated p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                    {mode === "most-active"
                        ? "Log activities consistently to climb the Most Active leaderboard. Quality matters too - higher intensity workouts earn more effort points!"
                        : "Record your personal bests in official benchmarks to compete on sport-specific leaderboards."}
                </p>
            </div>
        </>
    )

    // Mobile filter content
    const filterContent = (
        <div className="flex flex-col gap-4">
            {/* Mode Toggle */}
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Ranking Type</label>
                <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
                    <button
                        onClick={() => setMode("most-active")}
                        className={cn(
                            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1",
                            mode === "most-active"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Most Active</span>
                    </button>
                    <button
                        onClick={() => setMode("benchmark")}
                        className={cn(
                            "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1",
                            mode === "benchmark"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>Benchmarks</span>
                    </button>
                </div>
            </div>

            {/* Scope Section */}
            <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Scope</label>
                <ScopeSelector
                    scope={scope}
                    teamId={teamId}
                    onScopeChange={handleScopeChange}
                    teams={teams}
                    locationInfo={locationInfo ?? undefined}
                />
            </div>

            {/* Sport Filter (for benchmark mode) */}
            {mode === "benchmark" && (
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Sport</label>
                    <Select value={sport} onValueChange={setSport}>
                        <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent>
                            {sports.map((s) => (
                                <SelectItem key={s.slug} value={s.slug}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Benchmark Filter (for benchmark mode) */}
            {mode === "benchmark" && benchmarks.length > 0 && (
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Benchmark</label>
                    <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
                        <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Select Benchmark" />
                        </SelectTrigger>
                        <SelectContent>
                            {benchmarks.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )

    const filterBar = (
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Mobile Filters Button */}
            <MobileFiltersSheet
                title="Filter Rankings"
                description="Customize your leaderboard view"
                triggerLabel="Filters"
                onClear={() => {
                    setMode("most-active")
                    setScope("GLOBAL")
                    setSport("running")
                    setTeamId(undefined)
                }}
            >
                {filterContent}
            </MobileFiltersSheet>

            {/* Desktop Filters */}
            <div className="hidden lg:flex lg:flex-row gap-3 items-center flex-wrap">
                {/* Mode Toggle */}
                <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
                    <button
                        onClick={() => setMode("most-active")}
                        className={cn(
                            "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                            mode === "most-active"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Most Active</span>
                    </button>
                    <button
                        onClick={() => setMode("benchmark")}
                        className={cn(
                            "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                            mode === "benchmark"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Target className="w-3.5 h-3.5" />
                        <span>Benchmarks</span>
                    </button>
                </div>

                {/* Scope Selector */}
                <ScopeSelector
                    scope={scope}
                    teamId={teamId}
                    onScopeChange={handleScopeChange}
                    teams={teams}
                    locationInfo={locationInfo ?? undefined}
                />

                {/* Sport Filter (for benchmark mode) */}
                {mode === "benchmark" && (
                    <Select value={sport} onValueChange={setSport}>
                        <SelectTrigger className="w-[150px] h-9">
                            <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent>
                            {sports.map((s) => (
                                <SelectItem key={s.slug} value={s.slug}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {/* Benchmark Filter */}
                {mode === "benchmark" && benchmarks.length > 0 && (
                    <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue placeholder="Select Benchmark" />
                        </SelectTrigger>
                        <SelectContent>
                            {benchmarks.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    )

    const leaderboard = leaderboardData?.top || []

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            {/* Aurora Header */}
            <div className="hero-gradient border-b border-border">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                        <div>
                            <p className="eg-chip mb-2">
                                <span className="eg-live-dot" />
                                Real-time rankings
                            </p>
                            <h1 className="text-3xl font-bold text-foreground">
                                {mode === "most-active" ? "Most Active Athletes" : "Performance Rankings"}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                                {mode === "most-active"
                                    ? "See who's putting in the most effort across all sports."
                                    : leaderboardData?.meta
                                        ? `${leaderboardData.meta.label} rankings - showing real performance`
                                        : "Compare your personal bests in specific benchmarks."}
                            </p>
                        </div>
                    </div>
                    {filterBar}
                </div>
            </div>

            <PageSubheader
                title=""
                subtitle=""
                filters={null}
            />

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                {/* Leaderboard Card */}
                <div className="card-elevated overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {mode === "most-active" ? (
                                <Activity className="h-4 w-4 text-primary" />
                            ) : (
                                <Target className="h-4 w-4 text-primary" />
                            )}
                            <span className="font-semibold text-sm">
                                {leaderboardData?.scopeLabel || "Global"} Leaderboard
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {leaderboardData?.total
                                ? `${leaderboardData.total.toLocaleString()} athletes`
                                : "Loading..."}
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
                                <p className="text-sm text-muted-foreground mb-4">
                                    {mode === "benchmark"
                                        ? "Be the first to set a personal best in this benchmark!"
                                        : "Start logging activities to appear on the leaderboard!"}
                                </p>
                                <Button asChild>
                                    <Link href="/activity/create">Log Activity</Link>
                                </Button>
                            </div>
                        ) : (
                            leaderboard.map((entry) => {
                                const isCurrentUser = (session?.user as any)?.id === entry.userId
                                const isTopThree = entry.rank <= 3

                                return (
                                    <Link
                                        key={entry.userId}
                                        href={`/profile/${entry.userId}`}
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
                                            <AvatarImage src={entry.avatarUrl || undefined} alt={entry.displayName} />
                                            <AvatarFallback className="text-sm font-semibold">
                                                {entry.displayName?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Name */}
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
                                        </div>

                                        {/* Value */}
                                        <div className="text-right shrink-0">
                                            <div className={cn(
                                                "font-bold tabular-nums",
                                                isTopThree ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                            )}>
                                                {entry.formattedValue}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })
                        )}
                    </div>

                    {/* Load More */}
                    {leaderboard.length > 0 && leaderboard.length >= 50 && (
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

// Loading fallback for Suspense
function RankingsLoadingFallback() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-2">
                <Trophy className="h-8 w-8 opacity-50 text-muted-foreground" />
                <span className="text-muted-foreground">Loading rankings...</span>
            </div>
        </div>
    )
}

// Exported wrapper component with Suspense boundary
export function RankingsClient({ sports }: RankingsClientProps) {
    return (
        <Suspense fallback={<RankingsLoadingFallback />}>
            <RankingsContent sports={sports} />
        </Suspense>
    )
}
