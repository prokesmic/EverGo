"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Swords, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function MobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  // Hide mobile nav on landing page
  if (pathname === "/") {
    return null
  }

  // V6 Mobile bottom nav - Competition-first: Home, Rankings, Gauntlets, Profile
  const navItems = [
    { href: "/home", label: "Home", icon: Home, testId: "nav-home" },
    { href: "/rankings", label: "Rankings", icon: Trophy, testId: "nav-rankings" },
    { href: "/gauntlets", label: "Gauntlets", icon: Swords, testId: "nav-gauntlets" },
    { href: `/profile/${session?.user?.username || 'me'}`, label: "Profile", icon: User, testId: "nav-profile" },
  ]

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home"
    if (href.startsWith("/profile")) return pathname?.startsWith("/profile")
    if (href === "/gauntlets") return pathname?.startsWith("/gauntlets")
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Floating Action Button for Record Activity */}
      <Link
        href="/activity/create"
        data-testid="fab-log-activity"
        className="fixed bottom-20 right-4 z-50 lg:hidden w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground active:scale-95 transition-transform"
        style={{
          boxShadow: "0 4px 14px hsl(var(--primary) / 0.4)",
        }}
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </Link>

      {/* Bottom Navigation */}
      <nav
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden pb-safe"
      >
        <div className="grid h-16 grid-cols-4 max-w-lg mx-auto">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all active:scale-95",
                  active
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-all",
                    active && "bg-primary/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-all",
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
