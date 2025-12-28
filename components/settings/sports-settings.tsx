"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Star, Trash2, Loader2, Check, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface UserSport {
  id: string
  sportId: string
  sportName: string
  sportIcon: string | null
  isPrimary: boolean
  skillLevel: string | null
}

interface Sport {
  id: string
  name: string
  icon: string | null
}

interface SportsSettingsProps {
  userSports: UserSport[]
  allSports: Sport[]
}

const skillLevels = [
  { value: "BEGINNER", label: "Beginner", description: "Just starting out" },
  { value: "INTERMEDIATE", label: "Intermediate", description: "Regular practice" },
  { value: "ADVANCED", label: "Advanced", description: "Competing regularly" },
  { value: "EXPERT", label: "Expert", description: "High-level athlete" },
]

export function SportsSettings({ userSports, allSports }: SportsSettingsProps) {
  const router = useRouter()
  const [sports, setSports] = useState(userSports)
  const [loading, setLoading] = useState<string | null>(null)
  const [showAddSport, setShowAddSport] = useState(false)

  // Get sports that user hasn't added yet
  const availableSports = allSports.filter(
    sport => !sports.some(us => us.sportId === sport.id)
  )

  const handleSetPrimary = async (sportId: string) => {
    setLoading(sportId)
    try {
      const response = await fetch("/api/user/sports/primary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sportId }),
      })

      if (!response.ok) throw new Error("Failed to update")

      setSports(prev => prev.map(s => ({
        ...s,
        isPrimary: s.sportId === sportId
      })))
      toast.success("Primary sport updated!")
      router.refresh()
    } catch {
      toast.error("Failed to update primary sport")
    } finally {
      setLoading(null)
    }
  }

  const handleUpdateSkillLevel = async (userSportId: string, skillLevel: string) => {
    setLoading(userSportId)
    try {
      const response = await fetch("/api/user/sports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userSportId, skillLevel }),
      })

      if (!response.ok) throw new Error("Failed to update")

      setSports(prev => prev.map(s =>
        s.id === userSportId ? { ...s, skillLevel } : s
      ))
      toast.success("Skill level updated!")
    } catch {
      toast.error("Failed to update skill level")
    } finally {
      setLoading(null)
    }
  }

  const handleAddSport = async (sportId: string) => {
    setLoading(sportId)
    try {
      const response = await fetch("/api/user/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sportId }),
      })

      if (!response.ok) throw new Error("Failed to add sport")

      const data = await response.json()
      const sport = allSports.find(s => s.id === sportId)

      if (sport) {
        setSports(prev => [...prev, {
          id: data.id,
          sportId: sport.id,
          sportName: sport.name,
          sportIcon: sport.icon,
          isPrimary: false,
          skillLevel: null,
        }])
      }

      setShowAddSport(false)
      toast.success(`${sport?.name} added!`)
      router.refresh()
    } catch {
      toast.error("Failed to add sport")
    } finally {
      setLoading(null)
    }
  }

  const handleRemoveSport = async (userSportId: string, sportName: string) => {
    if (!confirm(`Remove ${sportName} from your sports?`)) return

    setLoading(userSportId)
    try {
      const response = await fetch(`/api/user/sports?id=${userSportId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove")

      setSports(prev => prev.filter(s => s.id !== userSportId))
      toast.success(`${sportName} removed`)
      router.refresh()
    } catch {
      toast.error("Failed to remove sport")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Current Sports */}
      {sports.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <p className="text-slate-500 mb-4">You haven't added any sports yet</p>
          <Button onClick={() => setShowAddSport(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Sport
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sports.map((sport) => (
            <Card key={sport.id} className={cn(
              "transition-all",
              sport.isPrimary && "ring-2 ring-orange-500 ring-offset-2"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Drag Handle & Icon */}
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      {sport.sportIcon ? (
                        <img src={sport.sportIcon} alt={sport.sportName} className="w-8 h-8" />
                      ) : (
                        <span className="text-lg font-bold text-slate-400">
                          {sport.sportName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sport Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{sport.sportName}</h3>
                      {sport.isPrimary && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Primary
                        </span>
                      )}
                    </div>

                    {/* Skill Level Selector */}
                    <div className="flex flex-wrap gap-2">
                      {skillLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => handleUpdateSkillLevel(sport.id, level.value)}
                          disabled={loading === sport.id}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                            sport.skillLevel === level.value
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!sport.isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(sport.sportId)}
                        disabled={loading === sport.sportId}
                        className="text-slate-500 hover:text-orange-500"
                      >
                        {loading === sport.sportId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSport(sport.id, sport.sportName)}
                      disabled={loading === sport.id || sport.isPrimary}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Sport Button */}
      {!showAddSport && availableSports.length > 0 && (
        <Button
          variant="outline"
          onClick={() => setShowAddSport(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sport
        </Button>
      )}

      {/* Add Sport Modal */}
      {showAddSport && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Add a Sport</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddSport(false)}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {availableSports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => handleAddSport(sport.id)}
                  disabled={loading === sport.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-center"
                >
                  {loading === sport.id ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      {sport.icon ? (
                        <img src={sport.icon} alt={sport.name} className="w-6 h-6" />
                      ) : (
                        <span className="text-sm font-bold text-slate-400">
                          {sport.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-700 truncate w-full">
                    {sport.name}
                  </span>
                </button>
              ))}
            </div>

            {availableSports.length === 0 && (
              <p className="text-center text-slate-500 py-4">
                You've added all available sports!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
        <Check className="w-5 h-5 text-orange-500 mt-0.5" />
        <div>
          <p className="text-sm text-slate-700">
            <strong>Tip:</strong> Your primary sport affects your profile display and is used for the main Sport Index calculation.
          </p>
        </div>
      </div>
    </div>
  )
}
