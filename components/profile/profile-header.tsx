import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Link as LinkIcon, Edit, UserPlus, MoreHorizontal } from "lucide-react"
import { User } from "@prisma/client"

interface ProfileHeaderProps {
    user: User & {
        _count: {
            followers: number
            following: number
            activities: number
        }
    }
    isCurrentUser: boolean
    isFollowing: boolean
}

export function ProfileHeader({ user, isCurrentUser, isFollowing }: ProfileHeaderProps) {
    return (
        <div className="relative mb-6">
            {/* Cover Photo */}
            <div className="h-48 md:h-64 w-full bg-gradient-to-r from-brand-blue to-brand-green overflow-hidden rounded-b-lg">
                {user.coverPhotoUrl && (
                    <img
                        src={user.coverPhotoUrl}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            <div className="px-4 md:px-8">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-4">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background">
                            <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
                            <AvatarFallback className="text-2xl md:text-4xl bg-brand-blue text-white">
                                {user.displayName[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Actions */}
                    <div className="flex-1 w-full md:w-auto flex justify-end mt-4 md:mt-0 md:mb-4 gap-2">
                        {isCurrentUser ? (
                            <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button variant={isFollowing ? "outline" : "default"} size="sm">
                                    {isFollowing ? "Following" : "Follow"}
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold">{user.displayName}</h1>
                        <p className="text-muted-foreground">@{user.username}</p>
                    </div>

                    {user.bio && <p className="max-w-2xl">{user.bio}</p>}

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {user.city && (
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{user.city}, {user.country}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 py-4 border-y">
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">{user._count.activities}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Activities</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">{user._count.followers}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Followers</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-lg">{user._count.following}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
