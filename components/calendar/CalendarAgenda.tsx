"use client"

import { useMemo } from "react"
import { Activity, CalendarDays, Trophy, Clock, MapPin, ChevronRight, Dumbbell, Link2 } from "lucide-react"
import { format, isToday, isTomorrow, isThisWeek, addDays, startOfDay } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { CalendarItem } from "@/lib/calendar/types"
import { getAccentClasses, getSportAccent } from "@/lib/calendar/types"

interface CalendarAgendaProps {
  items: CalendarItem[]
  selectedDate: Date
  onLogActivity: () => void
  onBrowseEvents: () => void
}

// Group items by date section
function groupByDateSection(items: CalendarItem[]) {
  const today = startOfDay(new Date())
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(today, 7)

  const groups: { title: string; items: CalendarItem[] }[] = [
    { title: "Today", items: [] },
    { title: "Tomorrow", items: [] },
    { title: "This Week", items: [] },
    { title: "Later", items: [] },
  ]

  items.forEach((item) => {
    const itemDate = startOfDay(new Date(item.startAt))

    if (isToday(itemDate)) {
      groups[0].items.push(item)
    } else if (isTomorrow(itemDate)) {
      groups[1].items.push(item)
    } else if (itemDate < weekEnd) {
      groups[2].items.push(item)
    } else {
      groups[3].items.push(item)
    }
  })

  return groups.filter((g) => g.items.length > 0)
}

function CalendarItemRow({ item }: { item: CalendarItem }) {
  const accent = item.accent || getSportAccent(item.sportSlug)
  const accentClasses = getAccentClasses(accent)

  const getTypeIcon = () => {
    switch (item.type) {
      case "activity":
        return <Activity className="h-4 w-4" />
      case "event":
        return <CalendarDays className="h-4 w-4" />
      case "challenge":
        return <Trophy className="h-4 w-4" />
    }
  }

  const getItemLink = () => {
    switch (item.type) {
      case "activity":
        return `/activity/${item.id}`
      case "event":
        return `/events/${item.id}`
      case "challenge":
        return `/challenges/${item.id}`
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const formatDistance = (meters?: number) => {
    if (!meters) return null
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`
    return `${meters}m`
  }

  return (
    <Link
      href={getItemLink()}
      data-testid={`calendar-item-${item.type}-${item.id}`}
      className="flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer group border border-transparent hover:border-gray-100"
    >
      {/* Left: Colored dot + icon */}
      <div className="flex flex-col items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full", accentClasses.dot)} />
        <div className={cn("p-2 rounded-lg", accentClasses.bg, accentClasses.text)}>
          {getTypeIcon()}
        </div>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
          {item.title}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Sport badge */}
          {item.sportName && (
            <span className={cn("sport-chip text-[10px] px-2 py-0.5 rounded-full font-medium", accentClasses.bg, accentClasses.text)}>
              {item.sportName}
            </span>
          )}

          {/* Time */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(item.startAt), "h:mm a")}
          </span>

          {/* Location */}
          {item.locationName && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[100px]">{item.locationName}</span>
            </span>
          )}
        </div>

        {/* Activity metrics */}
        {item.type === "activity" && (item.meta?.durationSeconds || item.meta?.distanceMeters) && (
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {item.meta.durationSeconds && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(item.meta.durationSeconds)}
              </span>
            )}
            {item.meta.distanceMeters && (
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3" />
                {formatDistance(item.meta.distanceMeters)}
              </span>
            )}
          </div>
        )}

        {/* Challenge progress */}
        {item.type === "challenge" && item.meta?.targetValue && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>
                {item.meta.progress?.toFixed(0) || 0} / {item.meta.targetValue} {item.meta.targetUnit}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", accentClasses.dot)}
                style={{ width: `${Math.min(100, ((item.meta.progress || 0) / item.meta.targetValue) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right: View CTA */}
      <div className="flex items-center text-muted-foreground group-hover:text-orange-500 transition-colors">
        <ChevronRight className="h-5 w-5" />
      </div>
    </Link>
  )
}

export function CalendarAgenda({ items, selectedDate, onLogActivity, onBrowseEvents }: CalendarAgendaProps) {
  const groupedItems = useMemo(() => groupByDateSection(items), [items])

  if (items.length === 0) {
    return (
      <div
        data-testid="calendar-agenda"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
          <CalendarDays className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No items scheduled</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Start building your training schedule by logging activities or joining events.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLogActivity}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
          >
            <Activity className="h-4 w-4" />
            Log Activity
          </button>
          <button
            onClick={onBrowseEvents}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <CalendarDays className="h-4 w-4" />
            Browse Events
          </button>
          <Link
            href="/settings/integrations"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-500 rounded-xl font-medium text-sm hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Connect Strava/Garmin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="calendar-agenda" className="space-y-4">
      {groupedItems.map((group) => (
        <div key={group.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
          {/* Section header */}
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">{group.title}</h3>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-50">
            {group.items.map((item) => (
              <CalendarItemRow key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
