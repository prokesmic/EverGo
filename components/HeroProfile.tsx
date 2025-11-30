import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Trophy, Flame, Activity } from "lucide-react"
import Link from "next/link"

interface HeroProfileProps {
    name: string
    location: string
    primarySport: "running" | "cycling" | "football" | "kiting" | string
    avatarUrl: string
    coverUrl: string
    weeklyDistanceKm: number
    weeklyTimeMinutes: number
    weeklyCalories: number
    streakDays?: number
}

const sportColors: Record<string, string> = {
    running: "bg-brand-green text-white",
    cycling: "bg-yellow-500 text-black",
    football: "bg-green-600 text-white",
    kiting: "bg-cyan-500 text-white",
    default: "bg-brand-blue text-white"
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
    streakDays
}: HeroProfileProps) {
    const sportColor = sportColors[primarySport.toLowerCase()] || sportColors.default

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return `${h}:${m.toString().padStart(2, '0')}`
    }

    return (
        <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden shadow-lg mb-4 group">
            {/* Background Image & Gradient */}
            <div className="absolute inset-0">
                <img
                    src={coverUrl}
                    alt="Cover"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
            </div>

            <div className="relative h-full container mx-auto px-6 py-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">

                {/* Left Zone: Identity */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="relative">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/20 shadow-xl ring-2 ring-brand-blue/50">
                            <AvatarImage src={avatarUrl} alt={name} className="object-cover object-center h-full w-full" />
                            <AvatarFallback className="text-3xl bg-brand-blue text-white font-bold">
                                {name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${sportColor} flex items-center gap-1`}>
                            <Activity className="h-3 w-3" />
                            {primarySport}
                        </div>
                    </div>

                    <div className="text-white space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-sm">{name}</h1>
                        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
                            <MapPin className="h-4 w-4" />
                            {location}
                        </div>
                    </div>
                </div>

                {/* Center Zone: Stats */}
                <div className="flex-1 flex justify-center md:justify-start gap-8 md:gap-12 text-white/90">
                    <div className="text-center md:text-left">
                        <div className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">This Week</div>
                        <div className="flex gap-6">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-white">{weeklyDistanceKm} <span className="text-base font-normal text-white/60">km</span></div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold text-white">{formatTime(weeklyTimeMinutes)} <span className="text-base font-normal text-white/60">hrs</span></div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="text-2xl md:text-3xl font-bold text-white">{weeklyCalories} <span className="text-base font-normal text-white/60">kcal</span></div>
                            </div>
                        </div>
                    </div>

                    {streakDays && (
                        <div className="hidden md:block border-l border-white/20 pl-8">
                            <div className="text-xs uppercase tracking-widest text-white/60 font-semibold mb-1">Status</div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span>{streakDays} Day Streak</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Zone: Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button asChild size="lg" className="bg-brand-blue hover:bg-brand-blue-dark text-white shadow-lg shadow-brand-blue/20 border-0 font-semibold">
                        <Link href="/activity/create">
                            Log Activity
                        </Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md font-medium">
                        Join Event
                    </Button>
                </div>
            </div>
        </div>
    )
}
