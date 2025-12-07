"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sport, Discipline } from "@prisma/client"
import { GPSTracker } from "./gps-tracker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface GPSPoint {
  lat: number
  lng: number
  timestamp: number
  altitude?: number
  accuracy?: number
}

interface GPSTrackerPageProps {
  sports: (Sport & { disciplines: Discipline[] })[]
}

export function GPSTrackerPage({ sports }: GPSTrackerPageProps) {
  const router = useRouter()
  const [step, setStep] = useState<"setup" | "tracking" | "complete">("setup")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedSportId, setSelectedSportId] = useState("")
  const [selectedDisciplineId, setSelectedDisciplineId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const [activityData, setActivityData] = useState<{
    route: GPSPoint[]
    distance: number
    duration: number
    avgPace: number
  } | null>(null)

  const selectedSport = sports.find((s) => s.id === selectedSportId)

  const handleSetup = () => {
    if (!selectedSportId || !selectedDisciplineId || !title) {
      toast.error("Please fill in all required fields")
      return
    }

    setStep("tracking")
  }

  const handleComplete = async (data: {
    route: GPSPoint[]
    distance: number
    duration: number
    avgPace: number
  }) => {
    setActivityData(data)
    setStep("complete")
  }

  const handleSave = async () => {
    if (!activityData) return

    setIsSubmitting(true)

    try {
      // Save activity with GPS data
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          sportId: selectedSportId,
          disciplineId: selectedDisciplineId,
          activityDate: new Date().toISOString(),
          durationSeconds: activityData.duration,
          distanceMeters: activityData.distance,
          avgPace: activityData.avgPace,
          route: activityData.route,
          visibility: "PUBLIC",
        }),
      })

      if (!response.ok) throw new Error("Failed to save activity")

      const { activity } = await response.json()

      toast.success("Activity saved successfully!")
      router.push(`/activity/${activity.id}`)
    } catch (error) {
      console.error("Error saving activity:", error)
      toast.error("Failed to save activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "setup") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              placeholder="Morning Run"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="sport">Sport *</Label>
            <Select value={selectedSportId} onValueChange={setSelectedSportId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sport" />
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

          {selectedSport && (
            <div>
              <Label htmlFor="discipline">Discipline *</Label>
              <Select
                value={selectedDisciplineId}
                onValueChange={setSelectedDisciplineId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Discipline" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSport.disciplines.map((discipline) => (
                    <SelectItem key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="How did it go?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleSetup} className="w-full" size="lg">
            Start GPS Tracking
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === "tracking") {
    return <GPSTracker onComplete={handleComplete} />
  }

  if (step === "complete" && activityData) {
    return (
      <div className="space-y-6">
        <Card className="border-brand-primary bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Activity Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-text-muted mb-1">Distance</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {(activityData.distance / 1000).toFixed(2)} km
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Duration</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {Math.floor(activityData.duration / 60)}:
                  {(activityData.duration % 60).toString().padStart(2, "0")}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Avg Pace</p>
                <p className="text-2xl font-bold text-brand-primary">
                  {Math.floor(activityData.avgPace)}:
                  {Math.floor((activityData.avgPace % 1) * 60)
                    .toString()
                    .padStart(2, "0")}{" "}
                  /km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-text-muted">Title</p>
              <p className="font-semibold text-text-primary">{title}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Sport</p>
              <p className="font-semibold text-text-primary">
                {selectedSport?.name}
              </p>
            </div>
            {description && (
              <div>
                <p className="text-sm text-text-muted">Description</p>
                <p className="text-text-primary">{description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-text-muted">GPS Points Recorded</p>
              <p className="font-semibold text-text-primary">
                {activityData.route.length} points
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setStep("setup")
              setActivityData(null)
            }}
            className="flex-1"
          >
            Discard
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Activity"
            )}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
