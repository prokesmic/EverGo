"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { User, CreditCard, Bell, Shield, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppContainer } from "@/components/layout/AppContainer"
import { MobileNavSelect } from "@/components/layout/MobileNavSelect"

const settingsNavItems = [
  {
    href: "/settings/profile",
    icon: User,
    label: "Profile",
    description: "Name, bio, photos",
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
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <AppContainer size="default" className="py-6 sm:py-8">
        {/* Back Link */}
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        {/* Mobile Navigation Select */}
        <MobileNavSelect items={settingsNavItems} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Sidebar Navigation - Hidden on mobile */}
          <aside className="hidden lg:block shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
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
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </AppContainer>
    </div>
  )
}
