"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Activity, CalendarDays, Trophy, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CalendarItemType } from "@/lib/calendar/types"

interface CalendarSidebarProps {
  selectedDate: Date
  onDateSelect: (date: Date | undefined) => void
  typeFilters: CalendarItemType[]
  onTypeFilterChange: (types: CalendarItemType[]) => void
  sportFilters: string[]
  onSportFilterChange: (slugs: string[]) => void
  availableSports: { id: string; name: string; slug: string }[]
}

export function CalendarSidebar({
  selectedDate,
  onDateSelect,
  typeFilters,
  onTypeFilterChange,
  sportFilters,
  onSportFilterChange,
  availableSports,
}: CalendarSidebarProps) {
  const [showAllSports, setShowAllSports] = useState(false)

  const typeOptions: { type: CalendarItemType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: "activity", label: "Activities", icon: <Activity className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    { type: "event", label: "Events", icon: <CalendarDays className="h-3.5 w-3.5" />, color: "bg-sky-100 text-sky-700 border-sky-200" },
    { type: "challenge", label: "Challenges", icon: <Trophy className="h-3.5 w-3.5" />, color: "bg-violet-100 text-violet-700 border-violet-200" },
  ]

  const toggleType = (type: CalendarItemType) => {
    if (typeFilters.includes(type)) {
      onTypeFilterChange(typeFilters.filter((t) => t !== type))
    } else {
      onTypeFilterChange([...typeFilters, type])
    }
  }

  const toggleSport = (slug: string) => {
    if (sportFilters.includes(slug)) {
      onSportFilterChange(sportFilters.filter((s) => s !== slug))
    } else {
      onSportFilterChange([...sportFilters, slug])
    }
  }

  const clearFilters = () => {
    onTypeFilterChange(["activity", "event", "challenge"])
    onSportFilterChange([])
  }

  const hasActiveFilters = typeFilters.length < 3 || sportFilters.length > 0

  const displaySports = showAllSports ? availableSports : availableSports.slice(0, 5)

  return (
    <div data-testid="calendar-sidebar" className="space-y-4">
      {/* Mini Month Picker */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 transition-all duration-300 hover:shadow-md">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="w-full"
        />
      </div>

      {/* Filters */}
      <div
        data-testid="calendar-filter-type"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-900">
            <Filter className="h-4 w-4 text-orange-500" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Type filters */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</p>
          <div className="flex flex-wrap gap-2">
            {typeOptions.map(({ type, label, icon, color }) => {
              const isActive = typeFilters.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    isActive ? color : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                  )}
                >
                  {icon}
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sport filters */}
        {availableSports.length > 0 && (
          <div data-testid="calendar-filter-sport" className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sport</p>
            <div className="flex flex-wrap gap-1.5">
              {displaySports.map((sport) => {
                const isActive = sportFilters.includes(sport.slug)
                return (
                  <Badge
                    key={sport.id}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-all text-xs",
                      isActive
                        ? "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => toggleSport(sport.slug)}
                  >
                    {sport.name}
                  </Badge>
                )
              })}
            </div>
            {availableSports.length > 5 && (
              <button
                onClick={() => setShowAllSports(!showAllSports)}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                {showAllSports ? "Show less" : `+${availableSports.length - 5} more`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
