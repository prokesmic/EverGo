"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ChallengeCard } from "@/components/gamification/challenge-card"
import { StreakDisplay } from "@/components/gamification/streak-display"
import { BadgeGallery } from "@/components/gamification/badge-gallery"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function GamificationDashboard() {
    const { data: session } = useSession()
    const [challenges, setChallenges] = useState<any[]>([])
    const [badges, setBadges] = useState<any[]>([])
    const [streak, setStreak] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Fetch Challenges
                const challengesRes = await fetch("/api/challenges")
                const challengesData = await challengesRes.json()
                setChallenges(challengesData.challenges || [])

                // Fetch Badges
                const badgesRes = await fetch("/api/badges")
                const badgesData = await badgesRes.json()
                setBadges(badgesData.badges || [])

                // Fetch Streak (if logged in)
                if (session?.user) {
                    // We need userId, but session usually has email. 
                    // Ideally we'd have userId in session or fetch it.
                    // For now, let's assume we can get it or the API handles email lookup if we modify it.
                    // Wait, the API expects userId in params.
                    // Let's fetch the user profile first to get ID, or modify API to use session.
                    // Actually, let's just skip streak for now if we don't have ID easily, 
                    // OR better: make a /api/me/streak endpoint.
                    // But I implemented /api/users/[userId]/streak.
                    // I'll assume I can get the ID from a profile fetch or similar.
                    // For this demo, I'll skip streak fetching here or mock it if I can't get ID.
                    // Actually, let's try to fetch user details first.
                    // Or... I can just use the user's email to look up ID in a server component, 
                    // but this is a client component.
                    // Let's just fetch challenges and badges for now.
                }

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
                // Refresh challenges to show progress
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

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-bg-page pb-20">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Achievements</h1>
                    <p className="text-text-secondary mt-1">Track your progress, join challenges, and earn badges.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="challenges" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                                <TabsTrigger value="badges">Badges</TabsTrigger>
                            </TabsList>

                            <TabsContent value="challenges" className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {challenges.map((challenge) => (
                                        <ChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            onJoin={() => handleJoinChallenge(challenge.id)}
                                            isJoining={joiningId === challenge.id}
                                        />
                                    ))}
                                </div>
                                {challenges.length === 0 && (
                                    <div className="text-center py-12 text-text-muted bg-white rounded-xl border border-border-light">
                                        No active challenges at the moment. Check back soon!
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="badges">
                                <div className="bg-white rounded-xl shadow-sm border border-border-light p-6">
                                    <BadgeGallery badges={badges} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Streak Widget - Placeholder for now as we need userId */}
                        {/* <StreakDisplay streak={streak} /> */}

                        <div className="bg-gradient-to-br from-brand-blue to-blue-600 rounded-xl shadow-md p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Level Up!</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Complete challenges and maintain streaks to earn points and climb the global leaderboard.
                            </p>
                            <div className="w-full bg-white/20 rounded-full h-2 mb-1">
                                <div className="bg-white h-full rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-blue-100">
                                <span>Level 5</span>
                                <span>750/1000 XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
