"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Check } from "lucide-react"

interface CommunityStepProps {
  formData: any
  updateFormData: (data: any) => void
  suggestedCommunities: any[]
}

export function CommunityStep({
  formData,
  updateFormData,
  suggestedCommunities,
}: CommunityStepProps) {
  const [joined, setJoined] = useState<string[]>(formData.joinedCommunities)

  const toggleJoin = (communityId: string) => {
    const newJoined = joined.includes(communityId)
      ? joined.filter((id) => id !== communityId)
      : [...joined, communityId]

    setJoined(newJoined)
    updateFormData({ joinedCommunities: newJoined })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          Join communities
        </h2>
        <p className="text-gray-600">
          Connect with like-minded athletes and share your journey
        </p>
      </div>

      {joined.length > 0 && (
        <div className="bg-brand-green/10 border border-brand-green/20 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-brand-green">
            Joined {joined.length} communit{joined.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      )}

      <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
        {suggestedCommunities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No communities available yet. Check back soon!</p>
          </div>
        ) : (
          suggestedCommunities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              isJoined={joined.includes(community.id)}
              onToggleJoin={() => toggleJoin(community.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function CommunityCard({ community, isJoined, onToggleJoin }: any) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center text-white text-2xl">
        {community.sport?.icon || "🏃"}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1">{community.name}</h3>
        {community.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {community.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {community._count.members} members
          </span>
          {community.city && <span>📍 {community.city}</span>}
          {community.sport && (
            <Badge variant="secondary" className="text-xs">
              {community.sport.name}
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant={isJoined ? "outline" : "default"}
        size="sm"
        onClick={onToggleJoin}
        className="flex-shrink-0"
      >
        {isJoined ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            Joined
          </>
        ) : (
          "Join"
        )}
      </Button>
    </div>
  )
}
