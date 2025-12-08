import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Flame, Activity, PlusCircle, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

interface HeroProfileProps {
    name: string
    location: string
    primarySport: "running" | "cycling" | "football" | "kiting" | string
    avatarUrl: string
    coverUrl?: string
    weeklyDistanceKm: number
    weeklyTimeMinutes: number
    weeklyCalories: number
    streakDays?: number
    weeklyGoal?: number
    weeklyProgress?: number
    evergoScore?: number
}

const sportColors: Record<string, string> = {
    running: "bg-sport-running text-white",
    cycling: "bg-sport-cycling text-white",
    football: "bg-sport-football text-white",
    swimming: "bg-sport-swimming text-white",
    fitness: "bg-sport-fitness text-white",
    golf: "bg-sport-golf text-white",
    tennis: "bg-sport-tennis text-black",
    basketball: "bg-sport-basketball text-white",
    climbing: "bg-sport-climbing text-white",
    triathlon: "bg-sport-triathlon text-white",
    default: "bg-primary text-white"
}

export function HeroProfile({
    name,
    location,
    primarySport,
    avatarUrl,
    coverUrl,
    weeklyDistanceKm,
    weeklyTimeMinutes,
    weeklyCalories,
    streakDays = 0,
    weeklyGoal = 3,
    weeklyProgress = 0,
    evergoScore = 0
}: HeroProfileProps) {
    const sportColor = sportColors[primarySport.toLowerCase()] || sportColors.default

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = Math.round(minutes % 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }

    const progressPercentage = weeklyGoal > 0 ? Math.min((weeklyProgress / weeklyGoal) * 100, 100) : 0

    return (
        <div className="card-elevated p-5 mb-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                {/* Left: Identity */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="relative">
                        <Avatar className="h-16 w-16 md:h-20 md:w-20 border-3 border-border shadow-lg">
                            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
                            <AvatarFallback className="text-xl bg-primary text-primary-foreground font-bold">
                                {name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {streakDays > 0 && (
                            <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md">
                                <Flame className="h-3 w-3" />
                                {streakDays}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground">{name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <MapPin className="h-3.5 w-3.5" />
                            {location}
                        </div>
                        <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${sportColor}`}>
                            <Activity className="h-3 w-3" />
                            {primarySport}
                        </div>
                    </div>
                </div>

                {/* Center: Weekly Stats */}
                <div className="flex-1 grid grid-cols-3 gap-3 md:gap-6 lg:max-w-md">
                    <div className="stat-card">
                        <span className="stat-value">{weeklyDistanceKm.toFixed(1)}</span>
                        <span className="stat-label">km</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{formatTime(weeklyTimeMinutes)}</span>
                        <span className="stat-label">time</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{weeklyCalories.toLocaleString()}</span>
                        <span className="stat-label">kcal</span>
                    </div>
                </div>

                {/* Right: Streak & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 lg:ml-auto">
                    {/* Streak Badge */}
                    {streakDays > 0 && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <div>
                                <div className="text-sm font-bold text-foreground">{streakDays}-day streak</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Keep it up!</div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button asChild className="flex-1 sm:flex-none gap-1.5 font-semibold shadow-md">
                            <Link href="/activity/create">
                                <PlusCircle className="h-4 w-4" />
                                Log Activity
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1 sm:flex-none gap-1.5">
                            <Link href="/calendar">
                                <Calendar className="h-4 w-4" />
                                <span className="hidden sm:inline">Join Event</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Weekly Progress Bar */}
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{weeklyProgress}</span> / {weeklyGoal} workouts this week
                    </span>
                    {progressPercentage >= 100 ? (
                        <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Goal reached!
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
                            {weeklyGoal - weeklyProgress} to go
                        </span>
                    )}
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>
        </div>
    )
}
