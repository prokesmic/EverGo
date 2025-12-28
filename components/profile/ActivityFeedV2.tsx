"use client"

import { useState, useMemo } from "react"
import { Activity } from "lucide-react"
import { ProfileFeedToolbar, FeedViewMode, FeedSortBy, FeedFilterSport } from "./ProfileFeedToolbar"
import { ActivityCardV2, ActivityCardV2Props } from "./ActivityCardV2"
import { cn } from "@/lib/utils"

type ActivityType = ActivityCardV2Props["activity"]

interface ActivityFeedV2Props {
  activities: ActivityType[]
  showToolbar?: boolean
  showUserOnCards?: boolean
  emptyMessage?: string
}

export function ActivityFeedV2({
  activities,
  showToolbar = true,
  showUserOnCards = false,
  emptyMessage = "No activities yet",
}: ActivityFeedV2Props) {
  const [viewMode, setViewMode] = useState<FeedViewMode>("list")
  const [sortBy, setSortBy] = useState<FeedSortBy>("recent")
  const [filterSport, setFilterSport] = useState<FeedFilterSport>("all")

  // Extract unique sports from activities
  const availableSports = useMemo(() => {
    const sportMap = new Map<string, { id: string; name: string }>()
    activities.forEach((a) => {
      const sport = a.discipline.sport
      if (!sportMap.has(sport.name)) {
        sportMap.set(sport.name, { id: sport.name, name: sport.name })
      }
    })
    return Array.from(sportMap.values())
  }, [activities])

  // Filter and sort activities
  const filteredAndSortedActivities = useMemo(() => {
    let result = [...activities]

    // Filter by sport
    if (filterSport !== "all") {
      result = result.filter((a) => a.discipline.sport.name === filterSport)
    }

    // Sort
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
        break
      case "distance":
        result.sort((a, b) => (b.distanceMeters || 0) - (a.distanceMeters || 0))
        break
      case "duration":
        result.sort((a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0))
        break
      case "kudos":
        result.sort((a, b) => (b._count?.kudos || 0) - (a._count?.kudos || 0))
        break
    }

    return result
  }, [activities, filterSport, sortBy])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {showToolbar && (
        <ProfileFeedToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          filterSport={filterSport}
          onFilterSportChange={setFilterSport}
          availableSports={availableSports}
          totalActivities={activities.length}
        />
      )}

      {/* Activity Cards */}
      {filteredAndSortedActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Activity className="w-12 h-12 mb-3" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
              : "space-y-4"
          )}
        >
          {filteredAndSortedActivities.map((activity) => (
            <ActivityCardV2
              key={activity.id}
              activity={activity}
              variant={viewMode}
              showUser={showUserOnCards}
            />
          ))}
        </div>
      )}
    </div>
  )
}
