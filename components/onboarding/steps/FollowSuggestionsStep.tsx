"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Check } from "lucide-react"

interface FollowSuggestionsStepProps {
  formData: any
  updateFormData: (data: any) => void
  suggestedUsers: any[]
}

export function FollowSuggestionsStep({
  formData,
  updateFormData,
  suggestedUsers,
}: FollowSuggestionsStepProps) {
  const [followed, setFollowed] = useState<string[]>(formData.followedUsers)

  const toggleFollow = (userId: string) => {
    const newFollowed = followed.includes(userId)
      ? followed.filter((id) => id !== userId)
      : [...followed, userId]

    setFollowed(newFollowed)
    updateFormData({ followedUsers: newFollowed })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Follow athletes in your area
        </h2>
        <p className="text-gray-600">
          See their activities in your feed and stay motivated together
        </p>
      </div>

      {followed.length > 0 && (
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-brand-blue">
            Following {followed.length} athlete{followed.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
        {suggestedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No suggestions yet. Complete your profile to see recommendations!</p>
          </div>
        ) : (
          suggestedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isFollowing={followed.includes(user.id)}
              onToggleFollow={() => toggleFollow(user.id)}
            />
          ))
        )}
      </div>

      {followed.length === 0 && suggestedUsers.length > 0 && (
        <p className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Follow at least a few athletes to make your feed more interesting!
        </p>
      )}
    </div>
  )
}

function UserCard({ user, isFollowing, onToggleFollow }: any) {
  const initials = user.displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatarUrl || undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 truncate">{user.displayName}</p>
        </div>
        <p className="text-sm text-gray-600">@{user.username}</p>
        {user.city && (
          <p className="text-xs text-gray-500">{user.city}</p>
        )}
        {user.sports.length > 0 && (
          <div className="flex gap-1 mt-1">
            {user.sports.slice(0, 3).map((us: any) => (
              <Badge key={us.id} variant="secondary" className="text-xs">
                {us.sport.icon} {us.sport.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={onToggleFollow}
        className="flex-shrink-0"
      >
        {isFollowing ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-1" />
            Follow
          </>
        )}
      </Button>
    </div>
  )
}
