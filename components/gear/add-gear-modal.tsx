"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface AddGearModalProps {
    isOpen: boolean
    onClose: () => void
    onGearAdded: () => void
}

const GEAR_TYPES = [
    { value: 'RUNNING_SHOES', label: 'Running Shoes' },
    { value: 'CYCLING_SHOES', label: 'Cycling Shoes' },
    { value: 'BIKE', label: 'Bike' },
    { value: 'HELMET', label: 'Helmet' },
    { value: 'WATCH', label: 'Watch' },
    { value: 'HEART_RATE_MONITOR', label: 'Heart Rate Monitor' },
    { value: 'GOLF_CLUBS', label: 'Golf Clubs' },
    { value: 'TENNIS_RACKET', label: 'Tennis Racket' },
    { value: 'SWIM_GOGGLES', label: 'Swim Goggles' },
    { value: 'OTHER', label: 'Other' },
]

export function AddGearModal({ isOpen, onClose, onGearAdded }: AddGearModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        gearType: '',
        brand: '',
        model: '',
        nickname: '',
        maxRecommendedDistance: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('/api/gear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    maxRecommendedDistance: formData.maxRecommendedDistance ? parseFloat(formData.maxRecommendedDistance) * 1000 : null // Convert km to meters
                })
            })

            if (res.ok) {
                onGearAdded()
                onClose()
            }
        } catch (error) {
            console.error('Failed to add gear', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Gear</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Gear Type</Label>
                        <Select
                            value={formData.gearType}
                            onValueChange={(value) => setFormData({ ...formData, gearType: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {GEAR_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Brand</Label>
                            <Input
                                value={formData.brand}
                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <Input
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Nickname (Optional)</Label>
                        <Input
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Max Recommended Distance (km) (Optional)</Label>
                        <Input
                            type="number"
                            value={formData.maxRecommendedDistance}
                            onChange={(e) => setFormData({ ...formData, maxRecommendedDistance: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Gear
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
