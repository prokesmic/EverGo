"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { PageGrid } from "@/components/layout/page-grid"
import { PageSubheader } from "@/components/layout/page-subheader"
import { ChallengeCard } from "@/components/gamification/challenge-card"
import { BadgeGallery } from "@/components/gamification/badge-gallery"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Award, Flame, Trophy, Zap, ChevronRight, Plus, Sparkles, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ChallengesPage() {
    const { data: session } = useSession()
    const [challenges, setChallenges] = useState<any[]>([])
    const [badges, setBadges] = useState<any[]>([])
    const [streak, setStreak] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [filter, setFilter] = useState("all")
    const [activeTab, setActiveTab] = useState("challenges")

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [challengesRes, badgesRes] = await Promise.all([
                    fetch("/api/challenges"),
                    fetch("/api/badges")
                ])

                const challengesData = await challengesRes.json()
                const badgesData = await badgesRes.json()

                setChallenges(challengesData.challenges || [])
                setBadges(badgesData.badges || [])
            } catch (error) {
                console.error("Error fetching gamification data:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [session])

    const handleJoinChallenge = async (challengeId: string) => {
        setJoiningId(challengeId)
        try {
            const res = await fetch(`/api/challenges/${challengeId}/join`, {
                method: "POST"
            })
            const data = await res.json()
            if (data.success) {
                const challengesRes = await fetch("/api/challenges")
                const challengesData = await challengesRes.json()
                setChallenges(challengesData.challenges || [])
            }
        } catch (error) {
            console.error("Error joining challenge:", error)
        } finally {
            setJoiningId(null)
        }
    }

    const filteredChallenges = filter === "all"
        ? challenges
        : filter === "joined"
            ? challenges.filter(c => c.participation)
            : challenges.filter(c => !c.participation)

    const earnedBadgesCount = badges.filter(b => b.isEarned).length
    const totalBadgesCount = badges.length

    const leftSidebar = (
        <>
            {/* XP Progress Card */}
            <div className="card-elevated overflow-hidden">
                <div className="p-4 bg-gradient-to-br from-primary to-primary-dark text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-white/20">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-sm text-primary-foreground/80">Your Level</div>
                            <div className="text-2xl font-bold">Level 5</div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-primary-foreground/80">
                            <span>Experience</span>
                            <span>750 / 1,000 XP</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Active Challenges</span>
                        </div>
                        <span className="font-bold text-foreground">
                            {challenges.filter(c => c.participation && !c.participation.isCompleted).length}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium">Badges Earned</span>
                        </div>
                        <span className="font-bold text-foreground">
                            {earnedBadgesCount} / {totalBadgesCount}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Current Streak</span>
                        </div>
                        <span className="font-bold text-foreground">14 days</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="card-elevated p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Recent Achievements
                </h3>
                <div className="space-y-2">
                    {badges.filter(b => b.isEarned).slice(0, 3).map(badge => (
                        <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8" />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium truncate">{badge.name}</div>
                                <div className="text-xs text-muted-foreground">Just earned</div>
                            </div>
                        </div>
                    ))}
                    {badges.filter(b => b.isEarned).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            No badges earned yet
                        </p>
                    )}
                </div>
            </div>
        </>
    )

    const rightSidebar = (
        <>
            {/* Season Challenge Promo */}
            <div className="card-elevated p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Winter Challenge</h3>
                        <p className="text-xs text-muted-foreground">Special Event</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Complete 100km this month and earn the exclusive Winter Warrior badge!
                </p>
                <Button size="sm" className="w-full gap-1.5">
                    Join Challenge
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Leaderboard Teaser */}
            <div className="card-elevated p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        Top Challengers
                    </h3>
                    <Link href="/rankings" className="text-xs text-primary hover:underline">
                        View all
                    </Link>
                </div>
                <div className="space-y-2">
                    {[
                        { name: "Sarah K.", points: 2450, rank: 1 },
                        { name: "Mike R.", points: 2280, rank: 2 },
                        { name: "Emma T.", points: 2150, rank: 3 },
                    ].map((user) => (
                        <div key={user.rank} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                user.rank === 1 ? "bg-amber-100 text-amber-600" :
                                    user.rank === 2 ? "bg-gray-100 text-gray-600" :
                                        "bg-orange-100 text-orange-600"
                            )}>
                                {user.rank}
                            </div>
                            <span className="flex-1 text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pro Tip */}
            <div className="card-elevated p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                    Join multiple challenges to maximize your XP gains! Completing challenges also helps you climb the leaderboard.
                </p>
            </div>
        </>
    )

    const filterBar = (
        <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="h-9">
                    <TabsTrigger value="challenges" className="text-sm gap-1.5">
                        <Target className="h-3.5 w-3.5" />
                        Challenges
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="text-sm gap-1.5">
                        <Award className="h-3.5 w-3.5" />
                        Badges
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {activeTab === "challenges" && (
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Challenges</SelectItem>
                        <SelectItem value="joined">Joined</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                    </SelectContent>
                </Select>
            )}
        </div>
    )

    const actions = (
        <Button asChild size="sm" className="gap-1.5">
            <Link href="/challenges/create">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create Challenge</span>
            </Link>
        </Button>
    )

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <PageSubheader
                title="Challenges & Badges"
                subtitle="Complete challenges and earn achievements"
                filters={filterBar}
                actions={actions}
            />

            <PageGrid leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
                {isLoading ? (
                    <div className="card-elevated p-12">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <div className="animate-pulse">
                                <Target className="h-10 w-10 opacity-50" />
                            </div>
                            <span>Loading challenges...</span>
                        </div>
                    </div>
                ) : activeTab === "challenges" ? (
                    <>
                        {filteredChallenges.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredChallenges.map((challenge) => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onJoin={() => handleJoinChallenge(challenge.id)}
                                        isJoining={joiningId === challenge.id}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="card-elevated">
                                <div className="empty-state py-12">
                                    <Target className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                    <h3 className="font-semibold text-foreground mb-1">No challenges found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {filter === "joined"
                                            ? "You haven't joined any challenges yet."
                                            : filter === "available"
                                                ? "No available challenges at the moment."
                                                : "No active challenges at the moment."}
                                    </p>
                                    {filter !== "all" && (
                                        <Button variant="outline" onClick={() => setFilter("all")}>
                                            View All Challenges
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="card-elevated p-6">
                        <BadgeGallery badges={badges} />
                        {badges.length === 0 && (
                            <div className="empty-state py-12">
                                <Award className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                <h3 className="font-semibold text-foreground mb-1">No badges available</h3>
                                <p className="text-sm text-muted-foreground">
                                    Complete challenges to start earning badges!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </PageGrid>
        </div>
    )
}
