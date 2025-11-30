import { Activity, User, Sport, Discipline } from "@prisma/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Clock, Flame, Activity as ActivityIcon } from "lucide-react"

type ActivityWithRelations = Activity & {
    user: User
    discipline: Discipline & {
        sport: Sport
    }
}

interface ActivityFeedProps {
    activities: ActivityWithRelations[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    if (activities.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <ActivityIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No activities found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <Card key={activity.id}>
                    <CardHeader className="flex flex-row items-center gap-4 p-4 pb-2">
                        <Avatar>
                            <AvatarImage src={activity.user.avatarUrl || ""} alt={activity.user.displayName} />
                            <AvatarFallback>{activity.user.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-sm">{activity.user.displayName}</h3>
                                <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {activity.discipline.sport.name} • {activity.discipline.name}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <h4 className="font-bold mb-2">{activity.title}</h4>
                        {activity.description && (
                            <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                        )}

                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Distance</span>
                                <span className="font-bold">
                                    {activity.distanceMeters ? (activity.distanceMeters / 1000).toFixed(2) : "-"} km
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Duration</span>
                                <span className="font-bold">
                                    {activity.durationSeconds ? Math.floor(activity.durationSeconds / 60) : "-"} min
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Pace</span>
                                <span className="font-bold">-</span> {/* Placeholder for pace calc */}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                            {activity.caloriesBurned && (
                                <div className="flex items-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span>{activity.caloriesBurned} kcal</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
