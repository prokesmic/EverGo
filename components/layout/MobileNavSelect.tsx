"use client"

import { useRouter, usePathname } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavItem {
  href: string
  icon: LucideIcon
  label: string
  description?: string
}

interface MobileNavSelectProps {
  items: NavItem[]
  className?: string
}

export function MobileNavSelect({ items, className }: MobileNavSelectProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentItem = items.find((item) => pathname === item.href) || items[0]

  return (
    <div data-testid="mobile-nav-select" className={cn("lg:hidden", className)}>
      <Select
        value={currentItem.href}
        onValueChange={(value) => router.push(value)}
      >
        <SelectTrigger className="w-full h-12 bg-white border-slate-200">
          <SelectValue>
            <div className="flex items-center gap-3">
              <currentItem.icon className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{currentItem.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <SelectItem
                key={item.href}
                value={item.href}
                className="h-12 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-orange-500" : "text-slate-400"
                    )}
                  />
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isActive ? "text-orange-600" : "text-slate-700"
                      )}
                    >
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="text-xs text-slate-400">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
