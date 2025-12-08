"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format, addDays, addWeeks } from "date-fns"
import {
  Trophy,
  Target,
  Calendar,
  ArrowLeft,
  Loader2,
  Zap,
  Clock,
  Flame,
  Mountain,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toast } from "sonner"

interface PageProps {
  params: Promise<{ slug: string }>
}

const TARGET_TYPES = [
  { value: "DISTANCE", label: "Distance", icon: Target, unit: "km", description: "Total distance covered" },
  { value: "DURATION", label: "Duration", icon: Clock, unit: "hours", description: "Total time spent" },
  { value: "ACTIVITIES", label: "Activities", icon: Activity, unit: "workouts", description: "Number of workouts" },
  { value: "CALORIES", label: "Calories", icon: Flame, unit: "kcal", description: "Calories burned" },
  { value: "ELEVATION", label: "Elevation", icon: Mountain, unit: "m", description: "Elevation gain" },
]

const PRESET_DURATIONS = [
  { label: "1 Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
  { label: "Custom", days: 0 },
]

const PRESET_CHALLENGES = [
  {
    title: "Weekly Distance Challenge",
    description: "Let's see who can cover the most distance this week!",
    targetType: "DISTANCE",
    targetValue: 50,
    targetUnit: "km",
    duration: 7
  },
  {
    title: "Active January",
    description: "Start the year strong with daily workouts",
    targetType: "ACTIVITIES",
    targetValue: 20,
    targetUnit: "workouts",
    duration: 30
  },
  {
    title: "Climb Challenge",
    description: "Accumulate the most elevation gain",
    targetType: "ELEVATION",
    targetValue: 1000,
    targetUnit: "m",
    duration: 14
  },
  {
    title: "Burn It Up",
    description: "Burn calories together as a team",
    targetType: "CALORIES",
    targetValue: 5000,
    targetUnit: "kcal",
    duration: 7
  },
]

export default function CreateTeamChallengePage({ params }: PageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const { data: session } = useSession()

  const [team, setTeam] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetType, setTargetType] = useState("DISTANCE")
  const [targetValue, setTargetValue] = useState("")
  const [targetUnit, setTargetUnit] = useState("km")
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(addWeeks(new Date(), 1), "yyyy-MM-dd"))
  const [selectedDuration, setSelectedDuration] = useState(7)
  const [autoJoinMembers, setAutoJoinMembers] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${slug}`)
        const data = await res.json()
        if (data.team) {
          setTeam(data.team)
        }
      } catch (error) {
        console.error("Error fetching team:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeam()
  }, [slug])

  const handleTargetTypeChange = (value: string) => {
    setTargetType(value)
    const targetConfig = TARGET_TYPES.find(t => t.value === value)
    if (targetConfig) {
      setTargetUnit(targetConfig.unit)
    }
  }

  const handleDurationChange = (days: number) => {
    setSelectedDuration(days)
    if (days > 0) {
      setEndDate(format(addDays(new Date(startDate), days), "yyyy-MM-dd"))
    }
  }

  const handlePresetSelect = (preset: typeof PRESET_CHALLENGES[0]) => {
    setTitle(preset.title)
    setDescription(preset.description)
    setTargetType(preset.targetType)
    setTargetValue(preset.targetValue.toString())
    setTargetUnit(preset.targetUnit)
    handleDurationChange(preset.duration)
    toast.success("Preset loaded! Feel free to customize.")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !targetValue || !startDate || !endDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/teams/${slug}/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          targetType,
          targetValue: parseFloat(targetValue),
          targetUnit,
          startDate,
          endDate,
          autoJoinMembers
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Challenge created successfully!")
        router.push(`/teams/${slug}?tab=challenges`)
      } else {
        toast.error(data.error || "Failed to create challenge")
      }
    } catch (error) {
      console.error("Error creating challenge:", error)
      toast.error("Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-page flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-page pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/teams/${slug}`}
            className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {team?.name || "Team"}
          </Link>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            <Trophy className="w-8 h-8 text-brand-primary" />
            Create Team Challenge
          </h1>
          <p className="text-text-secondary mt-2">
            Set up a competition for your team members
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Challenge Details */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Challenge Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Weekly Distance Challenge"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this challenge is about..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Target Type Selection */}
                  <div className="space-y-3">
                    <Label>Challenge Type *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TARGET_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTargetTypeChange(type.value)}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-all text-left",
                            targetType === type.value
                              ? "border-brand-primary bg-brand-primary/5"
                              : "border-border-light hover:border-brand-primary/50"
                          )}
                        >
                          <type.icon className={cn(
                            "w-5 h-5 mb-2",
                            targetType === type.value ? "text-brand-primary" : "text-text-muted"
                          )} />
                          <p className="font-medium text-text-primary text-sm">{type.label}</p>
                          <p className="text-xs text-text-muted mt-1">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetValue">Target Value *</Label>
                      <Input
                        id="targetValue"
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        placeholder="e.g., 50"
                        className="mt-1"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetUnit">Unit</Label>
                      <Input
                        id="targetUnit"
                        value={targetUnit}
                        onChange={(e) => setTargetUnit(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-3">
                    <Label>Duration</Label>
                    <div className="flex gap-2 flex-wrap">
                      {PRESET_DURATIONS.map((duration) => (
                        <button
                          key={duration.label}
                          type="button"
                          onClick={() => handleDurationChange(duration.days)}
                          className={cn(
                            "px-4 py-2 rounded-lg border transition-all text-sm",
                            selectedDuration === duration.days
                              ? "border-brand-primary bg-brand-primary text-white"
                              : "border-border-light hover:border-brand-primary/50"
                          )}
                        >
                          {duration.label}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value)
                            setSelectedDuration(0)
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto Join Setting */}
                  <div className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">Auto-join all team members</p>
                      <p className="text-sm text-text-muted">
                        Automatically add all current team members to this challenge
                      </p>
                    </div>
                    <Switch
                      checked={autoJoinMembers}
                      onCheckedChange={setAutoJoinMembers}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark py-6 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Create Challenge
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Presets */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-primary" />
                  Quick Start Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PRESET_CHALLENGES.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full p-3 text-left rounded-lg border border-border-light hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
                  >
                    <p className="font-medium text-text-primary text-sm">
                      {preset.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {preset.targetValue} {preset.targetUnit} • {preset.duration} days
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-brand-blue to-blue-600 text-white">
              <CardContent className="p-6">
                <Trophy className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Tips for Success</h3>
                <ul className="text-sm text-white/80 space-y-2">
                  <li>• Set achievable but challenging targets</li>
                  <li>• Keep challenges 1-4 weeks long</li>
                  <li>• Write engaging descriptions</li>
                  <li>• Consider your team's average activity level</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
