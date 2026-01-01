"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import {
  Globe,
  MapPin,
  Building2,
  Users,
  ChevronDown,
  ArrowUpRight,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  HeroRankLensSnapshot,
  RankTileScope,
  RankTile,
  BenchmarkOption,
} from "@/lib/rankings/hero-rank-lens"

// ============================================================================
// SCOPE CONFIG
// ============================================================================

const SCOPE_CONFIG: Record<RankTileScope, { icon: typeof Globe; label: string; color: string }> = {
  global: { icon: Globe, label: "Global", color: "text-emerald-400" },
  country: { icon: MapPin, label: "Country", color: "text-sky-400" },
  city: { icon: Building2, label: "City", color: "text-amber-400" },
  team: { icon: Users, label: "Team", color: "text-violet-400" },
}

const SCOPE_ORDER: RankTileScope[] = ["global", "country", "city", "team"]

// ============================================================================
// LOCAL STORAGE KEY
// ============================================================================

const STORAGE_KEY_PREFIX = "evergo-rank-lens-benchmark-"

function getStoredBenchmarkId(sportId: string): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${sportId}`)
}

function storeBenchmarkId(sportId: string, benchmarkId: string | null): void {
  if (typeof window === "undefined") return
  const key = `${STORAGE_KEY_PREFIX}${sportId}`
  if (benchmarkId === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, benchmarkId)
  }
}

// ============================================================================
// TYPES
// ============================================================================

interface HeroRankLensProps {
  snapshot: HeroRankLensSnapshot
  className?: string
}

// ============================================================================
// RANK TILE COMPONENT
// ============================================================================

function RankTileCard({
  tile,
  compact = false,
}: {
  tile: RankTile
  compact?: boolean
}) {
  const config = SCOPE_CONFIG[tile.scope]
  const Icon = config.icon
  const hasRank = tile.rank !== null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl",
        "bg-white/5 ring-1 ring-white/10 backdrop-blur-sm",
        "transition-all hover:bg-white/10",
        compact ? "p-3" : "p-4"
      )}
      data-testid={`rank-tile-${tile.scope}`}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-white/10 mb-2",
          compact ? "h-8 w-8" : "h-10 w-10"
        )}
      >
        <Icon
          className={cn(
            hasRank ? config.color : "text-slate-500",
            compact ? "h-4 w-4" : "h-5 w-5"
          )}
        />
      </div>

      {/* Label */}
      <div className="text-[10px] font-medium uppercase tracking-wider text-white/50 mb-1">
        {config.label}
      </div>

      {/* Rank or CTA */}
      {hasRank ? (
        <>
          <div
            className={cn(
              "font-bold tabular-nums text-white",
              compact ? "text-lg" : "text-xl"
            )}
          >
            #{tile.rank}
          </div>
          <div className="text-[10px] text-white/40">
            of {tile.total.toLocaleString()}
          </div>
          {tile.scopeValue && (
            <div className="mt-1 text-[10px] text-white/50 truncate max-w-[80px]">
              {tile.scopeValue}
            </div>
          )}
        </>
      ) : (
        <Link
          href="/settings/profile"
          className={cn(
            "text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors",
            "whitespace-nowrap"
          )}
        >
          {tile.missingField === "country" && "Set location"}
          {tile.missingField === "city" && "Add city"}
          {tile.missingField === "team" && "Join team"}
          {!tile.missingField && "Add data"}
        </Link>
      )}
    </div>
  )
}

// ============================================================================
// BENCHMARK DROPDOWN
// ============================================================================

function BenchmarkDropdown({
  benchmarks,
  currentBenchmark,
  onSelect,
  isPending,
}: {
  benchmarks: BenchmarkOption[]
  currentBenchmark: BenchmarkOption | null
  onSelect: (benchmarkId: string | null) => void
  isPending: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isOpen])

  const displayName = currentBenchmark?.name ?? "Sport Index"

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full",
          "bg-white/10 px-3 py-1.5",
          "text-sm font-medium text-white",
          "hover:bg-white/15 transition-colors",
          "ring-1 ring-white/10",
          isPending && "opacity-60"
        )}
        data-testid="benchmark-dropdown-trigger"
      >
        <Trophy className="h-3.5 w-3.5 text-orange-400" />
        <span className="truncate max-w-[120px]">{displayName}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-white/60 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 mt-2 z-50",
            "min-w-[180px] max-w-[240px]",
            "rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl",
            "shadow-xl shadow-black/30",
            "py-1 overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
          data-testid="benchmark-dropdown-menu"
        >
          {/* Sport Index option */}
          <button
            type="button"
            onClick={() => {
              onSelect(null)
              setIsOpen(false)
            }}
            className={cn(
              "w-full px-3 py-2 text-left text-sm",
              "hover:bg-white/10 transition-colors",
              currentBenchmark === null
                ? "text-orange-400 font-medium"
                : "text-white/80"
            )}
          >
            Sport Index
          </button>

          {/* Separator */}
          {benchmarks.length > 0 && (
            <div className="my-1 border-t border-white/10" />
          )}

          {/* Benchmark options */}
          {benchmarks.map((benchmark) => (
            <button
              key={benchmark.id}
              type="button"
              onClick={() => {
                onSelect(benchmark.id)
                setIsOpen(false)
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm",
                "hover:bg-white/10 transition-colors",
                currentBenchmark?.id === benchmark.id
                  ? "text-orange-400 font-medium"
                  : "text-white/80"
              )}
            >
              <div className="truncate">{benchmark.name}</div>
              <div className="text-[10px] text-white/40">{benchmark.unit}</div>
            </button>
          ))}

          {benchmarks.length === 0 && (
            <div className="px-3 py-2 text-xs text-white/40">
              No benchmarks available
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HeroRankLens({ snapshot, className }: HeroRankLensProps) {
  const [data, setData] = useState(snapshot)
  const [isPending, startTransition] = useTransition()

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedBenchmarkId = getStoredBenchmarkId(snapshot.sport.id)
    // If we have a stored benchmark that differs from current, trigger a refresh
    if (
      storedBenchmarkId !== null &&
      storedBenchmarkId !== (snapshot.currentBenchmark?.id ?? null)
    ) {
      // Find if this benchmark exists in the list
      const benchmark = snapshot.benchmarks.find((b) => b.id === storedBenchmarkId)
      if (benchmark) {
        handleBenchmarkChange(storedBenchmarkId)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBenchmarkChange(benchmarkId: string | null) {
    // Store preference
    storeBenchmarkId(snapshot.sport.id, benchmarkId)

    // Fetch new data via API
    startTransition(async () => {
      try {
        const response = await fetch("/api/home/hero-ranks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sportId: snapshot.sport.id,
            benchmarkId,
          }),
        })

        if (response.ok) {
          const newSnapshot = await response.json()
          setData(newSnapshot)
        }
      } catch (error) {
        console.error("Failed to fetch rank lens data:", error)
      }
    })
  }

  return (
    <div
      className={cn(
        // Premium glass container
        "mx-auto w-full max-w-[1100px]",
        "rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl",
        "shadow-2xl shadow-black/20",
        "overflow-hidden",
        className
      )}
      data-testid="hero-rank-lens"
    >
      {/* Header Row: Title + Sport Pill + Benchmark Dropdown */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Rankings
          </h2>
          {/* Sport Pill */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full",
              "bg-emerald-500/20 px-2.5 py-1",
              "text-xs font-medium text-emerald-300",
              "ring-1 ring-emerald-500/30"
            )}
          >
            {data.sport.name}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Benchmark Dropdown */}
          <BenchmarkDropdown
            benchmarks={data.benchmarks}
            currentBenchmark={data.currentBenchmark}
            onSelect={handleBenchmarkChange}
            isPending={isPending}
          />

          {/* Full Rankings Link */}
          <Link
            href={`/leaderboard?sport=${data.sport.slug}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            Full rankings <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Rank Tiles Grid - 4 columns on desktop, 2x2 on mobile */}
      <div className="p-4 md:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SCOPE_ORDER.map((scope) => (
            <RankTileCard
              key={scope}
              tile={data.tiles[scope]}
              compact={false}
            />
          ))}
        </div>
      </div>

      {/* Loading overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SERVER WRAPPER (for initial render)
// ============================================================================

export function HeroRankLensServer({
  snapshot,
  className,
}: {
  snapshot: HeroRankLensSnapshot
  className?: string
}) {
  return <HeroRankLens snapshot={snapshot} className={className} />
}
