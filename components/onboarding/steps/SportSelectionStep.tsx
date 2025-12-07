"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface SportSelectionStepProps {
  formData: any
  updateFormData: (data: any) => void
  sports: any[]
}

export function SportSelectionStep({
  formData,
  updateFormData,
  sports,
}: SportSelectionStepProps) {
  const [selected, setSelected] = useState<string[]>(formData.selectedSports)

  const toggleSport = (sportId: string) => {
    const newSelected = selected.includes(sportId)
      ? selected.filter((id) => id !== sportId)
      : [...selected, sportId]

    setSelected(newSelected)
    updateFormData({ selectedSports: newSelected })
  }

  const popularSports = ["Running", "Cycling", "Swimming", "Gym", "Tennis", "Golf"]
  const popularSportObjects = sports.filter(s => popularSports.includes(s.name))
  const otherSports = sports.filter(s => !popularSports.includes(s.name))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          What sports do you do?
        </h2>
        <p className="text-gray-600">
          Select all that apply. You can always add more later.
        </p>
      </div>

      {selected.length > 0 && (
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-4">
          <p className="text-sm font-medium text-brand-blue mb-2">
            Selected: {selected.length} sport{selected.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {sports
              .filter(s => selected.includes(s.id))
              .map(sport => (
                <Badge key={sport.id} variant="default">
                  {sport.icon} {sport.name}
                </Badge>
              ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Sports</h3>
          <div className="grid grid-cols-3 gap-3">
            {popularSportObjects.map((sport) => (
              <SportCard
                key={sport.id}
                sport={sport}
                isSelected={selected.includes(sport.id)}
                onClick={() => toggleSport(sport.id)}
              />
            ))}
          </div>
        </div>

        {otherSports.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Other Sports</h3>
            <div className="grid grid-cols-4 gap-2">
              {otherSports.map((sport) => (
                <Button
                  key={sport.id}
                  variant={selected.includes(sport.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSport(sport.id)}
                  className="justify-start"
                >
                  {sport.icon} {sport.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected.length === 0 && (
        <p className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
          Select at least one sport to continue (or skip this step)
        </p>
      )}
    </div>
  )
}

function SportCard({ sport, isSelected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all
        ${isSelected
          ? 'border-brand-blue bg-brand-blue/5 shadow-md'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      <span className="text-4xl mb-2">{sport.icon}</span>
      <span className={`text-sm font-medium ${isSelected ? 'text-brand-blue' : 'text-gray-700'}`}>
        {sport.name}
      </span>
    </button>
  )
}
