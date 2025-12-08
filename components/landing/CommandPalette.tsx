"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  Search,
  ArrowRight,
  Trophy,
  Users,
  Activity,
  Settings,
  LogIn,
  UserPlus,
  Home,
  Target,
  Map,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

type CommandItem = {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  shortcut?: string
  action: () => void
  category: string
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: "register",
      label: "Get Started Free",
      description: "Create your athlete profile",
      icon: UserPlus,
      action: () => router.push("/register"),
      category: "Quick Actions",
    },
    {
      id: "login",
      label: "Log In",
      description: "Access your account",
      icon: LogIn,
      action: () => router.push("/login"),
      category: "Quick Actions",
    },
    // Navigation
    {
      id: "home",
      label: "Home",
      description: "Go to homepage",
      icon: Home,
      action: () => router.push("/"),
      category: "Navigation",
    },
    {
      id: "features",
      label: "Features",
      description: "Explore all features",
      icon: Sparkles,
      action: () => {
        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
        setIsOpen(false)
      },
      category: "Navigation",
    },
    {
      id: "how-it-works",
      label: "How It Works",
      description: "Learn how EverGo works",
      icon: Activity,
      action: () => {
        document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
        setIsOpen(false)
      },
      category: "Navigation",
    },
    {
      id: "compare",
      label: "Compare",
      description: "See how we stack up",
      icon: Target,
      action: () => {
        document.getElementById("comparison")?.scrollIntoView({ behavior: "smooth" })
        setIsOpen(false)
      },
      category: "Navigation",
    },
    {
      id: "testimonials",
      label: "Reviews",
      description: "What athletes are saying",
      icon: Users,
      action: () => {
        document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" })
        setIsOpen(false)
      },
      category: "Navigation",
    },
    // Features
    {
      id: "rankings",
      label: "Global Rankings",
      description: "Compete at all levels",
      icon: Trophy,
      action: () => router.push("/register"),
      category: "Features",
    },
    {
      id: "partners",
      label: "Find Training Partners",
      description: "Connect with local athletes",
      icon: Users,
      action: () => router.push("/register"),
      category: "Features",
    },
    {
      id: "routes",
      label: "Discover Routes",
      description: "Find popular routes nearby",
      icon: Map,
      action: () => router.push("/register"),
      category: "Features",
    },
  ]

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(search.toLowerCase())
  )

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = []
    }
    acc[cmd.category].push(cmd)
    return acc
  }, {} as Record<string, CommandItem[]>)

  const flatFilteredCommands = Object.values(groupedCommands).flat()

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }

      if (!isOpen) return

      // Close with Escape
      if (e.key === "Escape") {
        setIsOpen(false)
        setSearch("")
      }

      // Navigate with arrows
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < flatFilteredCommands.length - 1 ? prev + 1 : 0
        )
      }

      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : flatFilteredCommands.length - 1
        )
      }

      // Execute with Enter
      if (e.key === "Enter" && flatFilteredCommands[selectedIndex]) {
        flatFilteredCommands[selectedIndex].action()
        setIsOpen(false)
        setSearch("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, flatFilteredCommands])

  // Close on click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false)
      setSearch("")
    }
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 outline-none text-lg text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">esc</kbd>
            <span className="text-gray-400 text-xs">to close</span>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {Object.entries(groupedCommands).length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              No commands found for &ldquo;{search}&rdquo;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {category}
                </div>
                {items.map((cmd) => {
                  const Icon = cmd.icon
                  const index = flatFilteredCommands.findIndex((c) => c.id === cmd.id)
                  const isSelected = index === selectedIndex

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action()
                        setIsOpen(false)
                        setSearch("")
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        isSelected ? "bg-brand-blue/5" : "hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        isSelected ? "bg-brand-blue text-white" : "bg-gray-100 text-gray-600"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium",
                          isSelected ? "text-brand-blue" : "text-gray-900"
                        )}>
                          {cmd.label}
                        </div>
                        {cmd.description && (
                          <div className="text-sm text-gray-500 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4",
                        isSelected ? "text-brand-blue" : "text-gray-300"
                      )} />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↵</kbd>
              to select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Trigger button to show in header
export function CommandPaletteTrigger({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const openPalette = useCallback(() => {
    // Dispatch a keyboard event to open the palette
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={openPalette}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
        className
      )}
    >
      <Search className="w-4 h-4" />
      <span className="hidden lg:inline">Search</span>
      <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded bg-white/20">
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  )
}
