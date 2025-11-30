"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreatePartnerRequestModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void
}

export function CreatePartnerRequestModal({ isOpen, onClose, onCreated }: CreatePartnerRequestModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        city: "Prague", // Default for now
        minParticipants: "2",
        maxParticipants: "4",
        sportId: "" // Needs to be populated from sports list
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Combine date and time
            const dateTime = new Date(`${formData.date}T${formData.time}`)

            const res = await fetch("/api/partner-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    date: dateTime.toISOString(),
                    // Hardcoded sportId for demo if not selected, ideally fetch sports
                    sportId: formData.sportId || "cm42l9q8w0002v93w5y8z6x7a" // Replace with real ID lookup
                })
            })

            if (res.ok) {
                onCreated()
                onClose()
            }
        } catch (error) {
            console.error("Failed to create request", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Find Training Partners</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            placeholder="e.g., Sunday Morning Run"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                            placeholder="e.g., Stromovka Park"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Min Participants</Label>
                            <Input
                                type="number"
                                min="2"
                                value={formData.minParticipants}
                                onChange={(e) => setFormData({ ...formData, minParticipants: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Participants</Label>
                            <Input
                                type="number"
                                min="2"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Details about pace, route, etc."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Request
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
