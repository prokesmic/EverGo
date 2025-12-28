"use client"

import { ChevronLeft, ChevronRight, Plus, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import type { CalendarView } from "@/lib/calendar/types"

interface CalendarHeaderProps {
  selectedDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onDateChange: (date: Date) => void
  onToday: () => void
  onAddClick: () => void
}

export function CalendarHeader({
  selectedDate,
  view,
  onViewChange,
  onDateChange,
  onToday,
  onAddClick,
}: CalendarHeaderProps) {
  const handlePrev = () => {
    const newDate = new Date(selectedDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(selectedDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const getDateLabel = () => {
    if (view === "month") {
      return format(selectedDate, "MMMM yyyy")
    } else if (view === "week") {
      return format(selectedDate, "MMM d, yyyy")
    }
    return format(selectedDate, "EEEE, MMMM d, yyyy")
  }

  return (
    <div
      data-testid="calendar-header"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-6 shadow-lg"
    >
      {/* Aurora noise overlay */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Top row: Title and Add button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Calendar</h1>
              <p className="text-sm text-white/80">Your training + social sports life</p>
            </div>
          </div>

          <Button
            data-testid="calendar-add"
            onClick={onAddClick}
            className="bg-white text-orange-600 hover:bg-white/90 shadow-md font-semibold gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>

        {/* Bottom row: Navigation and View tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={onToday}
              className="text-white hover:bg-white/20 text-sm font-medium px-3"
            >
              Today
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <span className="text-white font-semibold ml-2 text-lg hidden sm:inline">
              {getDateLabel()}
            </span>
          </div>

          {/* Mobile date label */}
          <div className="text-white font-semibold text-center sm:hidden">
            {getDateLabel()}
          </div>

          {/* View tabs */}
          <Tabs value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
            <TabsList className="bg-white/20 backdrop-blur-sm border-0">
              <TabsTrigger
                data-testid="calendar-view-agenda"
                value="agenda"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600 text-white/90"
              >
                Agenda
              </TabsTrigger>
              <TabsTrigger
                data-testid="calendar-view-week"
                value="week"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600 text-white/90"
              >
                Week
              </TabsTrigger>
              <TabsTrigger
                data-testid="calendar-view-month"
                value="month"
                className="data-[state=active]:bg-white data-[state=active]:text-orange-600 text-white/90"
              >
                Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
