import Link from "next/link"
import { Trophy, Users, MapPin, ChevronRight, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TeamCardProps {
    team: {
        id: string
        name: string
        slug: string
        sport: { name: string, icon: string }
        city?: string | null
        country?: string | null
        logoUrl?: string | null
        coverPhotoUrl?: string | null
        memberCount: number
        globalRank?: number | null
        isVerified?: boolean
    }
}

export function TeamCard({ team }: TeamCardProps) {
    return (
        <Link href={`/teams/${team.slug}`} className="block">
            <div className="card-elevated overflow-hidden group hover:shadow-md transition-all duration-200">
                {/* Cover Image */}
                <div className="h-20 bg-gradient-to-br from-primary to-primary-dark relative">
                    {team.coverPhotoUrl && (
                        <img src={team.coverPhotoUrl} alt={team.name} className="w-full h-full object-cover" />
                    )}
                    {/* Logo */}
                    <div className="absolute -bottom-5 left-4">
                        <div className="w-12 h-12 rounded-xl bg-background shadow-md flex items-center justify-center overflow-hidden border-2 border-background">
                            {team.logoUrl ? (
                                <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl">{team.sport?.icon || '👥'}</span>
                            )}
                        </div>
                    </div>
                    {/* Rank Badge */}
                    {team.globalRank && team.globalRank <= 10 && (
                        <div className="absolute top-2 right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <Trophy className="w-3 h-3" />
                            #{team.globalRank}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="pt-7 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-foreground leading-tight truncate group-hover:text-primary transition-colors" title={team.name}>
                                    {team.name}
                                </h3>
                                {team.isVerified && (
                                    <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span className={cn(
                                    "sport-chip",
                                    team.sport?.name?.toLowerCase() === 'running' && "bg-sport-running/10 text-sport-running",
                                    team.sport?.name?.toLowerCase() === 'cycling' && "bg-sport-cycling/10 text-sport-cycling",
                                    team.sport?.name?.toLowerCase() === 'football' && "bg-sport-football/10 text-sport-football"
                                )}>
                                    {team.sport?.name || 'Sports'}
                                </span>
                                {(team.city || team.country) && (
                                    <span className="flex items-center gap-0.5">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[80px]">{team.city || team.country}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>{team.memberCount} members</span>
                            </div>
                            {team.globalRank && team.globalRank > 10 && (
                                <div className="flex items-center gap-1">
                                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="font-medium text-foreground">#{team.globalRank}</span>
                                </div>
                            )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                </div>
            </div>
        </Link>
    )
}
