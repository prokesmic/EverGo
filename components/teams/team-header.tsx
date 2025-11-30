"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, CheckCircle2, Trophy, Users, Calendar } from "lucide-react"
import { format } from "date-fns"

interface TeamHeaderProps {
    team: any
    currentUserMembership: any
}

export function TeamHeader({ team, currentUserMembership }: TeamHeaderProps) {
    const [membership, setMembership] = useState(currentUserMembership)
    const [isLoading, setIsLoading] = useState(false)

    const handleJoin = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/teams/${team.slug}/join`, {
                method: "POST"
            })
            const data = await res.json()
            if (data.success) {
                if (data.status === "JOINED") {
                    setMembership({ role: "MEMBER", status: "APPROVED" })
                } else {
                    setMembership({ status: "PENDING" })
                }
            }
        } catch (error) {
            console.error("Error joining team:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-white shadow-sm mb-6">
            {/* Cover */}
            <div className="h-48 bg-gradient-to-r from-brand-blue to-blue-600 relative">
                {team.coverPhotoUrl && (
                    <img src={team.coverPhotoUrl} alt={team.name} className="w-full h-full object-cover" />
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 pb-4">
                    {/* Logo */}
                    <div className="w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-4 border-white shrink-0">
                        {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">{team.sport.icon}</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pb-2 w-full">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-text-primary">{team.name}</h1>
                            {team.isVerified && (
                                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                            )}
                        </div>
                        <p className="text-text-secondary flex items-center gap-2 text-sm">
                            <span>{team.sport.name}</span>
                            {(team.city || team.country) && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {team.city}{team.city && team.country ? ", " : ""}{team.country}
                                    </span>
                                </>
                            )}
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
                                {isLoading ? "Joining..." : "Join Team"}
                            </Button>
                        ) : membership.status === "PENDING" ? (
                            <Button variant="outline" disabled className="w-full md:w-auto">
                                Request Pending
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
