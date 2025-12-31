"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/home", label: "Home" },
  { href: "/rankings", label: "Rankings" },
  { href: "/sports", label: "Sports" },
  { href: "/challenges", label: "Challenges" },
  { href: "/teams", label: "Teams" },
]

export function MobileTopTabs() {
  const pathname = usePathname()

  // Don't show on landing page or auth pages
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/onboarding"
  ) {
    return null
  }

  return (
    <div className="lg:hidden sticky top-14 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur-sm">
      <div className="px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {TABS.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(t.href + "/")
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  active
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )}
              >
                {t.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
