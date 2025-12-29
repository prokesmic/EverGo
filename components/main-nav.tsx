"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useSession, signOut } from "next-auth/react"
import { Home, Trophy, Users, Calendar, Target, PlusCircle, Bell, Search, Sparkles, Menu, Settings, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchCommand } from "@/components/search-command"

export function MainNav() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)

    // Hide main nav on landing page - it has its own header
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
        <header data-testid="desktop-nav" className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 hidden lg:block">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/home" className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-slate-900">
                            ⚡EverGo
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700">
                            Aurora
                        </span>
                    </Link>
                </div>

                {/* Centered Navigation - always visible on lg+ */}
                <nav className="flex items-center gap-8 text-sm font-medium">
                    {navItems.map((item) => {
                        const isActive = pathname?.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative transition-colors text-slate-600 hover:text-slate-900",
                                    isActive && "text-slate-900"
                                )}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 rounded-full" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <SearchCommand />

                    {session ? (
                        <div className="flex items-center gap-2">
                            {/* Log Activity Button */}
                            <Link
                                href="/activity/create"
                                data-testid="desktop-log-activity"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Log Activity</span>
                            </Link>

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-full relative" asChild>
                                <Link href="/notifications">
                                    <Bell className="h-5 w-5" />
                                </Link>
                            </Button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-slate-200 p-0 overflow-hidden hover:border-indigo-300 transition-all">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                                                {session.user?.name?.[0]?.toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/${session.user?.username || 'me'}`}>
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 focus:text-red-600">
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <button className="text-sm font-medium text-slate-700 hover:text-slate-900">
                                <Link href="/login">Log in</Link>
                            </button>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition"
                            >
                                <Sparkles className="w-4 h-4" />
                                Sign Up Free
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
