"use client"

import { useEffect, useState } from "react"
import { Users, MapPin, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { CreatePartnerRequestModal } from "./create-partner-request-modal"
import { useSession } from "next-auth/react"

interface PartnerRequest {
    id: string
    title: string
    date: string
    location: string
    minParticipants: number
    maxParticipants: number | null
    creator: {
        displayName: string
        avatarUrl: string | null
    }
    participants: {
        user: {
            id: string
            avatarUrl: string | null
        }
    }[]
}

export function PartnerFinderWidget() {
    const { data: session } = useSession()
    const [requests, setRequests] = useState<PartnerRequest[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/partner-requests")
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (error) {
            console.error("Failed to fetch requests", error)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleJoin = async (requestId: string) => {
        try {
            const res = await fetch(`/api/partner-requests/${requestId}/join`, {
                method: "POST"
            })
            if (res.ok) {
                fetchRequests()
            }
        } catch (error) {
            console.error("Failed to join request", error)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-brand-blue" />
                    Partner Finder
                </h3>
                <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create
                </Button>
            </div>

            <div className="space-y-3">
                {requests.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">
                        No active requests nearby. Be the first to create one!
                    </div>
                ) : (
                    requests.map((request) => {
                        const isParticipant = request.participants.some(p => p.user.id === session?.user?.id)
                        const isFull = request.maxParticipants && request.participants.length >= request.maxParticipants

                        return (
                            <div key={request.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm">{request.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(request.date), "MMM d, HH:mm")}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {request.location}
                                        </div>
                                    </div>
                                    {isParticipant ? (
                                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Joined</span>
                                    ) : (
                                        <Button
                                            size="sm"
                                            className="h-7 text-xs"
                                            disabled={isFull || !session}
                                            onClick={() => handleJoin(request.id)}
                                        >
                                            {isFull ? "Full" : "Join"}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex -space-x-2">
                                        {request.participants.map((p, i) => (
                                            <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                                <AvatarImage src={p.user.avatarUrl || undefined} />
                                                <AvatarFallback className="text-[10px]">U</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {request.participants.length} / {request.maxParticipants || "∞"}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <CreatePartnerRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={fetchRequests}
            />
        </div>
    )
}
