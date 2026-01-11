"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Search, Bell, Flame, Menu, Home, Trophy, Target, Users, Calendar, PlusCircle, Settings, LogOut, User, Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { MobileSearch } from "@/components/mobile-search"
import { cn } from "@/lib/utils"
import { getMyProfileHref, getSettingsHref } from "@/lib/routes/user"

export function MobileHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showSearch, setShowSearch] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Fetch unread notifications count
    const fetchNotifications = async () => {
      if (session?.user) {
        try {
          const res = await fetch("/api/notifications?unreadOnly=true&limit=1")
          const data = await res.json()
          setUnreadCount(data.unreadCount || 0)
        } catch (e) {
          // Ignore errors
        }
      }
    }

    // Fetch user streak
    const fetchStreak = async () => {
      if (session?.user) {
        try {
          const res = await fetch("/api/me/streak")
          const data = await res.json()
          setStreak(data.currentStreak || 0)
        } catch (e) {
          // Ignore errors
        }
      }
    }

    fetchNotifications()
    fetchStreak()
  }, [session])

  // Hide mobile header on landing page
  if (pathname === "/") {
    return null
  }

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/rankings", label: "Rankings", icon: Trophy },
    { href: "/challenges", label: "Challenges", icon: Target },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/calendar", label: "Events", icon: Calendar },
  ]

  return (
    <>
      <header data-testid="mobile-header" className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border-light lg:hidden pt-safe">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Hamburger Menu + Logo */}
          <div className="flex items-center gap-2">
            {/* Hamburger Menu */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="mobile-menu-trigger"
                  className="w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="border-b p-4">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-bold text-lg">EverGo</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
                      Aurora
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="p-4">
                  {/* Navigation Links */}
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = pathname?.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Log Activity CTA */}
                  <div className="mt-6 pt-4 border-t">
                    <Link href="/activity/create" onClick={() => setMenuOpen(false)}>
                      <Button className="w-full gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Log Activity
                      </Button>
                    </Link>
                  </div>

                  {/* User Section */}
                  {session?.user && (
                    <div className="mt-6 pt-4 border-t space-y-1">
                      <Link
                        href={getMyProfileHref(session.user)}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <User className="w-5 h-5" />
                        Profile
                      </Link>
                      <Link
                        href={getSettingsHref()}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="w-5 h-5" />
                        Edit Profile
                      </Link>
                      <Link
                        href="/notifications/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          signOut({ callbackUrl: "/" })
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        Log out
                      </button>
                    </div>
                  )}

                  {/* Login/Register for unauthenticated */}
                  {!session?.user && (
                    <div className="mt-6 pt-4 border-t space-y-2">
                      <Link href="/login" onClick={() => setMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setMenuOpen(false)}>
                        <Button className="w-full">
                          Sign Up Free
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-lg text-text-primary">EverGo</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-secondary relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Profile with Streak */}
            {session?.user ? (
              <Link
                href={getMyProfileHref(session.user)}
                className="relative"
              >
                <Avatar className="w-9 h-9 border-2 border-primary">
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {session.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5 border-2 border-background">
                    <Flame className="w-2.5 h-2.5" />
                    {streak}
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <MobileSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </>
  )
}
