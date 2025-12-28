"use client"

import { useMemo, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { format, isSameDay, startOfMonth, endOfMonth } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarItem } from "@/lib/calendar/types"
import { getAccentClasses, getSportAccent } from "@/lib/calendar/types"
import Link from "next/link"
import { Activity, CalendarDays, Trophy, Clock, ChevronRight } from "lucide-react"

interface CalendarMonthProps {
  items: CalendarItem[]
  selectedDate: Date
  onDateSelect: (date: Date | undefined) => void
}

function getItemLink(item: CalendarItem) {
  switch (item.type) {
    case "activity":
      return `/activity/${item.id}`
    case "event":
      return `/events/${item.id}`
    case "challenge":
      return `/challenges/${item.id}`
  }
}

function getTypeIcon(type: CalendarItem["type"]) {
  switch (type) {
    case "activity":
      return <Activity className="h-4 w-4" />
    case "event":
      return <CalendarDays className="h-4 w-4" />
    case "challenge":
      return <Trophy className="h-4 w-4" />
  }
}

export function CalendarMonth({ items, selectedDate, onDateSelect }: CalendarMonthProps) {
  // Get items for selected date
  const selectedDateItems = useMemo(() => {
    return items.filter((item) =>
      isSameDay(new Date(item.startAt), selectedDate)
    )
  }, [items, selectedDate])

  // Create a map of dates that have items
  const datesWithItems = useMemo(() => {
    const dates = new Set<string>()
    items.forEach((item) => {
      dates.add(format(new Date(item.startAt), "yyyy-MM-dd"))
    })
    return dates
  }, [items])

  // Custom day renderer to show dots
  const modifiers = useMemo(() => {
    return {
      hasItems: (date: Date) => datesWithItems.has(format(date, "yyyy-MM-dd")),
    }
  }, [datesWithItems])

  const modifiersClassNames = {
    hasItems: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-orange-500 after:rounded-full",
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          defaultMonth={selectedDate}
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
          className="w-full"
          classNames={{
            months: "flex flex-col",
            month: "space-y-4 w-full",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md flex-1 font-medium text-sm",
            row: "flex w-full mt-2",
            cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent rounded-md",
            day: "h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
            day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white",
            day_today: "bg-orange-100 text-orange-900",
          }}
        />
      </div>

      {/* Selected day's items */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedDateItems.length} item{selectedDateItems.length !== 1 ? "s" : ""}
          </p>
        </div>

        {selectedDateItems.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarDays className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-muted-foreground">No items on this day</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {selectedDateItems.map((item) => {
              const accent = item.accent || getSportAccent(item.sportSlug)
              const accentClasses = getAccentClasses(accent)

              return (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={getItemLink(item)}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className={cn("p-2 rounded-lg", accentClasses.bg, accentClasses.text)}>
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.sportName && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", accentClasses.bg, accentClasses.text)}>
                          {item.sportName}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(item.startAt), "h:mm a")}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
