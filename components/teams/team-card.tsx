import { Team, Sport, TeamMember } from "@prisma/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Trophy } from "lucide-react"
import Link from "next/link"

type TeamWithRelations = Team & {
    sport: Sport
    _count: {
        members: number
    }
}

interface TeamCardProps {
    team: TeamWithRelations
}

export function TeamCard({ team }: TeamCardProps) {
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
                        <Button size="sm" variant="outline" className="text-brand-blue border-brand-blue hover:bg-blue-50">
                            View Team
                        </Button>
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
                            {team._count.members} Members
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
