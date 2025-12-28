import { Metadata } from "next"
import { startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { CalendarShell } from "@/components/calendar/CalendarShell"
import { getCalendarItems, getUserSports } from "@/lib/calendar/getCalendarItems"

export const metadata: Metadata = {
  title: "Calendar | EverGo",
  description: "View and manage your training schedule, activities, and events",
}

export default async function CalendarPage() {
  // Fetch initial data for a 3-month range (prev month, current, next month)
  const today = new Date()
  const from = startOfMonth(subMonths(today, 1))
  const to = endOfMonth(addMonths(today, 1))

  const [items, sports] = await Promise.all([
    getCalendarItems(from, to),
    getUserSports(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <CalendarShell initialItems={items} initialSports={sports} />
    </div>
  )
}
