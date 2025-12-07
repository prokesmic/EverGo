"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Target, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/leaderboard", label: "Rankings", icon: Trophy },
    { href: "/challenges", label: "Challenges", icon: Target },
    { href: session ? `/profile/${session.user?.username || 'me'}` : "/profile", label: "Profile", icon: User },
  ]

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home" || pathname === "/"
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Floating Action Button for Record Activity */}
      <Link
        href="/activity/new"
        className="fixed bottom-20 right-4 z-50 lg:hidden w-14 h-14 bg-gradient-to-r from-brand-blue to-blue-600 rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
        style={{
          boxShadow: "0 4px 14px rgba(0, 120, 212, 0.4)",
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </Link>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light lg:hidden pb-safe">
        <div className="grid h-16 grid-cols-4 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all active:scale-95",
                  active
                    ? "text-brand-blue"
                    : "text-text-muted"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-8 rounded-full transition-all",
                    active && "bg-brand-blue/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-all",
                      active && "scale-110"
                    )}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={cn(active && "font-semibold")}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
