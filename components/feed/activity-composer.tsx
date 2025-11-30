"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface ActivityComposerProps {
    onSubmit?: () => void
}

export function ActivityComposer({ onSubmit }: ActivityComposerProps) {
    const [formData, setFormData] = useState({
        sportId: "",
        title: "",
        description: "",
        activityDate: new Date().toISOString().slice(0, 16),
        durationHours: 0,
        durationMinutes: 0,
        durationSeconds: 0,
        distanceKm: "",
        elevationGain: "",
        caloriesBurned: "",
        avgHeartRate: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const durationSeconds =
                (formData.durationHours * 3600) +
                (formData.durationMinutes * 60) +
                formData.durationSeconds

            await fetch("/api/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    durationSeconds,
                    distanceMeters: formData.distanceKm ? parseFloat(formData.distanceKm) * 1000 : undefined,
                    elevationGain: formData.elevationGain ? parseFloat(formData.elevationGain) : undefined,
                    caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
                    avgHeartRate: formData.avgHeartRate ? parseInt(formData.avgHeartRate) : undefined,
                })
            })
            onSubmit?.()
        } catch (error) {
            console.error("Error creating activity:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Sport</Label>
                    <Select
                        value={formData.sportId}
                        onValueChange={(val) => setFormData({ ...formData, sportId: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="running">Running</SelectItem>
                            <SelectItem value="cycling">Cycling</SelectItem>
                            <SelectItem value="swimming">Swimming</SelectItem>
                            <SelectItem value="fitness">Fitness</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Date & Time</Label>
                    <Input
                        type="datetime-local"
                        value={formData.activityDate}
                        onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Title</Label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Morning Run"
                />
            </div>

            <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="number" min="0" placeholder="0"
                            value={formData.durationHours || ""}
                            onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 0 })}
                        />
                        <span className="text-xs text-text-muted">hrs</span>
                    </div>
                    <div className="flex-1">
                        <Input
                            type="number" min="0" max="59" placeholder="0"
                            value={formData.durationMinutes || ""}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                        />
                        <span className="text-xs text-text-muted">min</span>
                    </div>
                    <div className="flex-1">
                        <Input
                            type="number" min="0" max="59" placeholder="0"
                            value={formData.durationSeconds || ""}
                            onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })}
                        />
                        <span className="text-xs text-text-muted">sec</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                        type="number" step="0.01" placeholder="0.00"
                        value={formData.distanceKm}
                        onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Calories</Label>
                    <Input
                        type="number" placeholder="0"
                        value={formData.caloriesBurned}
                        onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="How did it go?"
                    className="resize-none"
                />
            </div>

            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.sportId}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging...
                    </>
                ) : (
                    "Log Activity"
                )}
            </Button>
        </div>
    )
}
