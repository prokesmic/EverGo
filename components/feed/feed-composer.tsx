"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image, MapPin, Activity, Trophy, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeedComposerProps {
    userImage?: string | null
    userName?: string | null
}

const sports = [
    { id: "running", label: "Running", color: "border-brand-green text-brand-green bg-brand-green/5" },
    { id: "cycling", label: "Cycling", color: "border-yellow-500 text-yellow-600 bg-yellow-500/5" },
    { id: "football", label: "Football", color: "border-green-600 text-green-700 bg-green-600/5" },
    { id: "kiting", label: "Kiting", color: "border-cyan-500 text-cyan-600 bg-cyan-500/5" },
    { id: "other", label: "Other", color: "border-gray-400 text-gray-600 bg-gray-100" },
]

export function FeedComposer({ userImage, userName }: FeedComposerProps) {
    const [selectedSport, setSelectedSport] = useState<string | null>(null)
    const [isFocused, setIsFocused] = useState(false)

    const activeSport = sports.find(s => s.id === selectedSport)

    return (
        <div className={cn(
            "bg-white rounded-2xl shadow-sm border p-4 transition-all duration-300",
            isFocused ? "ring-2 ring-brand-blue/20 border-brand-blue/30" : "border-gray-100",
            activeSport ? activeSport.color.replace("text-", "ring-").replace("bg-", "border-") : ""
        )}>
            <div className="flex gap-4">
                <Avatar className="h-10 w-10 border border-gray-100">
                    <AvatarImage src={userImage || ""} />
                    <AvatarFallback className="bg-brand-blue text-white">{userName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <Input
                        placeholder={`What's new with your ${selectedSport ? activeSport?.label.toLowerCase() : 'training'}?`}
                        className="bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:border-transparent px-4 py-3 h-auto text-base"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />

                    {/* Sport Chips */}
                    <div className="flex flex-wrap gap-2">
                        {sports.map((sport) => (
                            <button
                                key={sport.id}
                                onClick={() => setSelectedSport(selectedSport === sport.id ? null : sport.id)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                                    selectedSport === sport.id
                                        ? sport.color + " border-current"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                )}
                            >
                                {sport.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-blue hover:bg-blue-50 h-8 px-2">
                                <Camera className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Photo</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-blue hover:bg-blue-50 h-8 px-2">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Location</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-blue hover:bg-blue-50 h-8 px-2">
                                <Trophy className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Result</span>
                            </Button>
                        </div>
                        <Button size="sm" className={cn(
                            "text-white font-medium px-6 transition-colors",
                            activeSport
                                ? activeSport.color.replace("bg-", "bg-").replace("/5", "")
                                : "bg-brand-blue hover:bg-brand-blue-dark"
                        )}>
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
