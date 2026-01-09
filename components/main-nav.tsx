"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { useSession, signOut } from "next-auth/react"
import { Home, Trophy, Users, Calendar, Swords, Bell, Sparkles, ChevronDown, Settings, Plus, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchCommand } from "@/components/search-command"

// V6 Navigation configuration - Competition-first hierarchy
const primaryLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/rankings", label: "Rankings", icon: Trophy },
    { href: "/gauntlets", label: "Gauntlets", icon: Swords },
    { href: "/seasons", label: "Seasons", icon: Calendar },
]

const moreLinks = [
    { href: "/teams", label: "Teams", icon: Users, description: "Join or manage teams" },
    { href: "/settings", label: "Settings", icon: Settings, description: "Account preferences" },
]

// Get all hrefs for dropdown to check active state
const moreHrefs = moreLinks.map(l => l.href)

export function MainNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

    // Hide main nav on landing page - it has its own header
    if (pathname === "/") {
        return null
    }

    const isActive = (href: string) => pathname?.startsWith(href)
    const isDropdownActive = (hrefs: string[]) => hrefs.some(href => pathname?.startsWith(href))

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

                {/* Centered Navigation - V6 Competition-first */}
                <nav className="flex items-center gap-1 text-sm font-medium">
                    {/* Primary Links */}
                    {primaryLinks.map((item) => {
                        const active = isActive(item.href)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors",
                                    active
                                        ? "bg-slate-100 text-slate-900"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}

                    {/* More Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    "relative flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:outline-none",
                                    isDropdownActive(moreHrefs) && "bg-slate-100 text-slate-900"
                                )}
                            >
                                More
                                <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                            {moreLinks.map((item) => {
                                const Icon = item.icon
                                return (
                                    <DropdownMenuItem key={item.href} asChild>
                                        <Link href={item.href} className={cn(
                                            "flex items-center gap-3 cursor-pointer py-2",
                                            isActive(item.href) && "bg-slate-100"
                                        )}>
                                            <Icon className="h-4 w-4 text-slate-500" />
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-xs text-slate-500">{item.description}</div>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                )
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Primary CTA - Throw Gauntlet */}
                    {session && (
                        <Link href="/gauntlets/new" className="ml-2">
                            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-4">
                                <Swords className="h-4 w-4" />
                                <span className="hidden xl:inline">Throw Gauntlet</span>
                            </Button>
                        </Link>
                    )}
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
