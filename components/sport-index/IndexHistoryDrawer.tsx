"use client"

import { useState, useEffect } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  Download,
  Swords,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

type IndexEvent = {
  id: string
  type: string
  title: string
  sportSlug: string
  prevValue: number | null
  newValue: number | null
  deltaValue: number | null
  createdAt: string
  detailJson: Record<string, unknown> | null
}

type IndexHistoryDrawerProps = {
  sportSlug: string
  sportName: string
  currentValue?: number
  children?: React.ReactNode
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  ACTIVITY_ADDED: <Activity className="h-4 w-4 text-green-500" />,
  ACTIVITY_EDITED: <Edit className="h-4 w-4 text-blue-500" />,
  ACTIVITY_DELETED: <Trash2 className="h-4 w-4 text-red-500" />,
  ACTIVITY_IMPORTED: <Download className="h-4 w-4 text-purple-500" />,
  PERSONAL_BEST_ADDED: <Trophy className="h-4 w-4 text-yellow-500" />,
  PERSONAL_BEST_UPDATED: <Trophy className="h-4 w-4 text-yellow-500" />,
  RIVALRY_SCORE_CHANGED: <Swords className="h-4 w-4 text-orange-500" />,
  RIVALRY_COMPLETED: <Swords className="h-4 w-4 text-orange-500" />,
  DECAY_APPLIED: <Clock className="h-4 w-4 text-slate-400" />,
  VERIFICATION_UPGRADED: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
  ANOMALY_FLAGGED: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  ADMIN_ADJUSTMENT: <CheckCircle className="h-4 w-4 text-slate-500" />,
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta == null || delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
        <Minus className="h-3 w-3" />
        <span>0</span>
      </span>
    )
  }

  const isPositive = delta > 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isPositive ? "text-green-600" : "text-red-500"
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>
        {isPositive ? "+" : ""}
        {delta.toFixed(1)}
      </span>
    </span>
  )
}

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function IndexHistoryDrawer({
  sportSlug,
  sportName,
  currentValue,
  children,
}: IndexHistoryDrawerProps) {
  const [events, setEvents] = useState<IndexEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && events.length === 0) {
      fetchEvents()
    }
  }, [open])

  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sport-index/events?sportSlug=${sportSlug}`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events ?? [])
      }
    } catch (err) {
      console.error("Failed to fetch index events:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children ?? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-500 hover:text-slate-700"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-xs">Why?</span>
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-slate-100">
          <DrawerTitle className="flex items-center justify-between">
            <span>{sportName} Index History</span>
            {currentValue != null && (
              <span className="text-lg font-bold text-orange-600">
                {currentValue.toFixed(1)}
              </span>
            )}
          </DrawerTitle>
          <p className="text-sm text-slate-500">
            See what changed your Sport Index score
          </p>
        </DrawerHeader>

        <ScrollArea className="h-[60vh] px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-10 w-10 text-slate-200" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No history yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Log activities to see how your index changes
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />

              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="relative pl-9">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white border border-slate-200">
                      {EVENT_ICONS[event.type] ?? (
                        <Activity className="h-4 w-4 text-slate-400" />
                      )}
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatTimeAgo(event.createdAt)}
                          </p>
                        </div>
                        <DeltaBadge delta={event.deltaValue} />
                      </div>

                      {/* Show before/after if available */}
                      {event.prevValue != null && event.newValue != null && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span>{event.prevValue.toFixed(1)}</span>
                          <span className="text-slate-300">→</span>
                          <span className="font-medium text-slate-700">
                            {event.newValue.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
