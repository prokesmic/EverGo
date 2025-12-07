"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sport } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Trophy, Target, Users } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ChallengeCreationFormProps {
  sports: Sport[]
  userId: string
}

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
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
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

      toast.success("Challenge created successfully!")
      router.push(`/challenges/${challenge.id}`)
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast.error("Failed to create challenge")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case "DISTANCE":
        return "km"
      case "DURATION":
        return "hours"
      case "ACTIVITY_COUNT":
        return "activities"
      default:
        return ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Challenge Title */}
      <div>
        <Label htmlFor="title" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Challenge Title *
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="30-Day Running Challenge"
          required
          className="mt-2"
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Run 100km in 30 days and push your limits!"
          rows={4}
          className="mt-2"
        />
      </div>

      {/* Sport Selection */}
      <div>
        <Label htmlFor="sport" className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Sport *
        </Label>
        <Select value={formData.sportId} onValueChange={(value) => setFormData({ ...formData, sportId: value })}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Challenge Type */}
      <div>
        <Label htmlFor="challengeType">Challenge Type *</Label>
        <Select
          value={formData.challengeType}
          onValueChange={(value: any) => setFormData({ ...formData, challengeType: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DISTANCE">Total Distance</SelectItem>
            <SelectItem value="DURATION">Total Duration</SelectItem>
            <SelectItem value="ACTIVITY_COUNT">Number of Activities</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Target Value */}
      <div>
        <Label htmlFor="targetValue">
          Target {getChallengeTypeLabel(formData.challengeType)} *
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="targetValue"
            type="number"
            step="0.1"
            value={formData.targetValue}
            onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
            placeholder="100"
            required
          />
          <div className="px-4 py-2 bg-surface-secondary rounded-lg text-text-muted font-medium min-w-[100px] flex items-center justify-center">
            {getChallengeTypeLabel(formData.challengeType)}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal mt-2", !formData.startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
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
        </div>

        <div>
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal mt-2", !formData.endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
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
        </div>
      </div>

      {/* Max Participants */}
      <div>
        <Label htmlFor="maxParticipants" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Max Participants (Optional)
        </Label>
        <Input
          id="maxParticipants"
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
          placeholder="Unlimited"
          className="mt-2"
        />
        <p className="text-xs text-text-muted mt-1">Leave empty for unlimited participants</p>
      </div>

      {/* Privacy */}
      <div className="flex items-center gap-3 p-4 bg-surface-secondary rounded-lg">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="w-4 h-4 rounded"
        />
        <div className="flex-1">
          <Label htmlFor="isPublic" className="cursor-pointer">
            Public Challenge
          </Label>
          <p className="text-xs text-text-muted mt-1">
            {formData.isPublic
              ? "Anyone can view and join this challenge"
              : "Only people with the link can join"}
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Create Challenge
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
