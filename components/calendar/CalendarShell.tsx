"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, subDays } from "date-fns"
import type { CalendarItem, CalendarView, CalendarItemType } from "@/lib/calendar/types"
import { CalendarHeader } from "./CalendarHeader"
import { CalendarSidebar } from "./CalendarSidebar"
import { CalendarAgenda } from "./CalendarAgenda"
import { CalendarWeek } from "./CalendarWeek"
import { CalendarMonth } from "./CalendarMonth"
import { CalendarCreateDrawer } from "./CalendarCreateDrawer"

interface CalendarShellProps {
  initialItems: CalendarItem[]
  initialSports: { id: string; name: string; slug: string }[]
}

export function CalendarShell({ initialItems, initialSports }: CalendarShellProps) {
  const router = useRouter()

  // Core state
  const [view, setView] = useState<CalendarView>("agenda")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)

  // Filter state
  const [typeFilters, setTypeFilters] = useState<CalendarItemType[]>([
    "activity",
    "event",
    "challenge",
  ])
  const [sportFilters, setSportFilters] = useState<string[]>([])

  // Items state (could be refreshed via SWR/React Query in future)
  const [items] = useState<CalendarItem[]>(initialItems)

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (!typeFilters.includes(item.type)) {
        return false
      }

      // Sport filter (if any selected, only show matching; empty = show all)
      if (sportFilters.length > 0 && item.sportSlug) {
        if (!sportFilters.includes(item.sportSlug)) {
          return false
        }
      }

      return true
    })
  }, [items, typeFilters, sportFilters])

  // Get items for the current view's date range
  const viewItems = useMemo(() => {
    // For agenda view, show upcoming items (sorted by date)
    if (view === "agenda") {
      return [...filteredItems].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      )
    }

    // For week/month, filter to visible range
    let rangeStart: Date
    let rangeEnd: Date

    if (view === "week") {
      rangeStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
      rangeEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    } else {
      rangeStart = startOfMonth(selectedDate)
      rangeEnd = endOfMonth(selectedDate)
    }

    return filteredItems.filter((item) => {
      const itemDate = new Date(item.startAt)
      return itemDate >= rangeStart && itemDate <= rangeEnd
    })
  }, [filteredItems, view, selectedDate])

  // Handlers
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }, [])

  const handleToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  const handleLogActivity = useCallback(() => {
    router.push("/activity/new")
  }, [router])

  const handleBrowseEvents = useCallback(() => {
    // Open the create drawer for adding events/activities
    setCreateDrawerOpen(true)
  }, [])

  // Render the appropriate view
  const renderView = () => {
    switch (view) {
      case "agenda":
        return (
          <CalendarAgenda
            items={viewItems}
            selectedDate={selectedDate}
            onLogActivity={handleLogActivity}
            onBrowseEvents={handleBrowseEvents}
          />
        )
      case "week":
        return (
          <CalendarWeek
            items={viewItems}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        )
      case "month":
        return (
          <CalendarMonth
            items={viewItems}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        )
    }
  }

  return (
    <div data-testid="calendar-page" className="space-y-6">
      {/* Aurora Header */}
      <CalendarHeader
        selectedDate={selectedDate}
        view={view}
        onViewChange={setView}
        onDateChange={setSelectedDate}
        onToday={handleToday}
        onAddClick={() => setCreateDrawerOpen(true)}
      />

      {/* Main content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - filters (hidden on mobile, show via sheet) */}
        <div className="hidden lg:block lg:col-span-3">
          <CalendarSidebar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            typeFilters={typeFilters}
            onTypeFilterChange={setTypeFilters}
            sportFilters={sportFilters}
            onSportFilterChange={setSportFilters}
            availableSports={initialSports}
          />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-9">{renderView()}</div>
      </div>

      {/* Create drawer */}
      <CalendarCreateDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
      />
    </div>
  )
}
