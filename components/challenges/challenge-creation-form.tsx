"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sport } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, differenceInDays } from "date-fns"
import {
    CalendarIcon,
    Loader2,
    Trophy,
    Target,
    Users,
    Route,
    Timer,
    Activity,
    Globe,
    Lock,
    ChevronRight,
    Flame
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SportTiles } from "@/components/ui/sport-tiles"
import { BigStatInput } from "@/components/ui/big-stat"
import { FrostedSection } from "@/components/ui/frosted-card"
import { ToggleChips } from "@/components/ui/filter-chips"

interface ChallengeCreationFormProps {
    sports: Sport[]
    userId: string
}

const challengeTypes = [
    {
        id: "DISTANCE",
        label: "Distance",
        description: "Total kilometers covered",
        icon: <Route className="w-5 h-5" />,
        unit: "km"
    },
    {
        id: "DURATION",
        label: "Duration",
        description: "Total hours of activity",
        icon: <Timer className="w-5 h-5" />,
        unit: "hours"
    },
    {
        id: "ACTIVITY_COUNT",
        label: "Activities",
        description: "Number of workouts",
        icon: <Activity className="w-5 h-5" />,
        unit: "activities"
    }
]

export function ChallengeCreationForm({ sports, userId }: ChallengeCreationFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        challengeType: "DISTANCE" as "DISTANCE" | "DURATION" | "ACTIVITY_COUNT",
        sportId: "",
        targetValue: "",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isPublic: true,
        maxParticipants: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.title || !formData.sportId || !formData.targetValue) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch("/api/challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    targetValue: parseFloat(formData.targetValue),
                    maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
                    creatorId: userId,
                }),
            })

            if (!response.ok) throw new Error("Failed to create challenge")

            const { challenge } = await response.json()

            toast.success("Challenge created!")
            router.push(`/challenges/${challenge.id}`)
        } catch (error) {
            console.error("Error creating challenge:", error)
            toast.error("Failed to create challenge")
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentType = challengeTypes.find(t => t.id === formData.challengeType)
    const daysRemaining = differenceInDays(formData.endDate, formData.startDate)

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Main Form (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title - Massive Input */}
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Name your challenge..."
                        className="text-4xl font-extrabold h-auto py-4 px-0 border-0 bg-transparent placeholder:text-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />

                    {/* Sport Tiles */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Sport</label>
                        <SportTiles
                            sports={sports.map(s => ({ id: s.id, name: s.name }))}
                            value={formData.sportId}
                            onChange={(value) => setFormData({ ...formData, sportId: value })}
                            maxVisible={8}
                        />
                    </div>

                    {/* Challenge Type Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Challenge Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {challengeTypes.map((type) => {
                                const isSelected = formData.challengeType === type.id
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, challengeType: type.id as any })}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-xl transition-all border-2",
                                            isSelected
                                                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 hover:bg-orange-50"
                                        )}
                                    >
                                        {type.icon}
                                        <span className="font-semibold text-sm">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Target - Big Stat Style */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-600 uppercase tracking-wide">Target Goal</label>
                        <BigStatInput
                            icon={Target}
                            label={currentType?.label || "Target"}
                            value={formData.targetValue}
                            onChange={(value) => setFormData({ ...formData, targetValue: value })}
                            unit={currentType?.unit}
                            placeholder="100"
                            color="amber"
                        />
                    </div>

                    {/* Date Range - Visual Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <FrostedSection title="Start Date" icon={<CalendarIcon className="w-4 h-4 text-indigo-500" />}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-semibold text-lg border-0 bg-slate-50 hover:bg-slate-100"
                                    >
                                        {format(formData.startDate, "MMM d, yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.startDate}
                                        onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </FrostedSection>

                        <FrostedSection title="End Date" icon={<CalendarIcon className="w-4 h-4 text-purple-500" />}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-semibold text-lg border-0 bg-slate-50 hover:bg-slate-100"
                                    >
                                        {format(formData.endDate, "MMM d, yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.endDate}
                                        onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                                        initialFocus
                                        disabled={(date) => date < formData.startDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </FrostedSection>
                    </div>

                    {/* Duration Badge */}
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="font-bold text-slate-800">{daysRemaining} days</span>
                        <span className="text-slate-500">challenge duration</span>
                    </div>

                    {/* Description */}
                    <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="What's the story behind this challenge? Motivate your participants..."
                        className="min-h-[120px] resize-none rounded-xl border-slate-200 bg-white/80 backdrop-blur-sm"
                    />
                </div>

                {/* Right Column - Sidebar (1/3) */}
                <div className="space-y-6">
                    {/* Visibility Toggle */}
                    <FrostedSection title="Visibility" icon={<Globe className="w-4 h-4 text-cyan-500" />}>
                        <ToggleChips
                            options={[
                                {
                                    id: "public",
                                    label: "Public",
                                    description: "Anyone can join",
                                    icon: <Globe className="w-5 h-5" />
                                },
                                {
                                    id: "private",
                                    label: "Private",
                                    description: "Invite only",
                                    icon: <Lock className="w-5 h-5" />
                                }
                            ]}
                            value={formData.isPublic ? "public" : "private"}
                            onChange={(value) => setFormData({ ...formData, isPublic: value === "public" })}
                        />
                    </FrostedSection>

                    {/* Max Participants */}
                    <FrostedSection title="Participants" icon={<Users className="w-4 h-4 text-emerald-500" />}>
                        <div className="space-y-3">
                            <Input
                                type="number"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                placeholder="Unlimited"
                                className="text-center text-xl font-bold border-slate-200"
                            />
                            <p className="text-xs text-slate-500 text-center">
                                Leave empty for unlimited
                            </p>
                        </div>
                    </FrostedSection>

                    {/* Challenge Summary */}
                    <FrostedSection title="Summary" icon={<Trophy className="w-4 h-4 text-amber-500" />}>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sport</span>
                                <span className="font-medium text-slate-900">
                                    {sports.find(s => s.id === formData.sportId)?.name || "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Goal</span>
                                <span className="font-medium text-slate-900">
                                    {formData.targetValue || "0"} {currentType?.unit}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Duration</span>
                                <span className="font-medium text-slate-900">{daysRemaining} days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Visibility</span>
                                <span className="font-medium text-slate-900">
                                    {formData.isPublic ? "Public" : "Private"}
                                </span>
                            </div>
                        </div>
                    </FrostedSection>
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-14 text-lg rounded-xl"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] h-14 text-lg rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] transition-all"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Launch Challenge
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
