"use client"

import { useMemo } from "react"
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns"
import { cn } from "@/lib/utils"
import type { CalendarItem } from "@/lib/calendar/types"
import { getAccentClasses, getSportAccent } from "@/lib/calendar/types"
import Link from "next/link"
import { Activity, CalendarDays, Trophy } from "lucide-react"

interface CalendarWeekProps {
  items: CalendarItem[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
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
      return <Activity className="h-3 w-3" />
    case "event":
      return <CalendarDays className="h-3 w-3" />
    case "challenge":
      return <Trophy className="h-3 w-3" />
  }
}

export function CalendarWeek({ items, selectedDate, onDateSelect }: CalendarWeekProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday start

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    weekDays.forEach((day) => {
      map.set(format(day, "yyyy-MM-dd"), [])
    })

    items.forEach((item) => {
      const itemDate = format(new Date(item.startAt), "yyyy-MM-dd")
      const existing = map.get(itemDate) || []
      map.set(itemDate, [...existing, item])
    })

    return map
  }, [items, weekDays])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => onDateSelect(day)}
            className={cn(
              "py-3 px-2 text-center border-r border-gray-100 last:border-r-0 transition-colors",
              isToday(day) && "bg-orange-50",
              isSameDay(day, selectedDate) && "bg-orange-100"
            )}
          >
            <div className="text-xs text-muted-foreground font-medium uppercase">
              {format(day, "EEE")}
            </div>
            <div
              className={cn(
                "text-lg font-semibold mt-1",
                isToday(day) ? "text-orange-600" : "text-gray-900"
              )}
            >
              {format(day, "d")}
            </div>
          </button>
        ))}
      </div>

      {/* Week content */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd")
          const dayItems = itemsByDay.get(dateKey) || []

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 border-r border-gray-100 last:border-r-0 min-h-[120px]",
                isToday(day) && "bg-orange-50/30"
              )}
            >
              <div className="space-y-1.5">
                {dayItems.slice(0, 4).map((item) => {
                  const accent = item.accent || getSportAccent(item.sportSlug)
                  const accentClasses = getAccentClasses(accent)

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={getItemLink(item)}
                      className={cn(
                        "block p-1.5 rounded-lg text-[10px] font-medium truncate transition-all hover:scale-[1.02]",
                        accentClasses.bg,
                        accentClasses.text,
                        "border",
                        accentClasses.border
                      )}
                      title={item.title}
                    >
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        {format(new Date(item.startAt), "h:mm a")}
                      </div>
                    </Link>
                  )
                })}
                {dayItems.length > 4 && (
                  <div className="text-[10px] text-muted-foreground text-center py-1">
                    +{dayItems.length - 4} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
