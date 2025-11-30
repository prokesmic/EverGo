import { Calendar as CalendarIcon, ChevronRight, Clock } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function CalendarWidget() {
    const events = [
        { id: 1, title: "Prague Marathon", date: "28", month: "SEP", time: "09:00", sport: "Running", color: "bg-brand-green/10 text-brand-green" },
        { id: 2, title: "Team Training", date: "05", month: "OCT", time: "18:00", sport: "Football", color: "bg-green-600/10 text-green-700" },
        { id: 3, title: "Sunday Ride", date: "08", month: "OCT", time: "10:00", sport: "Cycling", color: "bg-yellow-500/10 text-yellow-600" },
    ]

    return (
        <CardShell
            title="Upcoming Events"
            icon={<CalendarIcon className="h-5 w-5" />}
            action={<Link href="/calendar" className="flex items-center">Open calendar <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            <div className="space-y-3">
                {events.map((event) => (
                    <div key={event.id} className="flex gap-4 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="w-12 text-center bg-gray-50 rounded-lg p-1.5 border border-gray-100 group-hover:border-gray-200 group-hover:bg-white transition-colors">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{event.month}</div>
                            <div className="text-lg font-bold text-gray-900 leading-none mt-0.5">{event.date}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{event.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide", event.color)}>
                                    {event.sport}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {event.time}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardShell>
    )
}
