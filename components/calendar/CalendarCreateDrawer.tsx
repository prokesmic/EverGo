"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, CalendarDays, Trophy, X, ChevronRight, Dumbbell, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface CalendarCreateDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CreateOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  iconBg: string
  href: string
}

const createOptions: CreateOption[] = [
  {
    id: "activity",
    title: "Log Activity",
    description: "Record a completed workout or training session",
    icon: <Activity className="h-5 w-5" />,
    iconBg: "bg-emerald-100 text-emerald-600",
    href: "/activity/new",
  },
  {
    id: "workout",
    title: "Plan Workout",
    description: "Schedule a future training session",
    icon: <Dumbbell className="h-5 w-5" />,
    iconBg: "bg-sky-100 text-sky-600",
    href: "/activity/new?scheduled=true",
  },
  {
    id: "event",
    title: "Create Event",
    description: "Organize a group activity or social sports event",
    icon: <Users className="h-5 w-5" />,
    iconBg: "bg-violet-100 text-violet-600",
    href: "/events/new",
  },
  {
    id: "challenge",
    title: "Start Challenge",
    description: "Create a personal or team fitness challenge",
    icon: <Trophy className="h-5 w-5" />,
    iconBg: "bg-orange-100 text-orange-600",
    href: "/challenges/new",
  },
]

export function CalendarCreateDrawer({ open, onOpenChange }: CalendarCreateDrawerProps) {
  const router = useRouter()
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const handleOptionClick = (option: CreateOption) => {
    onOpenChange(false)
    router.push(option.href)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 border-l border-gray-100"
        data-testid="calendar-create-drawer"
      >
        {/* Header with gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 p-6">
          {/* Noise overlay */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

          <SheetHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <SheetTitle className="text-xl font-bold text-white">
                  Add to Calendar
                </SheetTitle>
              </div>
            </div>
            <p className="text-sm text-white/80 mt-2">
              What would you like to add?
            </p>
          </SheetHeader>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {createOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              data-testid={`calendar-create-${option.id}`}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200",
                "border border-transparent",
                "hover:bg-gray-50 hover:border-gray-100 hover:shadow-sm",
                hoveredOption === option.id && "scale-[1.01]"
              )}
            >
              {/* Icon */}
              <div className={cn("p-3 rounded-xl", option.iconBg)}>
                {option.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{option.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={cn(
                  "h-5 w-5 text-gray-300 transition-all duration-200",
                  hoveredOption === option.id && "text-orange-500 translate-x-1"
                )}
              />
            </button>
          ))}
        </div>

        {/* Quick tip */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Connect Strava or Garmin to auto-sync your activities
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
