"use client"

import { Team, Sport } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MapPin } from "lucide-react"
import { joinTeam } from "@/app/actions/team"
import { useState } from "react"
import { toast } from "sonner"

type TeamWithRelations = Team & {
    sport: Sport
    _count: {
        members: number
    }
}

interface TeamCardProps {
    team: TeamWithRelations
    isMember: boolean
}

export function TeamCard({ team, isMember }: TeamCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [hasJoined, setHasJoined] = useState(isMember)

    const handleJoin = async () => {
        setIsLoading(true)
        try {
            const result = await joinTeam(team.id)
            if (result.success) {
                toast.success("Joined team successfully!")
                setHasJoined(true)
            } else {
                toast.error(result.error || "Failed to join team")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-24 bg-gradient-to-r from-brand-blue to-brand-blue-dark relative">
                {team.coverPhotoUrl && (
                    <img
                        src={team.coverPhotoUrl}
                        alt={team.name}
                        className="w-full h-full object-cover opacity-50"
                    />
                )}
            </div>
            <CardContent className="pt-0 relative">
                <div className="flex justify-between items-start">
                    <div className="-mt-10 mb-4">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                            <AvatarImage src={team.logoUrl || ""} alt={team.name} />
                            <AvatarFallback className="bg-white text-brand-blue font-bold text-xl">
                                {team.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="mt-4">
                        {hasJoined ? (
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 cursor-default">
                                Joined
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="bg-brand-blue hover:bg-brand-blue-dark text-white"
                                onClick={handleJoin}
                                disabled={isLoading}
                            >
                                {isLoading ? "Joining..." : "Join Team"}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.sport.name}</p>
                    </div>

                    {team.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {team._count.members + (hasJoined && !isMember ? 1 : 0)} Members
                        </div>
                        {team.location && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {team.location}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
