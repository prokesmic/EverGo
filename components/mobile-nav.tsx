"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, Users, PlusSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const pathname = usePathname()

    const navItems = [
        { href: "/home", label: "Home", icon: Home },
        { href: "/rankings", label: "Rankings", icon: Trophy },
        { href: "/activity/new", label: "Record", icon: PlusSquare },
        { href: "/teams", label: "Teams", icon: Users },
        { href: "/profile", label: "Profile", icon: User },
    ]

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background md:hidden">
            <div className="grid h-16 grid-cols-5">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors hover:text-foreground/80",
                            pathname?.startsWith(item.href) ? "text-brand-blue" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}
