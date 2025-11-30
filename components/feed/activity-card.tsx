import { Activity, User, Sport, Discipline } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Heart, MessageSquare, Share2, MoreHorizontal, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

type ActivityWithRelations = Activity & {
    user: User
    discipline: Discipline & {
        sport: Sport
    }
}

interface ActivityCardProps {
    activity: ActivityWithRelations
}

export function ActivityCard({ activity }: ActivityCardProps) {
    const distanceKm = activity.distanceMeters ? (activity.distanceMeters / 1000).toFixed(2) : null
    const durationMin = activity.durationSeconds ? Math.floor(activity.durationSeconds / 60) : null
    const pace = distanceKm && durationMin ? (durationMin / parseFloat(distanceKm)).toFixed(2) : null

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10 border border-gray-100">
                        <AvatarImage src={activity.user.avatarUrl || ""} alt={activity.user.displayName} />
                        <AvatarFallback>{activity.user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-semibold text-gray-900 text-sm">{activity.user.displayName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            <span>•</span>
                            <span className="text-brand-blue font-medium">{activity.discipline.sport.name}</span>
                            {activity.discipline.name !== activity.discipline.sport.name && (
                                <>
                                    <span>•</span>
                                    <span>{activity.discipline.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{activity.title}</h3>
                {activity.description && (
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-50 mt-2">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Distance</div>
                        <div className="font-bold text-xl text-gray-900">
                            {distanceKm || "-"} <span className="text-sm font-normal text-gray-500">km</span>
                        </div>
                    </div>
                    <div className="text-center border-l border-gray-50">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                        <div className="font-bold text-xl text-gray-900">
                            {durationMin || "-"} <span className="text-sm font-normal text-gray-500">min</span>
                        </div>
                    </div>
                    <div className="text-center border-l border-gray-50">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pace</div>
                        <div className="font-bold text-xl text-gray-900">
                            {pace || "-"} <span className="text-sm font-normal text-gray-500">/km</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Placeholder (if we had coordinates) */}
            {/* <div className="h-48 bg-gray-100 w-full relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          <MapPin className="h-4 w-4 mr-1" /> Map View
        </div>
      </div> */}

            {/* Actions */}
            <div className="px-2 py-2 flex items-center justify-between bg-gray-50/50">
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 hover:bg-red-50">
                        <Heart className="h-4 w-4 mr-1.5" />
                        Like
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 hover:bg-blue-50">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Comment
                    </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500">
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
