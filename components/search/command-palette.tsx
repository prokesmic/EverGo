"use client"

import { useEffect, useState, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  User,
  Users,
  Trophy,
  Target,
  MapPin,
  TrendingUp,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SearchResult {
  id: string
  type: "user" | "team" | "community" | "challenge"
  title: string
  subtitle?: string
  avatarUrl?: string
  icon?: string
  url: string
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Keyboard shortcut to open/close
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }

      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search API call with debounce
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      } catch (error) {
        console.error("Search error:", error)
        toast.error("Search failed. Please try again.")
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % results.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + results.length) % results.length)
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault()
        handleSelect(results[selectedIndex])
      }
    },
    [results, selectedIndex]
  )

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    router.push(result.url)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4" />
      case "team":
        return <Users className="w-4 h-4" />
      case "community":
        return <Users className="w-4 h-4" />
      case "challenge":
        return <Trophy className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "user":
        return "Athlete"
      case "team":
        return "Team"
      case "community":
        return "Community"
      case "challenge":
        return "Challenge"
      default:
        return ""
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle transition-colors text-sm text-text-muted"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-surface-tertiary border border-border-medium rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 max-w-2xl overflow-hidden">
          <div className="flex flex-col max-h-[600px]">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
              <Search className="w-5 h-5 text-text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search athletes, teams, communities, challenges..."
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                autoFocus
              />
              {loading && <Loader2 className="w-4 h-4 animate-spin text-text-muted" />}
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {query.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
                  <h3 className="font-semibold text-text-primary mb-2">
                    Search EverGo
                  </h3>
                  <p className="text-sm text-text-muted">
                    Find athletes, teams, communities, and challenges
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                    <kbd className="px-2 py-1 bg-surface-secondary border border-border-medium rounded font-mono">
                      ⌘K
                    </kbd>
                    <span>to open</span>
                  </div>
                </div>
              )}

              {query.length > 0 && query.length < 2 && (
                <div className="p-8 text-center text-sm text-text-muted">
                  Type at least 2 characters to search
                </div>
              )}

              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-text-muted opacity-50" />
                  <h3 className="font-semibold text-text-primary mb-2">
                    No results found
                  </h3>
                  <p className="text-sm text-text-muted">
                    Try searching with different keywords
                  </p>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((result, index) => {
                    const initials = result.title
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)

                    return (
                      <button
                        key={result.id}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          selectedIndex === index
                            ? "bg-surface-secondary"
                            : "hover:bg-surface-secondary/50"
                        }`}
                      >
                        {result.type === "user" ? (
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage
                              src={result.avatarUrl || undefined}
                              alt={result.title}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-surface-tertiary text-brand-primary">
                            {getIcon(result.type)}
                          </div>
                        )}

                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary truncate">
                              {result.title}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-tertiary text-text-muted shrink-0">
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          {result.subtitle && (
                            <div className="text-sm text-text-muted truncate flex items-center gap-1 mt-0.5">
                              {result.subtitle}
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-text-muted shrink-0">
                          Enter
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="px-4 py-2 border-t border-border-subtle bg-surface-secondary text-xs text-text-muted flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-tertiary border border-border-medium rounded font-mono">
                    ↑↓
                  </kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-tertiary border border-border-medium rounded font-mono">
                    ↵
                  </kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-tertiary border border-border-medium rounded font-mono">
                    Esc
                  </kbd>
                  <span>Close</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
