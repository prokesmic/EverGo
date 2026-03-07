"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Users, Trophy, Target, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type SearchType = "all" | "users" | "teams" | "challenges"
type SearchSort = "relevance" | "recent" | "popular"

interface SearchResult {
  type: "user" | "team" | "challenge"
  id: string
  title: string
  subtitle?: string
  image?: string | null
  icon?: string
}

const FILTERS: Array<{ value: SearchType; label: string; icon: ComponentType<{ className?: string }> }> = [
  { value: "all", label: "All", icon: Search },
  { value: "users", label: "Athletes", icon: Users },
  { value: "teams", label: "Teams", icon: Trophy },
  { value: "challenges", label: "Challenges", icon: Target },
]

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuery = searchParams.get("q") ?? ""
  const initialType = (searchParams.get("type") as SearchType) ?? "all"
  const initialCity = searchParams.get("city") ?? ""
  const initialSport = searchParams.get("sport") ?? ""
  const initialSort = (searchParams.get("sort") as SearchSort) ?? "relevance"

  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState<SearchType>(FILTERS.some((f) => f.value === initialType) ? initialType : "all")
  const [city, setCity] = useState(initialCity)
  const [sport, setSport] = useState(initialSport)
  const [sort, setSort] = useState<SearchSort>(
    initialSort === "recent" || initialSort === "popular" ? initialSort : "relevance"
  )
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    setQuery(initialQuery)
    setCity(initialCity)
    setSport(initialSport)
    setSort(initialSort === "recent" || initialSort === "popular" ? initialSort : "relevance")
  }, [initialQuery, initialCity, initialSport, initialSort])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          type,
          sort,
          limit: "24",
        })
        if (city.trim()) params.set("city", city.trim())
        if (sport.trim()) params.set("sport", sport.trim())
        const res = await fetch(`/api/search?${params.toString()}`)
        const data = await res.json()
        setResults(Array.isArray(data.results) ? data.results : [])
      } catch (error) {
        console.error("Search failed", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, type, city, sport, sort])

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString())
    if (query.trim()) next.set("q", query.trim())
    else next.delete("q")
    if (type !== "all") next.set("type", type)
    else next.delete("type")
    if (city.trim()) next.set("city", city.trim())
    else next.delete("city")
    if (sport.trim()) next.set("sport", sport.trim())
    else next.delete("sport")
    if (sort !== "relevance") next.set("sort", sort)
    else next.delete("sort")

    const nextQuery = next.toString()
    const targetUrl = nextQuery ? `/search?${nextQuery}` : "/search"
    const currentUrl = searchParams.toString() ? `/search?${searchParams.toString()}` : "/search"
    if (targetUrl !== currentUrl) {
      router.replace(targetUrl, { scroll: false })
    }
  }, [query, type, city, sport, sort, router, searchParams])

  const groupedResults = useMemo(() => {
    return {
      users: results.filter((result) => result.type === "user"),
      teams: results.filter((result) => result.type === "team"),
      challenges: results.filter((result) => result.type === "challenge"),
    }
  }, [results])

  const resolvePath = (result: SearchResult): string => {
    if (result.type === "user") return `/profile/${result.id}`
    if (result.type === "team") return `/teams/${result.id}`
    return `/challenges/${result.id}`
  }

  const renderResult = (result: SearchResult) => (
    <button
      key={`${result.type}-${result.id}`}
      className="w-full rounded-xl border border-border-light bg-card px-4 py-3 text-left transition hover:border-primary/40 hover:bg-muted/40"
      onClick={() => router.push(resolvePath(result))}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={result.image ?? ""} />
          <AvatarFallback>{result.title?.slice(0, 1) ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-semibold text-foreground">{result.title}</div>
          {result.subtitle && (
            <div className="truncate text-sm text-muted-foreground">{result.subtitle}</div>
          )}
        </div>
      </div>
    </button>
  )

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:px-6">
      <div className="mx-auto max-w-5xl space-y-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search athletes, teams, and challenges..."
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  size="sm"
                  variant="outline"
                  onClick={() => setType(filter.value)}
                  className={cn(type === filter.value && "border-primary bg-primary/10 text-primary")}
                >
                  <filter.icon className="mr-1.5 h-4 w-4" />
                  {filter.label}
                </Button>
              ))}
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City filter (optional)"
              />
              <Input
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="Sport filter (optional, e.g. running)"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "relevance", label: "Best Match" },
                { id: "recent", label: "Most Recent" },
                { id: "popular", label: "Most Popular" },
              ].map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant="outline"
                  onClick={() => setSort(item.id as SearchSort)}
                  className={cn(sort === item.id && "border-primary bg-primary/10 text-primary")}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-border-light bg-card px-6 py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Searching...
          </div>
        )}

        {!loading && query.trim().length < 2 && (
          <div className="rounded-xl border border-dashed border-border-light bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            Type at least 2 characters to search.
          </div>
        )}

        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <div className="rounded-xl border border-dashed border-border-light bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            No results for "{query}".
          </div>
        )}

        {!loading && groupedResults.users.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Athletes</h2>
            <div className="grid gap-2">{groupedResults.users.map(renderResult)}</div>
          </section>
        )}

        {!loading && groupedResults.teams.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Teams</h2>
            <div className="grid gap-2">{groupedResults.teams.map(renderResult)}</div>
          </section>
        )}

        {!loading && groupedResults.challenges.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Challenges</h2>
            <div className="grid gap-2">{groupedResults.challenges.map(renderResult)}</div>
          </section>
        )}
      </div>
    </main>
  )
}
