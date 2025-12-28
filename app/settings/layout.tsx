"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { User, Dumbbell, CreditCard, Bell, Shield, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsNavItems = [
  {
    href: "/settings/profile",
    icon: User,
    label: "Profile",
    description: "Name, bio, photos",
  },
  {
    href: "/settings/sports",
    icon: Dumbbell,
    label: "Sports",
    description: "Your sports & skill levels",
  },
  {
    href: "/settings/subscription",
    icon: CreditCard,
    label: "Subscription",
    description: "Manage your plan",
  },
  {
    href: "/notifications/settings",
    icon: Bell,
    label: "Notifications",
    description: "Email & push preferences",
  },
  {
    href: "/settings/account",
    icon: Shield,
    label: "Account",
    description: "Security & privacy",
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-6xl py-6 px-4 md:px-6">
        {/* Back Link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-lg">Settings</h2>
              </div>
              <ul className="p-2">
                {settingsNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href ||
                    (item.href === "/settings/profile" && pathname === "/settings")

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          isActive
                            ? "bg-orange-50 text-orange-600"
                            : "text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5",
                          isActive ? "text-orange-500" : "text-slate-400"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm",
                            isActive ? "text-orange-600" : "text-slate-700"
                          )}>
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
