"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusComposer } from "./status-composer"
import { ActivityComposer } from "./activity-composer"
import { useSession } from "next-auth/react"
import { PenSquare, Activity } from "lucide-react"

interface CreatePostBoxProps {
    onPostCreated?: () => void
}

export function CreatePostBox({ onPostCreated }: CreatePostBoxProps) {
    const { data: session } = useSession()
    const [isExpanded, setIsExpanded] = useState(false)
    const [mode, setMode] = useState<"status" | "activity">("status")

    if (!session?.user) return null

    const handlePostCreated = () => {
        setIsExpanded(false)
        onPostCreated?.()
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden mb-6">
            {!isExpanded ? (
                <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsExpanded(true)}
                >
                    <Avatar className="h-10 w-10 border border-border-light">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                        <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-bg-page rounded-full px-4 py-2.5 text-text-muted text-sm font-medium">
                        What's new with your training?
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={mode === "status" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("status")}
                            className={mode === "status" ? "bg-brand-primary text-white" : ""}
                        >
                            <PenSquare className="w-4 h-4 mr-2" />
                            Status
                        </Button>
                        <Button
                            variant={mode === "activity" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("activity")}
                            className={mode === "activity" ? "bg-brand-primary text-white" : ""}
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Log Activity
                        </Button>
                    </div>

                    {mode === "status" ? (
                        <StatusComposer onSubmit={handlePostCreated} />
                    ) : (
                        <ActivityComposer onSubmit={handlePostCreated} />
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full text-text-muted hover:text-text-primary"
                        onClick={() => setIsExpanded(false)}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    )
}
