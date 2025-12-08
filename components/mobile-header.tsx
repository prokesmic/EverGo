"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Search, Bell, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { MobileSearch } from "@/components/mobile-search"

export function MobileHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [showSearch, setShowSearch] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Fetch unread notifications count
    const fetchNotifications = async () => {
      if (session?.user) {
        try {
          const res = await fetch("/api/notifications?unread=true&limit=1")
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border-light lg:hidden pt-safe">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg text-text-primary">EverGo</span>
          </Link>

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
                href={`/profile/${session.user?.username || 'me'}`}
                className="relative"
              >
                <Avatar className="w-9 h-9 border-2 border-brand-blue">
                  <AvatarImage src={session.user?.image || undefined} />
                  <AvatarFallback className="bg-brand-blue text-white text-sm font-semibold">
                    {session.user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 flex items-center gap-0.5 border-2 border-white">
                    <Flame className="w-2.5 h-2.5" />
                    {streak}
                  </div>
                )}
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-brand-blue text-white hover:bg-brand-blue-dark">
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
