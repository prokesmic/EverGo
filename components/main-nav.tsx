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
import { Home, Trophy, Users, Calendar, Swords, Bell, Sparkles, ChevronDown, Settings, PlusCircle, UserCircle, Pencil, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchCommand } from "@/components/search-command"
import { getMyProfileHref, getSettingsHref } from "@/lib/routes/user"

// V6 Navigation configuration - Competition-first hierarchy
const primaryLinks = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/rankings", label: "Rankings", icon: Trophy },
    { href: "/gauntlets", label: "Gauntlets", icon: Swords },
    { href: "/seasons", label: "Seasons", icon: Calendar },
]

const moreLinks = [
    { href: "/discover", label: "Discover", icon: Compass, description: "Find athletes and teams" },
    { href: "/teams", label: "Teams", icon: Users, description: "Join or manage teams" },
    { href: "/settings/profile", label: "Settings", icon: Settings, description: "Account preferences" },
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
        <header data-testid="desktop-nav" className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border hidden lg:block">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/home" className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-foreground">
                            ⚡EverGo
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary">
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
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
                                    "relative flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:outline-none",
                                    isDropdownActive(moreHrefs) && "bg-muted text-foreground"
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
                                            isActive(item.href) && "bg-muted"
                                        )}>
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className="text-xs text-muted-foreground">{item.description}</div>
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
                            <Button className="gap-2 rounded-full px-4">
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
                            <Button asChild variant="secondary" className="rounded-full gap-2">
                                <Link
                                    href="/activity/create"
                                    data-testid="desktop-log-activity"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Log Activity</span>
                                </Link>
                            </Button>

                            {/* Notifications */}
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted rounded-full relative" asChild>
                                <Link href="/notifications">
                                    <Bell className="h-5 w-5" />
                                </Link>
                            </Button>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border-2 border-border p-0 overflow-hidden hover:border-primary/30 transition-all">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
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
                                        <Link href={getMyProfileHref(session.user)} className="flex items-center gap-2">
                                            <UserCircle className="h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={getSettingsHref()} className="flex items-center gap-2">
                                            <Pencil className="h-4 w-4" />
                                            Edit Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/notifications/settings" className="flex items-center gap-2">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </Link>
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
                            <Button variant="ghost" asChild className="text-sm font-medium">
                                <Link href="/login">Log in</Link>
                            </Button>
                            <Button asChild className="rounded-full gap-2">
                                <Link href="/register">
                                    <Sparkles className="w-4 h-4" />
                                    Sign Up Free
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
