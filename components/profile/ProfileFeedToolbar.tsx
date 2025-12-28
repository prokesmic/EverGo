"use client"

import { useState } from "react"
import { LayoutGrid, List, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type FeedViewMode = "list" | "grid"
export type FeedSortBy = "recent" | "distance" | "duration" | "kudos"
export type FeedFilterSport = "all" | string

interface ProfileFeedToolbarProps {
  viewMode: FeedViewMode
  onViewModeChange: (mode: FeedViewMode) => void
  sortBy: FeedSortBy
  onSortByChange: (sort: FeedSortBy) => void
  filterSport: FeedFilterSport
  onFilterSportChange: (sport: FeedFilterSport) => void
  availableSports?: { id: string; name: string }[]
  totalActivities?: number
}

export function ProfileFeedToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  filterSport,
  onFilterSportChange,
  availableSports = [],
  totalActivities = 0,
}: ProfileFeedToolbarProps) {
  const sortOptions: { value: FeedSortBy; label: string }[] = [
    { value: "recent", label: "Most Recent" },
    { value: "distance", label: "Longest Distance" },
    { value: "duration", label: "Longest Duration" },
    { value: "kudos", label: "Most Kudos" },
  ]

  const currentSortLabel = sortOptions.find((s) => s.value === sortBy)?.label || "Sort"

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-1">
      {/* Left: Activity count */}
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Activities</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
          {totalActivities}
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Sport Filter */}
        {availableSports.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Filter className="w-3.5 h-3.5" />
                {filterSport === "all" ? "All Sports" : filterSport}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => onFilterSportChange("all")}>
                All Sports
              </DropdownMenuItem>
              {availableSports.map((sport) => (
                <DropdownMenuItem
                  key={sport.id}
                  onClick={() => onFilterSportChange(sport.name)}
                >
                  {sport.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              {currentSortLabel}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[150px]">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onSortByChange(option.value)}
                className={cn(sortBy === option.value && "bg-slate-100")}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 transition-colors",
              viewMode === "list"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 hover:text-slate-900"
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 transition-colors",
              viewMode === "grid"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-500 hover:text-slate-900"
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
