"use client"

/**
 * V6 Floating Action Button
 *
 * Mobile floating action button for quick activity logging
 * Shows on mobile only, positioned above the bottom nav
 */

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PlusCircle, X, Activity, Swords, Trophy } from "lucide-react"

interface QuickAction {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const quickActions: QuickAction[] = [
  {
    label: "Log Activity",
    href: "/activity/create",
    icon: Activity,
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    label: "Throw Gauntlet",
    href: "/gauntlets/new",
    icon: Swords,
    color: "bg-violet-500 hover:bg-violet-600",
  },
  {
    label: "Rankings",
    href: "/rankings",
    icon: Trophy,
    color: "bg-amber-500 hover:bg-amber-600",
  },
]

export function FloatingActionButton() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Don't show on landing page, login, register, or activity create page
  const hiddenPaths = ["/", "/login", "/register", "/activity/create", "/gauntlets/new"]
  if (hiddenPaths.some((path) => pathname === path || pathname?.startsWith("/activity/create"))) {
    return null
  }

  // Don't show if not logged in
  if (!session) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      {/* Quick Actions Menu */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-200",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.href}
              href={action.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-full text-white shadow-lg transition-all",
                "animate-in slide-in-from-right-4 fade-in duration-200",
                action.color
              )}
            >
              <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              <Icon className="w-5 h-5" />
            </Link>
          )
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center",
          isOpen
            ? "bg-slate-800 rotate-45"
            : "bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400"
        )}
        aria-label={isOpen ? "Close menu" : "Open quick actions"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <PlusCircle className="w-7 h-7 text-white" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
