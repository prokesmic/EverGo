"use client"

import { useState, useEffect, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { PageGrid } from "@/components/layout/page-grid"
import { PageSubheader } from "@/components/layout/page-subheader"
import { YourRankingsWidget } from "@/components/rankings/your-rankings-widget"
import { InsightsCard } from "@/components/rankings/insights-card"
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

const scopeOptions = [
    { id: 'global', label: 'Global', icon: Globe },
    { id: 'country', label: 'National', icon: MapPin },
    { id: 'city', label: 'City', icon: MapPin },
]

interface BenchmarkOption {
    id: string
    slug: string
    name: string
    unit: string
}

interface BenchmarkEntry {
    rank: number
    userId: string
    username: string | null
    displayName: string
    avatarUrl: string | null
    value: number
    formattedValue: string
    achievedAt: string
    verified: boolean
    location: string | null
}

interface MostActiveEntry {
    rank: number
    userId: string
    username: string | null
    displayName: string
    avatarUrl: string | null
    activityScore: number
    totalEffort: number
    activityCount: number
    location: string | null
}

// Inner component that uses useSearchParams
function RankingsContent({ sports }: RankingsClientProps) {
    const { data: session } = useSession()
    const searchParams = useSearchParams()

    // Initialize from URL params or localStorage
    const urlScope = searchParams.get('scope')
    const urlMode = searchParams.get('mode') as RankingMode | null

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

    const [scope, setScope] = useState(() => {
        if (urlScope) return urlScope
        if (typeof window !== "undefined") {
            return localStorage.getItem("rankings_filter_scope") || "global"
        }
        return "global"
    })

    const [windowDays, setWindowDays] = useState(28)
    const [benchmarks, setBenchmarks] = useState<BenchmarkOption[]>([])
    const [selectedBenchmark, setSelectedBenchmark] = useState<string>("")
    const [benchmarkLeaderboard, setBenchmarkLeaderboard] = useState<BenchmarkEntry[]>([])
    const [mostActiveLeaderboard, setMostActiveLeaderboard] = useState<MostActiveEntry[]>([])
    const [benchmarkMeta, setBenchmarkMeta] = useState<any>(null)
    const [userRankings, setUserRankings] = useState<any>(null)
    const [insights, setInsights] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Persist mode to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("rankings_mode", mode)
        }
    }, [mode])

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

    // Fetch benchmarks when sport changes (for benchmark mode)
    useEffect(() => {
        if (mode !== "benchmark") return

        const fetchBenchmarks = async () => {
            try {
                const res = await fetch(`/api/rankings/benchmark?sportSlug=${sport}`)
                const data = await res.json()
                setBenchmarks(data.benchmarks || [])
                // Auto-select first benchmark if none selected
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

    // Fetch leaderboard data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                if (mode === "most-active") {
                    // Fetch Most Active leaderboard
                    const res = await fetch(`/api/rankings/most-active?scope=${scope}&windowDays=${windowDays}`)
                    const data = await res.json()
                    setMostActiveLeaderboard(data.entries || [])
                } else if (mode === "benchmark" && selectedBenchmark) {
                    // Fetch Benchmark leaderboard
                    const res = await fetch(`/api/rankings/benchmark?benchmarkId=${selectedBenchmark}&scope=${scope}`)
                    const data = await res.json()
                    setBenchmarkLeaderboard(data.entries || [])
                    setBenchmarkMeta(data.benchmark || null)
                }

                // Fetch user-specific data
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
    }, [mode, sport, scope, windowDays, selectedBenchmark, session])

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Crown className="h-5 w-5 text-amber-500" />
        if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
        if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
        return <span className="text-sm font-bold text-muted-foreground tabular-nums">{rank}</span>
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
                        ? "Rankings based on total activity effort over the last 28 days. Effort is calculated from duration, intensity, and sport type."
                        : "Rankings based on actual performance in specific benchmarks like 5K time, max bench press, etc."}
                </p>
            </div>

            {/* Pro Tip Card */}
            <div className="card-elevated p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
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

    // Mobile filter content (reusable in both desktop and mobile sheet)
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
                <div className="flex flex-wrap rounded-xl bg-muted/50 p-1 gap-1">
                    {scopeOptions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setScope(s.id)}
                            className={cn(
                                "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1",
                                scope === s.id
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <s.icon className="w-3.5 h-3.5" />
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>
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

            {/* Window Days Filter (for most-active mode) */}
            {mode === "most-active" && (
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Time Window</label>
                    <Select value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v))}>
                        <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Select Window" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="14">Last 14 days</SelectItem>
                            <SelectItem value="28">Last 28 days</SelectItem>
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
                    setScope("global")
                    setSport("running")
                    setWindowDays(28)
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
                            <span>{s.label}</span>
                        </button>
                    ))}
                </div>

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

                {/* Window Days (for most-active mode) */}
                {mode === "most-active" && (
                    <Select value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v))}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Time Window" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="14">Last 14 days</SelectItem>
                            <SelectItem value="28">Last 28 days</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    )

    const leaderboard = mode === "most-active" ? mostActiveLeaderboard : benchmarkLeaderboard

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            {/* Aurora Header */}
            <div className="hero-gradient border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                        <div>
                            <p className="eg-chip mb-2">
                                <span className="eg-live-dot" />
                                Real-time rankings
                            </p>
                            <h1 className="text-3xl font-bold text-slate-900">
                                {mode === "most-active" ? "Most Active Athletes" : "Performance Rankings"}
                            </h1>
                            <p className="text-sm text-slate-600 mt-1 max-w-xl">
                                {mode === "most-active"
                                    ? "See who's putting in the most effort across all sports."
                                    : benchmarkMeta
                                        ? `${benchmarkMeta.name} rankings - showing real performance in ${benchmarkMeta.unit}`
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
                                {scope === 'global' ? 'Global' : scope === 'country' ? 'National' : 'City'} Leaderboard
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {mode === "most-active"
                                ? `Last ${windowDays} days`
                                : benchmarkMeta?.name || "Select a benchmark"}
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
                        ) : mode === "most-active" ? (
                            // Most Active Leaderboard
                            (leaderboard as MostActiveEntry[]).map((entry) => {
                                const isCurrentUser = (session?.user as any)?.id === entry.userId
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
                                            <AvatarImage src={entry.avatarUrl || undefined} alt={entry.displayName} />
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
                                                {entry.activityScore.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {entry.activityCount} activities
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })
                        ) : (
                            // Benchmark Leaderboard
                            (leaderboard as BenchmarkEntry[]).map((entry) => {
                                const isCurrentUser = (session?.user as any)?.id === entry.userId
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
                                            <AvatarImage src={entry.avatarUrl || undefined} alt={entry.displayName} />
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
                                                {entry.verified && (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{entry.location || "Unknown location"}</span>
                                            </div>
                                        </div>

                                        {/* Value (Real Units!) */}
                                        <div className="text-right shrink-0">
                                            <div className={cn(
                                                "font-bold tabular-nums text-lg",
                                                isTopThree ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                                            )}>
                                                {entry.formattedValue}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(entry.achievedAt).toLocaleDateString()}
                                            </div>
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
