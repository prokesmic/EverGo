"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  trend?: "up" | "down" | "same"
  trendAmount?: number
  location?: string
}

interface EnhancedLeaderboardProps {
  initialEntries: LeaderboardEntry[]
  sports?: any[]
  currentUserId?: string
  showFilters?: boolean
}

export function EnhancedLeaderboard({
  initialEntries,
  sports = [],
  currentUserId,
  showFilters = true,
}: EnhancedLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries)
  const [selectedSport, setSelectedSport] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all_time")
  const [selectedScope, setSelectedScope] = useState<string>("global")
  const [isLoading, setIsLoading] = useState(false)

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
          setEntries(data.leaderboard)
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedSport, selectedPeriod, selectedScope, showFilters])

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative">
          <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        </div>
      )
    }
    if (rank === 2) {
      return <Medal className="w-9 h-9 text-gray-400" />
    }
    if (rank === 3) {
      return <Medal className="w-8 h-8 text-amber-600" />
    }
    return (
      <div className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
        <span className="text-lg font-black text-text-muted">#{rank}</span>
      </div>
    )
  }

  const getTrendIcon = (trend?: string, amount?: number) => {
    if (!trend || trend === "same") {
      return <Minus className="w-4 h-4 text-gray-400" />
    }
    if (trend === "up") {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          {amount && <span className="text-xs font-bold">+{amount}</span>}
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingDown className="w-4 h-4" />
        {amount && <span className="text-xs font-bold">-{amount}</span>}
      </div>
    )
  }

  const getScoreIcon = (rank: number) => {
    if (rank <= 3) return <Flame className="w-4 h-4 text-orange-500" />
    if (rank <= 10) return <Target className="w-4 h-4 text-brand-primary" />
    return <Trophy className="w-4 h-4 text-text-muted" />
  }

  const topThree = entries.slice(0, 3)
  const restOfLeaderboard = entries.slice(3)

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sports</SelectItem>
              {sports.map((sport) => (
                <SelectItem key={sport.id} value={sport.slug}>
                  {sport.name}
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
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="country">My Country</SelectItem>
              <SelectItem value="city">My City</SelectItem>
              <SelectItem value="friends">Friends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Podium (Top 3) */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <Card
              className={cn(
                "border-2 border-gray-300 bg-gradient-to-b from-gray-50 to-white transform hover:scale-105 transition-transform order-1",
                topThree[1].userId === currentUserId && "ring-2 ring-brand-primary"
              )}
            >
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">{getRankBadge(2)}</div>
                <Link href={`/profile/${topThree[1].username}`}>
                  <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-gray-300 shadow-lg hover:scale-110 transition-transform">
                    <AvatarImage src={topThree[1].avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-gray-300 to-gray-400 text-white text-2xl">
                      {topThree[1].displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <h3 className="font-bold text-lg text-text-primary truncate">
                  {topThree[1].displayName}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-2 text-2xl font-black text-gray-600">
                  {getScoreIcon(2)}
                  <span>{topThree[1].score.toLocaleString()}</span>
                </div>
                {topThree[1].location && (
                  <p className="text-xs text-text-muted mt-1">{topThree[1].location}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <Card
              className={cn(
                "border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white transform hover:scale-105 transition-transform order-2 relative",
                topThree[0].userId === currentUserId && "ring-2 ring-brand-primary"
              )}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                CHAMPION
              </div>
              <CardContent className="pt-8 text-center">
                <div className="flex justify-center mb-3">{getRankBadge(1)}</div>
                <Link href={`/profile/${topThree[0].username}`}>
                  <Avatar className="w-24 h-24 mx-auto mb-3 border-4 border-yellow-400 shadow-xl hover:scale-110 transition-transform">
                    <AvatarImage src={topThree[0].avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white text-3xl">
                      {topThree[0].displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <h3 className="font-bold text-xl text-text-primary truncate">
                  {topThree[0].displayName}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-2 text-3xl font-black text-yellow-600">
                  {getScoreIcon(1)}
                  <span>{topThree[0].score.toLocaleString()}</span>
                </div>
                {topThree[0].location && (
                  <p className="text-xs text-text-muted mt-1">{topThree[0].location}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <Card
              className={cn(
                "border-2 border-amber-600 bg-gradient-to-b from-amber-50 to-white transform hover:scale-105 transition-transform order-3",
                topThree[2].userId === currentUserId && "ring-2 ring-brand-primary"
              )}
            >
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-3">{getRankBadge(3)}</div>
                <Link href={`/profile/${topThree[2].username}`}>
                  <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-amber-600 shadow-lg hover:scale-110 transition-transform">
                    <AvatarImage src={topThree[2].avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-700 text-white text-2xl">
                      {topThree[2].displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <h3 className="font-bold text-lg text-text-primary truncate">
                  {topThree[2].displayName}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-2 text-2xl font-black text-amber-700">
                  {getScoreIcon(3)}
                  <span>{topThree[2].score.toLocaleString()}</span>
                </div>
                {topThree[2].location && (
                  <p className="text-xs text-text-muted mt-1">{topThree[2].location}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Rest of Leaderboard */}
      {restOfLeaderboard.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {restOfLeaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === currentUserId
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
                      "flex items-center gap-4 p-4 transition-all hover:bg-surface-secondary group",
                      isCurrentUser && "bg-gradient-to-r from-brand-primary/10 to-transparent border-l-4 border-brand-primary",
                      index === 0 && "animate-fadeIn"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankBadge(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Link href={`/profile/${entry.username}`}>
                      <Avatar className="w-12 h-12 border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                        <AvatarImage src={entry.avatarUrl || undefined} alt={entry.displayName} />
                        <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/profile/${entry.username}`}
                          className="font-bold text-text-primary hover:underline truncate"
                        >
                          {entry.displayName}
                        </Link>
                        {isCurrentUser && (
                          <Badge variant="outline" className="bg-brand-primary text-white border-brand-primary">
                            You
                          </Badge>
                        )}
                      </div>
                      {entry.location && (
                        <p className="text-xs text-text-muted">{entry.location}</p>
                      )}
                    </div>

                    {/* Score and Trend */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 font-bold text-lg text-text-primary">
                          {getScoreIcon(entry.rank)}
                          <span>{entry.score.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs">
                          {getTrendIcon(entry.trend, entry.trendAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-text-muted text-lg">No rankings available</p>
        </div>
      )}
    </div>
  )
}
