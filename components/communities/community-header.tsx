"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Plus } from "lucide-react"

interface CommunityHeaderProps {
    community: any
    currentUserMembership: any
}

export function CommunityHeader({ community, currentUserMembership }: CommunityHeaderProps) {
    const [membership, setMembership] = useState(currentUserMembership)
    const [isLoading, setIsLoading] = useState(false)

    const handleJoin = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/communities/${community.slug}/join`, {
                method: "POST"
            })
            const data = await res.json()
            if (data.success) {
                setMembership({ role: "MEMBER" })
            }
        } catch (error) {
            console.error("Error joining community:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white shadow-sm mb-6">
            {/* Cover */}
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 relative">
                {community.coverPhotoUrl && (
                    <img src={community.coverPhotoUrl} alt={community.name} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-6 pb-4">
                    {/* Info */}
                    <div className="flex-1 pb-2 w-full pt-8 md:pt-0">
                        <h1 className="text-3xl font-bold text-text-primary mb-1">{community.name}</h1>
                        <p className="text-text-secondary flex items-center gap-2 text-sm">
                            <span className="font-medium">{community.sport?.name || community.topic}</span>
                            {community.city && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {community.city}
                                    </span>
                                </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {community.memberCount} members
                            </span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="pb-2 w-full md:w-auto">
                        {!membership ? (
                            <Button
                                onClick={handleJoin}
                                disabled={isLoading}
                                className="w-full md:w-auto bg-brand-primary hover:bg-brand-primary-dark text-white"
                            >
                                {isLoading ? "Joining..." : "Join Community"}
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full md:w-auto border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
                                Member ✓
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
