import { User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Settings, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

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
        <div className="bg-white shadow-sm mb-6 rounded-lg overflow-hidden border border-gray-100">
            {/* Cover Photo */}
            <div className="relative h-64 bg-gray-200 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                {/* Placeholder for cover photo */}
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-blue-600"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex items-end gap-6 container max-w-[1400px] mx-auto">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg -mb-12">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
                        <AvatarFallback className="text-4xl bg-brand-blue text-white">
                            {user.displayName[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-white pb-2">
                        <h1 className="text-3xl font-bold">{user.displayName}</h1>
                        <p className="text-white/80">@{user.username}</p>
                    </div>

                    <div className="flex gap-3 pb-2">
                        {isCurrentUser ? (
                            <Button variant="secondary" size="sm" asChild className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                <Link href="/settings">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button size="sm" className={isFollowing ? "bg-white/20 hover:bg-white/30 text-white" : "bg-brand-green hover:bg-brand-green-dark text-white border-none"}>
                                    {isFollowing ? "Following" : "Follow"}
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Message
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="pt-16 pb-6 container max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex gap-8">
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{user._count.activities}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Activities</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{user._count.followers}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{user._count.following}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                        </div>
                    </div>

                    <div className="flex gap-6 text-sm text-gray-600">
                        {user.city && (
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {user.city}{user.country ? `, ${user.country}` : ""}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                        </div>
                    </div>
                </div>

                {user.bio && (
                    <div className="mt-6 max-w-2xl">
                        <p className="text-gray-700">{user.bio}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
