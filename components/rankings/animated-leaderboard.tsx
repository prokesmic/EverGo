"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Crown,
  Flame,
  Target,
  Sparkles,
  Zap,
  Star,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Users,
  Globe,
  MapPin,
  Calendar,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatarUrl: string | null
  score: number
  previousScore?: number
  trend?: "up" | "down" | "same"
  trendAmount?: number
  location?: string
  streak?: number
  badges?: number
  isNew?: boolean
}

interface AnimatedLeaderboardProps {
  initialEntries: LeaderboardEntry[]
  sports?: any[]
  currentUserId?: string
  showFilters?: boolean
  title?: string
  showStats?: boolean
}

export function AnimatedLeaderboard({
  initialEntries,
  sports = [],
  currentUserId,
  showFilters = true,
  title = "Leaderboard",
  showStats = true
}: AnimatedLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries)
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all_time")
  const [selectedScope, setSelectedScope] = useState<string>("global")
  const [isLoading, setIsLoading] = useState(false)
  const [animatingEntries, setAnimatingEntries] = useState<Set<string>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const prevEntriesRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    if (!showFilters) return

    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          sport: selectedSport,
          period: selectedPeriod,
          scope: selectedScope,
        })

        const response = await fetch(`/api/rankings/leaderboard?${params}`)
        const data = await response.json()

        if (data.leaderboard) {
          // Detect rank changes for animations
          const newAnimating = new Set<string>()
          data.leaderboard.forEach((entry: LeaderboardEntry) => {
            const prevRank = prevEntriesRef.current.get(entry.userId)
            if (prevRank && prevRank !== entry.rank) {
              newAnimating.add(entry.userId)
            }
          })

          // Update previous entries map
          const newPrevEntries = new Map<string, number>()
          data.leaderboard.forEach((entry: LeaderboardEntry) => {
            newPrevEntries.set(entry.userId, entry.rank)
          })
          prevEntriesRef.current = newPrevEntries

          setAnimatingEntries(newAnimating)
          setEntries(data.leaderboard)

          // Clear animations after delay
          setTimeout(() => setAnimatingEntries(new Set()), 1000)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedSport, selectedPeriod, selectedScope, showFilters])

  // Check if current user is in top 3 for confetti
  useEffect(() => {
    const topThree = entries.slice(0, 3)
    if (currentUserId && topThree.some(e => e.userId === currentUserId)) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [entries, currentUserId])

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "global": return <Globe className="w-4 h-4" />
      case "country": return <MapPin className="w-4 h-4" />
      case "city": return <MapPin className="w-4 h-4" />
      case "friends": return <Users className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getPeriodIcon = (period: string) => {
    return <Calendar className="w-4 h-4" />
  }

  const getRankBadge = (rank: number, isAnimating: boolean) => {
    const baseClass = cn(
      "transition-all duration-500",
      isAnimating && "animate-bounce"
    )

    if (rank === 1) {
      return (
        <div className={cn("relative", baseClass)}>
          <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
          <Crown className="w-12 h-12 text-yellow-500 drop-shadow-lg relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      )
    }
    if (rank === 2) {
      return (
        <div className={cn("relative", baseClass)}>
          <Medal className="w-10 h-10 text-gray-400 drop-shadow-md" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500">2nd</div>
        </div>
      )
    }
    if (rank === 3) {
      return (
        <div className={cn("relative", baseClass)}>
          <Medal className="w-9 h-9 text-amber-600 drop-shadow-md" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-700">3rd</div>
        </div>
      )
    }
    return (
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center font-black text-lg",
        rank <= 10
          ? "bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 text-brand-primary"
          : "bg-surface-secondary text-text-muted",
        baseClass
      )}>
        {rank}
      </div>
    )
  }

  const getTrendIcon = (trend?: string, amount?: number) => {
    if (!trend || trend === "same") {
      return (
        <div className="flex items-center gap-1 text-gray-400">
          <Minus className="w-4 h-4" />
          <span className="text-xs">-</span>
        </div>
      )
    }
    if (trend === "up") {
      return (
        <div className="flex items-center gap-1 text-green-500 animate-pulse">
          <ChevronUp className="w-5 h-5" />
          <span className="text-sm font-bold">+{amount || 0}</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-red-500">
        <ChevronDown className="w-5 h-5" />
        <span className="text-sm font-bold">-{amount || 0}</span>
      </div>
    )
  }

  const getScoreDisplay = (score: number, previousScore?: number) => {
    const isUp = previousScore && score > previousScore
    const isDown = previousScore && score < previousScore
    const diff = previousScore ? Math.abs(score - previousScore) : 0

    return (
      <div className="flex flex-col items-end">
        <div className={cn(
          "text-2xl font-black tabular-nums transition-all",
          isUp && "text-green-500",
          isDown && "text-red-500",
          !isUp && !isDown && "text-text-primary"
        )}>
          {score.toLocaleString()}
        </div>
        {diff > 0 && (
          <div className={cn(
            "text-xs font-medium",
            isUp ? "text-green-500" : "text-red-500"
          )}>
            {isUp ? "+" : "-"}{diff.toLocaleString()} pts
          </div>
        )}
      </div>
    )
  }

  const currentUserRank = entries.findIndex(e => e.userId === currentUserId) + 1
  const topThree = entries.slice(0, 3)
  const restOfLeaderboard = entries.slice(3)
  const totalParticipants = entries.length

  return (
    <div className="space-y-6 relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            {title}
          </h2>
          {showStats && (
            <p className="text-text-muted text-sm mt-1">
              {totalParticipants.toLocaleString()} athletes competing
              {currentUserRank > 0 && (
                <span className="text-brand-primary font-medium ml-2">
                  • You're #{currentUserRank}
                </span>
              )}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLoading(true)}
          disabled={isLoading}
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    All Sports
                  </span>
                </SelectItem>
                {sports.map((sport) => (
                  <SelectItem key={sport.id} value={sport.slug}>
                    <span className="flex items-center gap-2">
                      <span>{sport.icon}</span>
                      {sport.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_time">All Time</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedScope} onValueChange={setSelectedScope}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Global" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Global
                  </span>
                </SelectItem>
                <SelectItem value="country">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    My Country
                  </span>
                </SelectItem>
                <SelectItem value="city">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    My City
                  </span>
                </SelectItem>
                <SelectItem value="friends">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Friends
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <p className="text-text-muted text-sm">Updating rankings...</p>
          </div>
        </div>
      )}

      {/* Podium */}
      {topThree.length > 0 && (
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/50 to-transparent rounded-3xl -z-10" />

          <div className="grid grid-cols-3 gap-4 items-end py-8">
            {/* 2nd Place */}
            {topThree[1] && (
              <div
                className={cn(
                  "flex flex-col items-center transform transition-all duration-700",
                  animatingEntries.has(topThree[1].userId) && "animate-slideUp"
                )}
                style={{ animationDelay: '100ms' }}
              >
                <Card
                  className={cn(
                    "w-full border-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2",
                    topThree[1].userId === currentUserId && "ring-4 ring-brand-primary ring-offset-2"
                  )}
                >
                  <CardContent className="pt-6 pb-4 text-center">
                    {getRankBadge(2, animatingEntries.has(topThree[1].userId))}
                    <Link href={`/profile/${topThree[1].username}`} className="block mt-4">
                      <Avatar className="w-20 h-20 mx-auto border-4 border-gray-300 shadow-lg hover:scale-110 transition-transform ring-2 ring-gray-200">
                        <AvatarImage src={topThree[1].avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-500 text-white text-2xl font-bold">
                          {topThree[1].displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <h3 className="font-bold text-text-primary mt-3 truncate px-2">
                      {topThree[1].displayName}
                    </h3>
                    {topThree[1].location && (
                      <p className="text-xs text-text-muted truncate">{topThree[1].location}</p>
                    )}
                    <div className="mt-3">
                      {getScoreDisplay(topThree[1].score, topThree[1].previousScore)}
                    </div>
                    <div className="mt-2">
                      {getTrendIcon(topThree[1].trend, topThree[1].trendAmount)}
                    </div>
                  </CardContent>
                </Card>
                <div className="h-16 w-full bg-gradient-to-t from-gray-300 to-gray-200 rounded-b-lg shadow-inner" />
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div
                className={cn(
                  "flex flex-col items-center transform transition-all duration-700 -translate-y-4",
                  animatingEntries.has(topThree[0].userId) && "animate-slideUp"
                )}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />

                  <Card
                    className={cn(
                      "relative w-full border-4 border-yellow-400 bg-gradient-to-b from-yellow-50 via-white to-yellow-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2",
                      topThree[0].userId === currentUserId && "ring-4 ring-brand-primary ring-offset-2"
                    )}
                  >
                    {/* Champion Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        CHAMPION
                        <Star className="w-4 h-4" />
                      </div>
                    </div>

                    <CardContent className="pt-10 pb-6 text-center">
                      {getRankBadge(1, animatingEntries.has(topThree[0].userId))}
                      <Link href={`/profile/${topThree[0].username}`} className="block mt-4">
                        <Avatar className="w-28 h-28 mx-auto border-4 border-yellow-400 shadow-2xl hover:scale-110 transition-transform ring-4 ring-yellow-200">
                          <AvatarImage src={topThree[0].avatarUrl || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-4xl font-bold">
                            {topThree[0].displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <h3 className="font-bold text-xl text-text-primary mt-4 truncate px-2">
                        {topThree[0].displayName}
                      </h3>
                      {topThree[0].location && (
                        <p className="text-sm text-text-muted truncate">{topThree[0].location}</p>
                      )}
                      <div className="mt-4">
                        <div className="text-3xl font-black text-yellow-600 tabular-nums">
                          {topThree[0].score.toLocaleString()}
                        </div>
                        <p className="text-xs text-yellow-600 font-medium">POINTS</p>
                      </div>
                      <div className="mt-2">
                        {getTrendIcon(topThree[0].trend, topThree[0].trendAmount)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="h-24 w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-b-lg shadow-lg" />
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div
                className={cn(
                  "flex flex-col items-center transform transition-all duration-700",
                  animatingEntries.has(topThree[2].userId) && "animate-slideUp"
                )}
                style={{ animationDelay: '200ms' }}
              >
                <Card
                  className={cn(
                    "w-full border-2 border-amber-500 bg-gradient-to-b from-amber-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2",
                    topThree[2].userId === currentUserId && "ring-4 ring-brand-primary ring-offset-2"
                  )}
                >
                  <CardContent className="pt-6 pb-4 text-center">
                    {getRankBadge(3, animatingEntries.has(topThree[2].userId))}
                    <Link href={`/profile/${topThree[2].username}`} className="block mt-4">
                      <Avatar className="w-20 h-20 mx-auto border-4 border-amber-500 shadow-lg hover:scale-110 transition-transform ring-2 ring-amber-200">
                        <AvatarImage src={topThree[2].avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-700 text-white text-2xl font-bold">
                          {topThree[2].displayName[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <h3 className="font-bold text-text-primary mt-3 truncate px-2">
                      {topThree[2].displayName}
                    </h3>
                    {topThree[2].location && (
                      <p className="text-xs text-text-muted truncate">{topThree[2].location}</p>
                    )}
                    <div className="mt-3">
                      {getScoreDisplay(topThree[2].score, topThree[2].previousScore)}
                    </div>
                    <div className="mt-2">
                      {getTrendIcon(topThree[2].trend, topThree[2].trendAmount)}
                    </div>
                  </CardContent>
                </Card>
                <div className="h-12 w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-b-lg shadow-inner" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {restOfLeaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === currentUserId
                const isAnimating = animatingEntries.has(entry.userId)
                const initials = entry.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)

                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-all group",
                      isCurrentUser && "bg-gradient-to-r from-brand-primary/10 via-brand-primary/5 to-transparent",
                      isAnimating && "animate-flash",
                      "hover:bg-surface-secondary"
                    )}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                  >
                    {/* Rank */}
                    <div className="w-14 flex items-center justify-center">
                      {getRankBadge(entry.rank, isAnimating)}
                    </div>

                    {/* Avatar */}
                    <Link href={`/profile/${entry.username}`}>
                      <Avatar className={cn(
                        "w-14 h-14 border-2 shadow-md transition-all duration-300",
                        isCurrentUser ? "border-brand-primary" : "border-white",
                        "group-hover:scale-110 group-hover:shadow-lg"
                      )}>
                        <AvatarImage src={entry.avatarUrl || undefined} alt={entry.displayName} />
                        <AvatarFallback className={cn(
                          "text-white font-bold",
                          isCurrentUser
                            ? "bg-gradient-to-br from-brand-primary to-brand-secondary"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                        )}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${entry.username}`}
                          className="font-bold text-text-primary hover:text-brand-primary transition-colors truncate"
                        >
                          {entry.displayName}
                        </Link>
                        {isCurrentUser && (
                          <Badge className="bg-brand-primary text-white text-xs px-2">
                            You
                          </Badge>
                        )}
                        {entry.isNew && (
                          <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {entry.location}
                          </span>
                        )}
                        {entry.streak && entry.streak > 0 && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <Flame className="w-3 h-3" />
                            {entry.streak} day streak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="w-16 flex justify-center">
                      {getTrendIcon(entry.trend, entry.trendAmount)}
                    </div>

                    {/* Score */}
                    <div className="w-24 text-right">
                      {getScoreDisplay(entry.score, entry.previousScore)}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {entries.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <div className="relative inline-block">
            <Trophy className="w-20 h-20 mx-auto text-text-muted opacity-30" />
            <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mt-4">No rankings yet</h3>
          <p className="text-text-muted mt-2 max-w-md mx-auto">
            Be the first to compete! Log an activity to appear on the leaderboard.
          </p>
          <Link href="/activity/new">
            <Button className="mt-4 bg-brand-primary hover:bg-brand-primary-dark">
              Log Your First Activity
            </Button>
          </Link>
        </Card>
      )}

      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes flash {
          0%, 100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(0, 120, 212, 0.1);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }

        .animate-flash {
          animation: flash 0.5s ease-in-out;
        }

        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
