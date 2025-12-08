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
import { Home, Trophy, Users, Calendar, Target, PlusCircle, Bell, Search, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchCommand } from "@/components/search-command"

export function MainNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

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
        <header className="bg-gradient-to-r from-[#0078D4] to-[#005A9E] text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/home" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <span className="hidden sm:inline">EverGo</span>
                    </Link>
                </div>

                {/* Centered Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname?.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-white/25 text-white shadow-sm"
                                        : "text-white/80 hover:bg-white/15 hover:text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="hidden lg:flex">
                        <SearchCommand />
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 rounded-full">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>

                    {session ? (
                        <div className="flex items-center gap-1">
                            {/* Log Activity Button */}
                            <Button
                                asChild
                                size="sm"
                                className="hidden sm:flex bg-white/20 hover:bg-white/30 text-white border-0 gap-1.5 font-medium"
                            >
                                <Link href="/activity/create">
                                    <PlusCircle className="h-4 w-4" />
                                    <span className="hidden md:inline">Log Activity</span>
                                </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="sm:hidden text-white hover:bg-white/10 rounded-full" asChild>
                                <Link href="/activity/create">
                                    <PlusCircle className="h-5 w-5" />
                                </Link>
                            </Button>

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full relative" asChild>
                                <Link href="/notifications">
                                    <Bell className="h-5 w-5" />
                                    {/* Notification dot - uncomment when you have unread count */}
                                    {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /> */}
                                </Link>
                            </Button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-white/30 p-0 overflow-hidden hover:border-white/60 transition-all ml-1">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                            <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
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
                                        <Link href={`/profile/${session.user?.username || session.user?.name?.toLowerCase().replace(/\s+/g, '') || 'me'}`}>
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
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="bg-white text-primary hover:bg-white/90 font-semibold shadow-md">
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
