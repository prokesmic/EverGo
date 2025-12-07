"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  X,
  Clock,
  Users,
  Trophy,
  Target,
  User,
  TrendingUp,
  Loader2,
  ArrowLeft
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MobileSearchProps {
  open: boolean
  onClose: () => void
}

interface SearchResult {
  type: "user" | "team" | "challenge"
  id: string
  title: string
  subtitle?: string
  image?: string
  icon?: string
}

const SEARCH_FILTERS = [
  { id: "all", label: "All", icon: Search },
  { id: "users", label: "People", icon: User },
  { id: "teams", label: "Teams", icon: Users },
  { id: "challenges", label: "Challenges", icon: Target },
]

export function MobileSearch({ open, onClose }: MobileSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches from localStorage
  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("evergo_recent_searches")
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored))
        } catch (e) {
          setRecentSearches([])
        }
      }
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ q: query })
        if (filter !== "all") {
          params.set("type", filter)
        }

        const res = await fetch(`/api/search?${params}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch (e) {
        console.error("Search error:", e)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, filter])

  const saveRecentSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("evergo_recent_searches", JSON.stringify(updated))
  }, [recentSearches])

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query)
    onClose()

    switch (result.type) {
      case "user":
        router.push(`/profile/${result.id}`)
        break
      case "team":
        router.push(`/teams/${result.id}`)
        break
      case "challenge":
        router.push(`/challenges/${result.id}`)
        break
    }
  }

  const handleRecentClick = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("evergo_recent_searches")
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "user": return <User className="w-4 h-4" />
      case "team": return <Users className="w-4 h-4" />
      case "challenge": return <Target className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-white lg:hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border-light pt-safe">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 shrink-0"
          onClick={onClose}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, teams, challenges..."
            className="w-full h-11 pl-10 pr-10 rounded-full bg-surface-secondary border-none text-base focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-text-muted/20 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border-light">
        {SEARCH_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === f.id
                ? "bg-brand-blue text-white"
                : "bg-surface-secondary text-text-secondary"
            )}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-safe">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
          </div>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="divide-y divide-border-light">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="w-full flex items-center gap-3 p-4 hover:bg-surface-secondary active:bg-surface-secondary transition-colors text-left"
              >
                {result.image ? (
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={result.image} />
                    <AvatarFallback>{result.title[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-muted">
                    {result.icon ? (
                      <span className="text-2xl">{result.icon}</span>
                    ) : (
                      getResultIcon(result.type)
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-sm text-text-muted truncate">{result.subtitle}</p>
                  )}
                </div>
                <div className="text-xs text-text-muted capitalize bg-surface-secondary px-2 py-1 rounded">
                  {result.type}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
            <p className="text-text-secondary font-medium">No results found</p>
            <p className="text-sm text-text-muted mt-1">Try different keywords</p>
          </div>
        )}

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-brand-blue font-medium"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => handleRecentClick(search)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-text-primary">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {!query && (
          <div className="p-4 border-t border-border-light">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" />
              Trending
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Running", "Marathon", "Cycling Club", "Morning Run", "5K Challenge"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-2 bg-surface-secondary rounded-full text-sm text-text-secondary hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
