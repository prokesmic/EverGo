"use client"

import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function CalendarWidget() {
    const events = [
        { id: 1, title: "Prague Marathon", date: "28", month: "DEC", time: "09:00", sport: "Running", color: "bg-sport-running/10 text-sport-running", location: "Old Town Square" },
        { id: 2, title: "Team Training", date: "30", month: "DEC", time: "18:00", sport: "Football", color: "bg-sport-football/10 text-sport-football", location: "Sports Club" },
        { id: 3, title: "Sunday Ride", date: "05", month: "JAN", time: "10:00", sport: "Cycling", color: "bg-sport-cycling/10 text-sport-cycling", location: "Letna Park" },
    ]

    return (
        <CardShell
            title="Upcoming Events"
            icon={<CalendarIcon className="h-5 w-5" />}
            action={<Link href="/calendar" className="flex items-center text-primary hover:underline">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            <div className="space-y-2">
                {events.map((event) => (
                    <Link
                        key={event.id}
                        href={`/calendar?event=${event.id}`}
                        className="flex gap-3 items-center p-2.5 rounded-xl hover:bg-muted/80 transition-all duration-200 cursor-pointer group"
                    >
                        <div className="w-12 text-center bg-muted rounded-xl p-1.5 border border-border group-hover:border-border/80 group-hover:bg-background transition-colors shrink-0">
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{event.month}</div>
                            <div className="text-lg font-bold text-foreground leading-none mt-0.5">{event.date}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{event.title}</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={cn("sport-chip text-[10px]", event.color)}>
                                    {event.sport}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {event.time}
                                </span>
                                {event.location && (
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[80px]">{event.location}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No upcoming events</p>
                        <Link href="/calendar" className="text-xs text-primary hover:underline mt-1 inline-block">
                            Browse events
                        </Link>
                    </div>
                )}
            </div>
        </CardShell>
    )
}
