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
import { Home, Trophy, Users, PlusSquare, Search, Bell, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function MainNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/rankings", label: "Rankings", icon: Trophy },
        { href: "/teams", label: "Teams", icon: Users },
    ]

    return (
        <header className="bg-gradient-to-r from-[#0078D4] to-[#005A9E] text-white shadow-md sticky top-0 z-50">
            <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <span className="text-2xl">⚡</span>
                        EverGo
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
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "text-white/80 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="hidden md:flex relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/60" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-black/20 border-none rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 w-64 transition-all"
                        />
                    </div>

                    {session ? (
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" asChild>
                                <Link href="/activity/create">
                                    <PlusSquare className="h-5 w-5" />
                                    <span className="sr-only">New Activity</span>
                                </Link>
                            </Button>

                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                                <Bell className="h-5 w-5" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-white/20 p-0 overflow-hidden hover:border-white/50 transition-colors">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                            <AvatarFallback className="bg-brand-blue-dark text-white">
                                                {session.user?.name?.[0] || "U"}
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
                                        <Link href={`/profile/${session.user?.name?.toLowerCase().replace(/\s+/g, '') || 'me'}`}>Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()}>
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
                            <Button asChild className="bg-white text-brand-blue hover:bg-white/90 font-semibold">
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
