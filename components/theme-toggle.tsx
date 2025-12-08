"use client"

import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("w-9 h-9 rounded-full", className)} />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
        "hover:scale-110 active:scale-95",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun Icon - shows in dark mode (click to go light) */}
      <Sun
        className={cn(
          "absolute w-5 h-5 transition-all duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-0"
        )}
      />
      {/* Moon Icon - shows in light mode (click to go dark) */}
      <Moon
        className={cn(
          "absolute w-5 h-5 transition-all duration-300",
          isDark
            ? "opacity-0 -rotate-90 scale-0"
            : "opacity-100 rotate-0 scale-100"
        )}
      />
    </button>
  )
}

// Extended version with system option
export function ThemeToggleExtended({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ]

  return (
    <div className={cn("flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-full", className)}>
      {options.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "p-2 rounded-full transition-all",
              isActive
                ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
            aria-label={option.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}
