"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, ChevronRight, Clock, MapPin, Plus } from "lucide-react"
import { CardShell } from "@/components/ui/CardShell"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface CalendarEvent {
    id: string
    title: string
    date: Date
    time: string
    sport: string
    location?: string
}

export function CalendarWidget() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/events/upcoming")
                if (res.ok) {
                    const data = await res.json()
                    setEvents(data.events || [])
                }
            } catch (error) {
                console.error("Error fetching events:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    const getSportColor = (sport: string) => {
        const colors: Record<string, string> = {
            running: "bg-emerald-100 text-emerald-700",
            cycling: "bg-yellow-100 text-yellow-700",
            swimming: "bg-cyan-100 text-cyan-700",
            football: "bg-green-100 text-green-700",
            tennis: "bg-lime-100 text-lime-700",
            fitness: "bg-purple-100 text-purple-700",
        }
        return colors[sport.toLowerCase()] || "bg-slate-100 text-slate-700"
    }

    if (loading) {
        return (
            <CardShell
                title="Upcoming Events"
                icon={<CalendarIcon className="h-5 w-5" />}
            >
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 items-center p-2.5 animate-pulse">
                            <div className="w-12 h-14 bg-slate-200 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardShell>
        )
    }

    return (
        <CardShell
            title="Upcoming Events"
            icon={<CalendarIcon className="h-5 w-5" />}
            action={<Link href="/calendar" className="flex items-center text-primary hover:underline">View all <ChevronRight className="h-3 w-3 ml-1" /></Link>}
        >
            <div className="space-y-2">
                {events.slice(0, 3).map((event) => (
                    <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex gap-3 items-center p-2.5 rounded-xl hover:bg-muted/80 transition-all duration-200 cursor-pointer group"
                    >
                        <div className="w-12 text-center bg-muted rounded-xl p-1.5 border border-border group-hover:border-border/80 group-hover:bg-background transition-colors shrink-0">
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                {format(new Date(event.date), "MMM")}
                            </div>
                            <div className="text-lg font-bold text-foreground leading-none mt-0.5">
                                {format(new Date(event.date), "dd")}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{event.title}</div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className={cn("sport-chip text-[10px]", getSportColor(event.sport))}>
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
                    <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No upcoming events</p>
                        <p className="text-xs text-slate-400 mt-1">Find races, group rides, or training sessions</p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Link
                                href="/calendar"
                                className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                            >
                                Browse Events
                                <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </CardShell>
    )
}
